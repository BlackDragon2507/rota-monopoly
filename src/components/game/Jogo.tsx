import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { Carteira, Log, Ranking, patrimonio } from "./Painel";
import { AvisoCard, type Aviso } from "./AvisoCard";
import { PainelDados } from "./Dados";
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
import { Dices, RotateCcw, Trophy } from "lucide-react";

const SALDO_INICIAL = 1500;
const SALARIO = 200;

const novosJogadores = (): Jogador[] => [
  { id: 0, nome: "Você", cor: CORES[0]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: false, falido: false },
  { id: 1, nome: "TransBrasil", cor: CORES[1]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false },
  { id: 2, nome: "NavePort", cor: CORES[2]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false },
  { id: 3, nome: "RailMax", cor: CORES[3]!, dinheiro: SALDO_INICIAL, posicao: 0, cpu: true, falido: false },
];

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Jogo() {
  const [jogadores, setJogadores] = useState<Jogador[]>(novosJogadores);
  const [donos, setDonos] = useState<Record<number, number | undefined>>({});
  const [atual, setAtual] = useState(0);
  const [dados, setDados] = useState<[number, number]>([1, 1]);
  const [rolando, setRolando] = useState(false);
  const [passos, setPassos] = useState<number | null>(null);
  const [andados, setAndados] = useState(0);
  const [log, setLog] = useState<string[]>([
    "Bem-vindo ao RotaLog! Role os dados para expandir seu império logístico.",
  ]);
  const [compra, setCompra] = useState<number | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [fim, setFim] = useState(false);

  const ref = useRef({ jogadores, donos, atual });
  ref.current = { jogadores, donos, atual };

  const addLog = useCallback((t: string) => {
    setLog((l) => [t, ...l].slice(0, 40));
  }, []);

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
      addLog(`${nome} comprou ${tile.nome} por R$ ${tile.preco}.`);
    },
    [addLog, ajustar],
  );

  const mostrar = useCallback(
    async (a: Aviso) => {
      setAviso(a);
      await espera(1800);
      setAviso(null);
    },
    [],
  );

  const resolver = useCallback(
    async (jogadorId: number, idx: number) => {
      const tile = TABULEIRO[idx];
      const jog = ref.current.jogadores.find((j) => j.id === jogadorId)!;
      if (!tile) return;

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
              addLog(`${jog.nome} dispensou ${tile.nome}.`);
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
          } else {
            setCompra(idx);
            return;
          }
        } else if (dono !== jogadorId) {
          const donoJog = ref.current.jogadores.find((j) => j.id === dono)!;
          ajustar(jogadorId, -tile.aluguel);
          ajustar(dono, tile.aluguel);
          addLog(
            `${jog.nome} pagou R$ ${tile.aluguel} de frete a ${donoJog.nome} em ${tile.nome}.`,
          );
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
        } else {
          addLog(`${jog.nome} operou em ${tile.nome} (ativo próprio).`);
          await mostrar({
            titulo: tile.nome,
            subtitulo: `${cat} · Ativo próprio`,
            texto: `${jog.nome} opera em ativo próprio: nenhum frete é cobrado.`,
            detalhe: `Frete cobrado dos concorrentes: R$ ${tile.aluguel}`,
            tom: "neutro",
            icone: tile.categoria,
            jogadorId,
          });
        }
      } else if (tile.kind === "taxa") {
        ajustar(jogadorId, -tile.valor);
        addLog(`${jog.nome} pagou ${tile.nome}: R$ ${tile.valor}.`);
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
      } else if (tile.kind === "bonus") {
        ajustar(jogadorId, tile.valor);
        addLog(`${jog.nome} recebeu ${tile.nome}: +R$ ${tile.valor}.`);
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
      } else if (tile.kind === "evento") {
        const ev = EVENTOS[Math.floor(Math.random() * EVENTOS.length)]!;
        ajustar(jogadorId, ev.delta);
        addLog(`${jog.nome} — ${ev.texto} (${ev.delta > 0 ? "+" : ""}R$ ${ev.delta})`);
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
      } else if (tile.kind === "parada") {
        addLog(`${jog.nome} parou em ${tile.nome}. Nada acontece.`);
        await mostrar({
          titulo: tile.nome,
          subtitulo: "Parada técnica",
          texto: `${jog.nome} perdeu tempo aqui, mas nenhum valor foi cobrado.`,
          tom: "neutro",
          icone: "parada",
          jogadorId,
        });
      } else {
        addLog(`${jog.nome} chegou ao ${tile.nome}.`);
        await mostrar({
          titulo: tile.nome,
          subtitulo: "Hub logístico",
          texto: `${jog.nome} chegou ao hub. Ao completar a volta, recebe R$ ${SALARIO}.`,
          tom: "neutro",
          icone: "inicio",
          jogadorId,
        });
      }
    },
    [addLog, ajustar, comprar, mostrar],
  );

  const proximoTurno = useCallback(() => {
    setJogadores((js) => js.map((j) => (j.dinheiro < 0 ? { ...j, falido: true } : j)));
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
    setRolando(true);
    setAndados(0);
    setPassos(null);
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const total = d1 + d2;
    await espera(500);
    setDados([d1, d2]);
    setPassos(total);
    setRolando(false);
    const jog = ref.current.jogadores[ref.current.atual]!;
    addLog(`${jog.nome} tirou ${d1} + ${d2} = ${total}.`);
    await espera(500);

    let pos = jog.posicao;
    for (let s = 0; s < total; s++) {
      pos = (pos + 1) % TABULEIRO.length;
      if (pos === 0) {
        ajustar(jog.id, SALARIO);
        addLog(`${jog.nome} passou pelo Centro de Distribuição: +R$ ${SALARIO}.`);
      }
      const p = pos;
      setJogadores((js) => js.map((j) => (j.id === jog.id ? { ...j, posicao: p } : j)));
      setAndados(s + 1);
      await espera(200);
    }
    await espera(250);
    await resolver(jog.id, pos);
    setRolando(false);
  }, [addLog, ajustar, resolver]);

  // Turno automático da CPU
  useEffect(() => {
    if (fim || rolando || compra !== null) return;
    const jog = jogadores[atual];
    if (!jog?.cpu || jog.falido) return;
    const t = setTimeout(() => {
      void (async () => {
        await rolar();
        await espera(500);
        proximoTurno();
      })();
    }, 700);
    return () => clearTimeout(t);
  }, [atual, jogadores, rolando, compra, fim, rolar, proximoTurno]);

  // Fim de jogo
  useEffect(() => {
    const vivos = jogadores.filter((j) => !j.falido && j.dinheiro >= 0);
    if (vivos.length <= 1 && !fim) setFim(true);
    const todasVendidas = TABULEIRO.every(
      (t, i) => t.kind !== "prop" || donos[i] !== undefined,
    );
    if (todasVendidas && !fim) setFim(true);
  }, [jogadores, donos, fim]);

  const reiniciar = () => {
    setJogadores(novosJogadores());
    setDonos({});
    setAtual(0);
    setLog(["Nova partida iniciada. Boa sorte!"]);
    setCompra(null);
    setFim(false);
  };

  const humano = jogadores[0]!;
  const jogadorDaVez = jogadores[atual]!;
  const minhaVez = !jogadorDaVez.cpu && !rolando && compra === null && !fim;
  const tileCompra = compra !== null ? TABULEIRO[compra] : null;
  const vencedor = [...jogadores].sort(
    (a, b) => patrimonio(b, donos) - patrimonio(a, donos),
  )[0]!;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            Jogo de tabuleiro
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            RotaLog — Império da Logística
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Compre armazéns, caminhões, portos e ferrovias, sobreviva aos eventos do
            mercado e construa o maior patrimônio logístico do país.
          </p>
        </header>
        <div className="relative">
          <Board
            jogadores={jogadores}
            donos={donos}
            atual={atual}
            destaque={jogadorDaVez.posicao}
          />
          {aviso && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="animate-pop w-full max-w-sm rounded-2xl border border-primary/40 bg-popover p-5 text-center shadow-elev backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
                  Casa
                </p>
                <p className="font-display mt-1 text-xl font-bold text-foreground">
                  {aviso.titulo}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{aviso.texto}</p>
                {aviso.delta !== undefined && (
                  <p
                    className={`font-display mt-3 text-2xl font-bold ${
                      aviso.tom === "ruim"
                        ? "text-destructive"
                        : aviso.tom === "bom"
                          ? "text-success"
                          : "text-primary"
                    }`}
                  >
                    {aviso.delta > 0 ? "+" : "−"}R$ {Math.abs(aviso.delta)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <Carteira jogador={humano} />

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Vez de
              </p>
              <p className="font-display text-lg font-bold" style={{ color: jogadorDaVez.cor }}>
                {jogadorDaVez.nome}
              </p>
            </div>
            <div className="flex gap-2">
              {dados.map((d, i) => (
                <span
                  key={i}
                  className={`flex size-11 items-center justify-center rounded-xl border border-primary/40 bg-secondary font-display text-xl font-bold text-primary ${rolando ? "animate-dice" : ""}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              disabled={!minhaVez}
              onClick={() => {
                void rolar();
              }}
            >
              <Dices /> Rolar dados
            </Button>
            <Button variant="secondary" onClick={reiniciar} aria-label="Reiniciar partida">
              <RotateCcw />
            </Button>
          </div>
          {!rolando && !jogadorDaVez.cpu && !fim && compra === null && (
            <Button
              variant="ghost"
              className="mt-2 w-full text-muted-foreground"
              onClick={proximoTurno}
            >
              Encerrar turno
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Trophy className="size-4 text-primary" /> Ranking
          </h2>
          <Ranking jogadores={jogadores} donos={donos} atual={atual} />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Histórico
          </h2>
          <Log itens={log} />
        </div>
      </aside>

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
                    addLog(`Você dispensou ${tileCompra.nome}.`);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Fim de jogo</DialogTitle>
            <DialogDescription>
              {vencedor.nome} venceu com patrimônio de R${" "}
              {patrimonio(vencedor, donos).toLocaleString("pt-BR")}.
            </DialogDescription>
          </DialogHeader>
          <Ranking jogadores={jogadores} donos={donos} atual={atual} />
          <DialogFooter>
            <Button onClick={reiniciar}>Jogar novamente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
