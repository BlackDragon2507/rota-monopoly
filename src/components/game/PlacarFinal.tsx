import { TABULEIRO } from "@/game/data";
import type { Jogador } from "@/game/types";
import { cn } from "@/lib/utils";
import { Crown, Medal, Wallet, Home } from "lucide-react";

function ativos(j: Jogador, donos: Record<number, number | undefined>) {
  return TABULEIRO.filter((t, i) => t.kind === "prop" && donos[i] === j.id).length;
}

export function PlacarFinal({
  jogadores,
  donos,
}: {
  jogadores: Jogador[];
  donos: Record<number, number | undefined>;
}) {
  const ordenado = [...jogadores].sort((a, b) => b.pontos - a.pontos || b.dinheiro - a.dinheiro);
  const porDinheiro = [...jogadores].sort((a, b) => b.dinheiro - a.dinheiro);
  const porAtivos = [...jogadores].sort((a, b) => ativos(b, donos) - ativos(a, donos));

  const posDinheiro = new Map(porDinheiro.map((j, i) => [j.id, i]));
  const posAtivos = new Map(porAtivos.map((j, i) => [j.id, i]));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/50 bg-primary/10 p-4">
        <Crown className="size-8 text-primary" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Campeão</p>
          <p className="font-display text-xl font-bold text-foreground">
            {ordenado[0]?.nome} — {ordenado[0]?.pontos} pontos
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {ordenado.map((j, i) => {
          const posD = posDinheiro.get(j.id) ?? 3;
          const posA = posAtivos.get(j.id) ?? 3;
          const ptsD = Math.max(0, 3 - posD);
          const ptsA = Math.max(0, 3 - posA);
          return (
            <div
              key={j.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-3",
                i === 0 && "border-primary/70 shadow-glow",
              )}
            >
              <span className="flex w-8 items-center justify-center text-sm font-bold text-muted-foreground">
                {i === 0 ? <Medal className="size-5 text-primary" /> : `${i + 1}º`}
              </span>
              <span
                className="size-4 shrink-0 rounded-full ring-2 ring-background"
                style={{ background: j.cor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{j.nome}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wallet className="size-3" /> Dinheiro: {j.dinheiro} ({posD + 1}º · +{ptsD})
                  </span>
                  <span className="flex items-center gap-1">
                    <Home className="size-3" /> Ativos: {ativos(j, donos)} ({posA + 1}º · +{ptsA})
                  </span>
                </div>
              </div>
              <span className="font-display text-lg font-bold text-primary">{j.pontos}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/60 bg-secondary/50 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground/80">Regras de pontuação</p>
        <p>• 30 rodadas de cada jogador encerram a partida.</p>
        <p>• Ranking por dinheiro: 1º +3, 2º +2, 3º +1, 4º +0.</p>
        <p>• Ranking por ativos comprados: 1º +3, 2º +2, 3º +1, 4º +0.</p>
        <p>• Em empate, quem tiver mais dinheiro leva a posição.</p>
      </div>
    </div>
  );
}
