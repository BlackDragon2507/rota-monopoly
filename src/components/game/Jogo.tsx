import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { Carteira } from "./Painel";
import { AvisoCard, type Aviso } from "./AvisoCard";
import { PainelDados } from "./Dados";
import { PlacarFinal } from "./PlacarFinal";
import { CATEGORIA_LABEL, EVENTOS, TABULEIRO } from "@/game/data";
import { CORES, type Jogador } from "@/game/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dices, RotateCcw } from "lucide-react";

const SALDO_INICIAL = 150000;
const SALARIO = 20000;

const novosJogadores = (): Jogador[] => [
  { id: 0, nome: "Você", cor: CORES[0]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: false, falido: false, pontos: 0, rodadas: 0 },
  { id: 1, nome: "TransBrasil", cor: CORES[1]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false, pontos: 0, rodadas: 0 },
  { id: 2, nome: "NavePort", cor: CORES[2]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false, pontos: 0, rodadas: 0 },
  { id: 3, nome: "RailMax", cor: CORES[3]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false, pontos: 0, rodadas: 0 },
];

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Jogo() {
  const [jogadores, setJogadores] = useState<Jogador[]>(novosJogadores);
  const [donos, setDonos] = useState<Record<number, number | undefined>>({});
  const [atual, setAtual] = useState(0);
  const [dados, setDados] = useState<[number, number]>([1, 1]);
  const [rolando, setRolando] = useState(false);
  const [girando, setGirando] = useState(false);
  const [passos, setPassos] = useState<number | null>(null);
  const [andados, setAndados] = useState(0);
  const [compra, setCompra] = useState<number | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [esperandoOk, setEsperandoOk] = useState(false);
  const [fim, setFim] = useState(false);

  const ref = useRef({ jogadores, donos, atual, compra, esperandoOk });
  ref.current = { jogadores, donos, atual, compra, esperandoOk };
  const ocupadoRef = useRef(false);
  const rolandoRef = useRef(false);




  const ajustar = useCallback((id: number, delta: number) => {
    setJogadores((js) =>
      js.map((j) => (j.id === id ? { ...j, dinheiro: j.dinheiro + delta } : j)),
    );
  }, []);

  const comprar = useCallback(
    (idx: number, id: number) => {
      const tile = TABULEIRO[idx];
      if (!tile || tile.kind !== "prop") return;
      ajustar(id, -tile.preco);
      setDonos((d) => ({ ...d, [idx]: id }));
      const nome = ref.current.jogadores.find((j) => j.id === id)?.nome;
    },
    [ajustar],
  );

  const mostrar = useCallback(
    async (a: Aviso) => {
      setAviso(a);
      await espera(4000);
      setAviso(null);
    },
    [],
  );

  const resolver = useCallback(
    async (jogadorId: number, idx: number): Promise<boolean> => {
      const tile = TABULEIRO[idx];
      const jog = ref.current.jogadores.find((j) => j.id === jogadorId)!;
      if (!tile) return false;

      const avisoManual = (a: Aviso) => {
        setAviso(a);
        setEsperandoOk(true);
      };

      if (tile.kind === "prop") {
        const cat = CATEGORIA_LABEL[tile.categoria];
        const dono = ref.current.donos[idx];
        if (dono === undefined) {
          if (jog.cpu) {
            if (jog.dinheiro > tile.preco * 1.6) {
              comprar(idx, jogadorId);
              await mostrar({
                titulo: tile.nome,
                subtitulo: `${cat} · Compra`,
                texto: `${jog.nome} adquiriu este ativo e passa a cobrar frete de quem parar aqui.`,
                detalhe: `Preço R$ ${tile.preco} · Frete cobrado R$ ${tile.aluguel}`,
                delta: -tile.preco,
                tom: "neutro",
                icone: tile.categoria,
                jogadorId,
              });
            } else {
              await mostrar({
                titulo: tile.nome,
                subtitulo: `${cat} · Livre`,
                texto: `${jog.nome} dispensou a compra por falta de caixa. O ativo continua disponível.`,
                detalhe: `Preço R$ ${tile.preco} · Frete R$ ${tile.aluguel}`,
                tom: "neutro",
                icone: tile.categoria,
                jogadorId,
              });
            }
            return false;
          } else {
            setCompra(idx);
            return true;
          }
        } else if (dono !== jogadorId) {
          const donoJog = ref.current.jogadores.find((j) => j.id === dono)!;
          ajustar(jogadorId, -tile.aluguel);
          ajustar(dono, tile.aluguel);
          if (jog.cpu) {
            await mostrar({
              titulo: tile.nome,
              subtitulo: `${cat} · Frete`,
              texto: `Este ativo pertence a ${donoJog.nome}. ${jog.nome} precisou pagar o frete da operação.`,
              detalhe: `Valor transferido para ${donoJog.nome}: R$ ${tile.aluguel}`,
              delta: -tile.aluguel,
              tom: "ruim",
              icone: "frete",
              jogadorId,
            });
            return false;
          }
          avisoManual({
            titulo: tile.nome,
            subtitulo: `${cat} · Frete`,
            texto: `Este ativo pertence a ${donoJog.nome}. ${jog.nome} precisou pagar o frete da operação.`,
            detalhe: `Valor transferido para ${donoJog.nome}: R$ ${tile.aluguel}`,
            delta: -tile.aluguel,
            tom: "ruim",
            icone: "frete",
            jogadorId,
          });
          return true;
        } else {
          if (jog.cpu) {
            await mostrar({
              titulo: tile.nome,
              subtitulo: `${cat} · Ativo próprio`,
              texto: `${jog.nome} opera em ativo próprio: nenhum frete é cobrado.`,
              detalhe: `Frete cobrado dos concorrentes: R$ ${tile.aluguel}`,
              tom: "neutro",
              icone: tile.categoria,
              jogadorId,
            });
            return false;
          }
          avisoManual({
            titulo: tile.nome,
            subtitulo: `${cat} · Ativo próprio`,
            texto: `${jog.nome} opera em ativo próprio: nenhum frete é cobrado.`,
            detalhe: `Frete cobrado dos concorrentes: R$ ${tile.aluguel}`,
            tom: "neutro",
            icone: tile.categoria,
            jogadorId,
          });
          return true;
        }
      } else if (tile.kind === "taxa") {
        ajustar(jogadorId, -tile.valor);
        if (jog.cpu) {
          await mostrar({
            titulo: tile.nome,
            subtitulo: "Cobrança obrigatória",
            texto: `${jog.nome} parou numa casa de cobrança e teve que pagar imediatamente.`,
            detalhe: `Débito de R$ ${tile.valor} descontado do caixa.`,
            delta: -tile.valor,
            tom: "ruim",
            icone: "taxa",
            jogadorId,
          });
          return false;
        }
        avisoManual({
          titulo: tile.nome,
          subtitulo: "Cobrança obrigatória",
          texto: `${jog.nome} parou numa casa de cobrança e teve que pagar imediatamente.`,
          detalhe: `Débito de R$ ${tile.valor} descontado do caixa.`,
          delta: -tile.valor,
          tom: "ruim",
          icone: "taxa",
          jogadorId,
        });
        return true;
      } else if (tile.kind === "bonus") {
        ajustar(jogadorId, tile.valor);
        if (jog.cpu) {
          await mostrar({
            titulo: tile.nome,
            subtitulo: "Receita extra",
            texto: `${jog.nome} fechou uma operação lucrativa e recebeu um pagamento extra.`,
            detalhe: `Crédito de R$ ${tile.valor} no caixa.`,
            delta: tile.valor,
            tom: "bom",
            icone: "bonus",
            jogadorId,
          });
          return false;
        }
        avisoManual({
          titulo: tile.nome,
          subtitulo: "Receita extra",
          texto: `${jog.nome} fechou uma operação lucrativa e recebeu um pagamento extra.`,
          detalhe: `Crédito de R$ ${tile.valor} no caixa.`,
          delta: tile.valor,
          tom: "bom",
          icone: "bonus",
          jogadorId,
        });
        return true;
      } else if (tile.kind === "evento") {
        const ev = EVENTOS[Math.floor(Math.random() * EVENTOS.length)]!;
        ajustar(jogadorId, ev.delta);
        if (jog.cpu) {
          await mostrar({
            titulo: "Boletim Logístico",
            subtitulo: ev.delta >= 0 ? "Evento favorável" : "Evento adverso",
            texto: ev.texto,
            detalhe:
              ev.delta >= 0
                ? `Impacto positivo de R$ ${ev.delta} no caixa de ${jog.nome}.`
                : `Impacto negativo de R$ ${Math.abs(ev.delta)} no caixa de ${jog.nome}.`,
            delta: ev.delta,
            tom: ev.delta >= 0 ? "bom" : "ruim",
            icone: "evento",
            jogadorId,
          });
          return false;
        }
        avisoManual({
          titulo: "Boletim Logístico",
          subtitulo: ev.delta >= 0 ? "Evento favorável" : "Evento adverso",
          texto: ev.texto,
          detalhe:
            ev.delta >= 0
              ? `Impacto positivo de R$ ${ev.delta} no caixa de ${jog.nome}.`
              : `Impacto negativo de R$ ${Math.abs(ev.delta)} no caixa de ${jog.nome}.`,
          delta: ev.delta,
          tom: ev.delta >= 0 ? "bom" : "ruim",
          icone: "evento",
          jogadorId,
        });
        return true;
      } else if (tile.kind === "parada") {
        if (jog.cpu) {
          await mostrar({
            titulo: tile.nome,
            subtitulo: "Parada técnica",
            texto: `${jog.nome} perdeu tempo aqui, mas nenhum valor foi cobrado.`,
            tom: "neutro",
            icone: "parada",
            jogadorId,
          });
          return false;
        }
        avisoManual({
          titulo: tile.nome,
          subtitulo: "Parada técnica",
          texto: `${jog.nome} perdeu tempo aqui, mas nenhum valor foi cobrado.`,
          tom: "neutro",
          icone: "parada",
          jogadorId,
        });
        return true;
      } else {
        if (jog.cpu) {
          await mostrar({
            titulo: tile.nome,
            subtitulo: "Hub logístico",
            texto: `${jog.nome} chegou ao hub. Ao completar a volta, recebe R$ ${SALARIO}.`,
            tom: "neutro",
            icone: "inicio",
            jogadorId,
          });
          return false;
        }
        avisoManual({
          titulo: tile.nome,
          subtitulo: "Hub logístico",
          texto: `${jog.nome} chegou ao hub. Ao completar a volta, recebe R$ ${SALARIO}.`,
          tom: "neutro",
          icone: "inicio",
          jogadorId,
        });
        return true;
      }
    },
    [ajustar, comprar, mostrar],
  );

  const proximoTurno = useCallback(() => {
    setJogadores((js) =>
      js.map((j) => {
        const falido = j.dinheiro < 0;
        const atualJogando = j.id === ref.current.atual;
        return {
          ...j,
          falido: falido || j.falido,
          rodadas: atualJogando && !falido ? j.rodadas + 1 : j.rodadas,
        };
      }),
    );
    setAtual((a) => {
      const js = ref.current.jogadores;
      let n = a;
      for (let k = 0; k < js.length; k++) {
        n = (n + 1) % js.length;
        const cand = js[n]!;
        if (!cand.falido && cand.dinheiro >= 0) return n;
      }
      return a;
    });
  }, []);

  const rolar = useCallback(async () => {
    if (ref.current.jogadores.every((j) => j.falido)) return;
    if (rolandoRef.current) return;
    rolandoRef.current = true;
    setRolando(true);

    setGirando(true);
    setAndados(0);
    setPassos(null);
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const total = d1 + d2;
    await espera(600);
    setDados([d1, d2]);
    setPassos(total);
    setGirando(false);
    const jog = ref.current.jogadores[ref.current.atual]!;
    await espera(500);

    let pos = jog.posicao;
    for (let s = 0; s < total; s++) {
      pos = (pos + 1) % TABULEIRO.length;
      if (pos === 0) {
        ajustar(jog.id, SALARIO);
      }
      const p = pos;
      setJogadores((js) => js.map((j) => (j.id === jog.id ? { ...j, posicao: p } : j)));
      setAndados(s + 1);
      await espera(200);
    }
    await espera(250);
    const precisaOk = await resolver(jog.id, pos);
    if (!precisaOk && ref.current.compra === null) {
      await espera(400);
      proximoTurno();
    }
    rolandoRef.current = false;
    setRolando(false);
  }, [ajustar, proximoTurno, resolver]);


  const confirmarAviso = useCallback(() => {
    setAviso(null);
    setEsperandoOk(false);
    proximoTurno();
  }, [proximoTurno]);

  // Turno automático da CPU
  useEffect(() => {
    if (fim || rolando || compra !== null || esperandoOk) return;
    const jog = jogadores[atual];
    if (!jog?.cpu || jog.falido) return;
    const t = setTimeout(() => {
      if (ocupadoRef.current) return;
      ocupadoRef.current = true;
      void (async () => {
        try {
          await rolar();
        } finally {
          ocupadoRef.current = false;
        }
      })();
    }, 700);
    return () => clearTimeout(t);
  }, [atual, jogadores, rolando, compra, esperandoOk, fim, rolar]);


  // Fim de jogo
  useEffect(() => {
    const vivos = jogadores.filter((j) => !j.falido && j.dinheiro >= 0);
    const todasVendidas = TABULEIRO.every(
      (t, i) => t.kind !== "prop" || donos[i] !== undefined,
    );
    const limiteRodadas = jogadores.every((j) => j.falido || j.rodadas >= 30);
    if ((vivos.length <= 1 || todasVendidas || limiteRodadas) && !fim) {
      setJogadores((js) => {
        const porDinheiro = [...js].sort((a, b) => b.dinheiro - a.dinheiro);
        const porAtivos = [...js].sort((a, b) => {
          const ativosA = TABULEIRO.filter((t, i) => t.kind === "prop" && donos[i] === a.id).length;
          const ativosB = TABULEIRO.filter((t, i) => t.kind === "prop" && donos[i] === b.id).length;
          return ativosB - ativosA;
        });
        const pontosDinheiro = new Map(porDinheiro.map((j, i) => [j.id, 3 - i]));
        const pontosAtivos = new Map(porAtivos.map((j, i) => [j.id, 3 - i]));
        return js.map((j) => ({
          ...j,
          pontos: Math.max(0, pontosDinheiro.get(j.id) ?? 0) + Math.max(0, pontosAtivos.get(j.id) ?? 0),
        }));
      });
      setFim(true);
    }
  }, [jogadores, donos, fim]);

  const reiniciar = () => {
    setJogadores(novosJogadores());
    setDonos({});
    setAtual(0);
    setCompra(null);
    setAviso(null);
    setEsperandoOk(false);
    setFim(false);
    setPassos(null);
    setAndados(0);
    setDados([1, 1]);
  };

  const humano = jogadores[0]!;
  const jogadorDaVez = jogadores[atual]!;
  const minhaVez = !jogadorDaVez.cpu && !rolando && compra === null && !esperandoOk && !fim;
  const tileCompra = compra !== null ? TABULEIRO[compra] : null;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden p-1 md:p-2 lg:grid lg:grid-cols-[1fr_300px] lg:gap-3 lg:p-3">
      <aside className="order-2 flex shrink-0 gap-2 overflow-x-auto pt-1 lg:order-2 lg:flex-col lg:gap-3 lg:overflow-visible lg:pt-0">
        <Carteira jogador={humano} />

        <div className="min-w-[180px] flex-1 rounded-2xl border border-border/60 bg-card/80 p-2 lg:min-w-0 lg:p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Vez de
              </p>
              <p className="font-display text-sm font-bold" style={{ color: jogadorDaVez.cor }}>
                {jogadorDaVez.nome}
              </p>
            </div>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[9px] text-muted-foreground">
              {girando
                ? "Rolando…"
                : rolando
                  ? "Movendo…"
                  : minhaVez
                    ? "Sua vez"
                    : esperandoOk
                      ? "Aguarde OK"
                      : "Aguarde…"}
            </span>
          </div>

          <PainelDados
            dados={dados}
            rolando={girando}
            passos={passos}
            andados={andados}
            casaNome={TABULEIRO[jogadorDaVez.posicao]?.nome ?? ""}
          />

          <div className="mt-2 flex items-center justify-center gap-2">
            <Button
              className="h-9 flex-1 gap-1.5 text-sm"
              disabled={!minhaVez}
              onClick={() => {
                void rolar();
              }}
            >
              <Dices className="size-4" /> {rolando ? "Rolando…" : "Rolar"}
            </Button>
            <Button variant="secondary" className="h-9 px-3" onClick={reiniciar} aria-label="Reiniciar partida">
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-w-[180px] flex-1 rounded-2xl border border-border/60 bg-card/80 p-2 lg:min-w-0 lg:p-3">
          <div className="mb-2 flex items-end justify-between">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              Rodada
            </p>
            <p className="font-display text-base font-bold leading-none text-foreground">
              {Math.min(30, Math.max(...jogadores.map((j) => j.rodadas)))}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/30</span>
            </p>
          </div>
          <div className="space-y-1">
            {jogadores.map((j) => {
              const pct = (j.rodadas / 30) * 100;
              return (
                <div key={j.id} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: j.cor }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10px] text-foreground/90 lg:text-xs">
                    {j.nome}
                  </span>
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary lg:w-16">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: j.cor }}
                    />
                  </div>
                  <span className="w-5 text-right text-[9px] text-muted-foreground">
                    {j.rodadas}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="order-1 flex min-h-0 flex-1 items-center justify-center overflow-hidden lg:order-1">
        <div className="relative flex h-full w-full items-center justify-center">
          <Board
            jogadores={jogadores}
            donos={donos}
            atual={atual}
            destaque={jogadorDaVez.posicao}
          />
          {aviso && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <AvisoCard
                aviso={aviso}
                jogadores={jogadores}
                onOk={!jogadorDaVez.cpu ? confirmarAviso : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={compra !== null} onOpenChange={() => {}}>
        <DialogContent>
          {tileCompra?.kind === "prop" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{tileCompra.nome}</DialogTitle>
                <DialogDescription>
                  {CATEGORIA_LABEL[tileCompra.categoria]} disponível por R${" "}
                  {tileCompra.preco}. Frete cobrado dos concorrentes: R${" "}
                  {tileCompra.aluguel}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCompra(null);
                    proximoTurno();
                  }}
                >
                  Passar
                </Button>
                <Button
                  disabled={humano.dinheiro < tileCompra.preco}
                  onClick={() => {
                    comprar(compra!, 0);
                    setCompra(null);
                    proximoTurno();
                  }}
                >
                  Comprar por R$ {tileCompra.preco}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={fim} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Fim de jogo</DialogTitle>
            <DialogDescription>
              Limite de 30 rodadas atingido. Veja como a pontuação foi calculada.
            </DialogDescription>
          </DialogHeader>
          <PlacarFinal jogadores={jogadores} donos={donos} />
          <DialogFooter>
            <Button onClick={reiniciar}>Jogar novamente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
