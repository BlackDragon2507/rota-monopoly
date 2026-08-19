import { TABULEIRO, type Tile } from "@/game/data";
import type { Jogador } from "@/game/types";
import { cn } from "@/lib/utils";
import { Anchor, Flag, HelpCircle, Landmark, Package, Train, Truck } from "lucide-react";

export function gridPos(i: number): { row: number; col: number } {
  if (i <= 6) return { row: 9, col: i + 1 };
  if (i <= 13) return { row: 15 - i, col: 7 };
  if (i <= 20) return { row: 1, col: 21 - i };
  return { row: i - 19, col: 1 };
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
    return <Icon className="size-5 md:size-6" strokeWidth={2.2} />;
  }
  if (tile.kind === "evento") return <HelpCircle className="size-5 md:size-6" />;
  if (tile.kind === "inicio") return <Flag className="size-5 md:size-6" />;
  return <Landmark className="size-5 md:size-6" />;
}

const catColor = (categoria: string) => `var(--${categoria})`;

export function labelCurto(kind: string) {
  if (kind === "inicio") return "Início";
  if (kind === "parada") return "Parada";
  if (kind === "evento") return "Evento";
  if (kind === "taxa") return "Taxa";
  if (kind === "bonus") return "Bônus";
  return "";
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
    <div className="relative rounded-3xl bg-mesa p-1 shadow-elev ring-1 ring-border md:p-2">
      <div
        className="grid h-full w-full gap-1 md:gap-1.5"
        style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridTemplateRows: "repeat(9, minmax(0, 1fr))" }}
      >
        {TABULEIRO.map((tile, i) => {
          const { row, col } = gridPos(i);
          const dono = donos[i];
          const donoJog = jogadores.find((j) => j.id === dono);
          const aqui = jogadores.filter((j) => j.posicao === i && !j.falido);
          const isProp = tile.kind === "prop";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTileClick?.(i)}
              style={{ gridRow: row, gridColumn: col }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl border border-border/70 bg-card/90 p-1 text-center transition-all duration-200 hover:border-primary/60 md:gap-1.5 md:rounded-2xl md:p-1.5",
                destaque === i && "shadow-glow scale-[1.02] border-primary",
              )}
              title={tile.nome}
            >
              {isProp && (
                <span
                  className="absolute inset-x-0 top-0 h-1.5 rounded-t-xl md:h-2"
                  style={{ background: catColor(tile.categoria) }}
                />
              )}

              {donoJog && (
                <span
                  className="absolute right-1 top-1.5 flex items-center justify-center"
                  title={`Dono: ${donoJog.nome}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5 drop-shadow-sm md:size-4"
                    style={{ color: donoJog.cor }}
                    aria-label={`Casa de ${donoJog.nome}`}
                  >
                    <path
                      d="M12 2L2 10h3v10h6v-6h4v6h6V10h3L12 2z"
                      fill="currentColor"
                      stroke="hsl(var(--background))"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <div className="mt-1.5 flex flex-col items-center text-muted-foreground md:mt-2">
                <TileIcon tile={tile} />
                {isProp && (
                  <span
                    className="text-[10px] font-bold tracking-wider text-foreground md:text-xs"
                    style={{ color: tile.categoria === "armazem" ? undefined : undefined }}
                  >
                    {tile.sigla}
                  </span>
                )}
                {!isProp && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-foreground/80 md:text-[10px]">
                    {labelCurto(tile.kind)}
                  </span>
                )}
              </div>

              <p
                className={cn(
                  "line-clamp-2 w-full text-[11px] font-semibold leading-tight text-foreground md:text-[13px] lg:text-sm",
                  isProp && "font-medium",
                )}
                title={tile.nome}
              >
                {tile.nome}
              </p>

              <div className="flex min-h-[18px] items-end justify-center gap-0.5 md:min-h-[22px] md:gap-1">
                {aqui.map((j) => (
                  <svg
                    key={j.id}
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-4 w-4 drop-shadow-sm transition-transform md:h-5 md:w-5",
                      jogadores[atual]?.id === j.id && "-translate-y-1 scale-125",
                    )}
                    style={{ color: j.cor }}
                    aria-label={`Peão de ${j.nome}`}
                  >
                    <path
                      d="M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 11c-4.5 0-8.5 2.5-9 7h18c-.5-4.5-4.5-7-9-7Z"
                      fill="currentColor"
                      stroke="hsl(var(--background))"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
            </button>
          );
        })}

        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-3 text-center backdrop-blur-sm"
          style={{ gridRow: "2 / 9", gridColumn: "2 / 7" }}
        >
          <p className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            ROTA<span className="text-primary">LOG</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-xs">
            Império da Logística
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] md:text-xs">
            {(["armazem", "caminhao", "porto", "ferrovia"] as const).map((c) => (
              <span key={c} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: `var(--${c})` }} />
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
