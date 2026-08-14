import { TABULEIRO } from "@/game/data";
import type { Jogador } from "@/game/types";
import { cn } from "@/lib/utils";
import { Crown, Wallet } from "lucide-react";

export function patrimonio(j: Jogador, donos: Record<number, number | undefined>) {
  let total = j.dinheiro;
  TABULEIRO.forEach((t, i) => {
    if (t.kind === "prop" && donos[i] === j.id) total += t.preco;
  });
  return total;
}

export function Ranking({
  jogadores,
  donos,
  atual,
}: {
  jogadores: Jogador[];
  donos: Record<number, number | undefined>;
  atual: number;
}) {
  const ordenado = [...jogadores].sort(
    (a, b) => patrimonio(b, donos) - patrimonio(a, donos),
  );
  return (
    <div className="space-y-2">
      {ordenado.map((j, pos) => {
        const ativos = TABULEIRO.filter(
          (t, i) => t.kind === "prop" && donos[i] === j.id,
        ).length;
        return (
          <div
            key={j.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-3 transition-all",
              jogadores[atual]?.id === j.id && "border-primary/70 shadow-glow",
              j.falido && "opacity-40",
            )}
          >
            <span className="w-4 text-xs font-bold text-muted-foreground">{pos + 1}º</span>
            <span
              className="size-3 shrink-0 rounded-full ring-2 ring-background"
              style={{ background: j.cor }}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                {j.nome}
                {pos === 0 && !j.falido && <Crown className="size-3.5 text-primary" />}
              </p>
              <p className="text-xs text-muted-foreground">
                {ativos} ativos · {j.falido ? "falido" : `R$ ${j.dinheiro}`}
              </p>
            </div>
            <span className="font-display text-sm font-bold text-primary">
              {patrimonio(j, donos)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Log({ itens }: { itens: string[] }) {
  return (
    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
      {itens.map((t, i) => (
        <p
          key={itens.length - i}
          className={cn(
            "animate-pop rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground",
            i === 0 && "bg-secondary text-foreground",
          )}
        >
          {t}
        </p>
      ))}
    </div>
  );
}

export function Carteira({ jogador }: { jogador: Jogador }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
      <Wallet className="size-5 text-primary" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Caixa · {jogador.nome}
        </p>
        <p className="font-display text-xl font-bold text-foreground">
          R$ {jogador.dinheiro.toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
