import { TABULEIRO, type Tile } from "@/game/data";
import type { Jogador } from "@/game/types";
import { cn } from "@/lib/utils";
import { Anchor, Flag, HelpCircle, Landmark, Package, Train, Truck } from "lucide-react";

export function gridPos(i: number): { row: number; col: number } {
  if (i <= 7) return { row: 8, col: i + 1 };
  if (i <= 13) return { row: 14 - i + 1, col: 8 };
  if (i <= 21) return { row: 1, col: 21 - i + 1 };
  return { row: i - 21 + 1, col: 1 };
}

const catIcon: Record<string, typeof Truck> = {
  armazem: Package,
  caminhao: Truck,
  porto: Anchor,
  ferrovia: Train,
};

function TileIcon({ tile }: { tile: Tile }) {
  if (tile.kind === "prop") {
    const Icon = catIcon[tile.categoria] ?? Package;
    return <Icon className="size-3.5 md:size-4" strokeWidth={2.2} />;
  }
  if (tile.kind === "evento") return <HelpCircle className="size-4" />;
  if (tile.kind === "inicio") return <Flag className="size-4" />;
  return <Landmark className="size-4" />;
}

type Props = {
  jogadores: Jogador[];
  donos: Record<number, number | undefined>;
  atual: number;
  destaque: number | null;
  onTileClick?: (i: number) => void;
};

export function Board({ jogadores, donos, atual, destaque, onTileClick }: Props) {
  return (
    <div className="relative aspect-square w-full rounded-3xl bg-mesa p-2 shadow-elev ring-1 ring-border md:p-3">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-1 md:gap-1.5">
        {TABULEIRO.map((tile, i) => {
          const { row, col } = gridPos(i);
          const dono = donos[i];
          const donoJog = jogadores.find((j) => j.id === dono);
          const aqui = jogadores.filter((j) => j.posicao === i && !j.falido);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTileClick?.(i)}
              style={{ gridRow: row, gridColumn: col }}
              className={cn(
                "relative flex flex-col justify-between overflow-hidden rounded-lg border border-border/70 bg-card/80 p-1 text-left transition-all duration-200 hover:border-primary/60 md:p-1.5",
                destaque === i && "shadow-glow scale-[1.03] border-primary",
              )}
            >
              {tile.kind === "prop" && (
                <span
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `var(--${tile.categoria})` }}
                />
              )}
              <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                <TileIcon tile={tile} />
                {tile.kind === "prop" && (
                  <span className="text-[9px] font-semibold tracking-wider text-foreground/80 md:text-[10px]">
                    {tile.sigla}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[8px] leading-tight font-medium text-foreground/90 md:text-[10px]">
                  {tile.nome}
                </p>
                {tile.kind === "prop" && (
                  <p className="text-[8px] text-muted-foreground md:text-[9px]">
                    R$ {tile.preco}
                  </p>
                )}
              </div>
              {donoJog && (
                <span
                  className="absolute right-1 top-1 size-2 rounded-full"
                  style={{ background: donoJog.cor }}
                />
              )}
              <div className="flex items-end gap-0.5">
                {aqui.map((j) => (
                  <svg
                    key={j.id}
                    viewBox="0 0 24 32"
                    className={cn(
                      "h-4 w-3 drop-shadow-md transition-transform md:h-5 md:w-4",
                      jogadores[atual]?.id === j.id && "-translate-y-0.5 scale-125",
                    )}
                    style={{ color: j.cor }}
                    aria-label={`Peão de ${j.nome}`}
                  >
                    <ellipse cx="12" cy="29" rx="9" ry="3" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="1.5" />
                    <path
                      d="M12 2c3 0 5.2 2.3 5.2 5.1 0 1.7-.8 3.2-2.1 4.1 2.4 1.7 4 4.5 4.4 7.8.1 1-.6 1.9-1.6 1.9H6.1c-1 0-1.7-.9-1.6-1.9.4-3.3 2-6.1 4.4-7.8-1.3-.9-2.1-2.4-2.1-4.1C6.8 4.3 9 2 12 2Z"
                      fill="currentColor"
                      stroke="hsl(var(--background))"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <rect x="4.5" y="21" width="15" height="4.5" rx="2.2" fill="currentColor" stroke="hsl(var(--background))" strokeWidth="1.5" />
                  </svg>
                ))}
              </div>

            </button>
          );
        })}

        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-4 text-center backdrop-blur-sm"
          style={{ gridRow: "2 / 8", gridColumn: "2 / 8" }}
        >
          <p className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            ROTA<span className="text-primary">LOG</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
            Império da Logística
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] md:text-xs">
            {(["armazem", "caminhao", "porto", "ferrovia"] as const).map((c) => (
              <span key={c} className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ background: `var(--${c})` }}
                />
                {c === "armazem"
                  ? "Armazéns"
                  : c === "caminhao"
                    ? "Caminhões"
                    : c === "porto"
                      ? "Portos"
                      : "Ferrovias"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
