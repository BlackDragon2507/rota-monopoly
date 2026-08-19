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
    return <Icon className="size-4 md:size-5" strokeWidth={2.2} />;
  }
  if (tile.kind === "evento") return <HelpCircle className="size-4 md:size-5" />;
  if (tile.kind === "inicio") return <Flag className="size-4 md:size-5" />;
  return <Landmark className="size-4 md:size-5" />;
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
    <div className="relative aspect-square h-auto max-h-full w-auto max-w-full rounded-3xl bg-mesa p-0.5 shadow-elev ring-1 ring-border md:p-1.5">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-0.5 md:gap-1">
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
                "relative flex flex-col justify-between overflow-hidden rounded-lg border border-border/70 bg-card/80 p-0.5 text-left transition-all duration-200 hover:border-primary/60 md:p-1",
                destaque === i && "shadow-glow scale-[1.03] border-primary",
              )}
              title={tile.nome}
            >
              {tile.kind === "prop" && (
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `var(--${tile.categoria})` }}
                />
              )}
              <div className="mt-0.5 flex items-center gap-1 text-muted-foreground md:mt-1">
                <TileIcon tile={tile} />
                {tile.kind === "prop" && (
                  <span className="text-[10px] font-bold tracking-wider text-foreground/90 md:text-xs">
                    {tile.sigla}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] leading-tight font-medium text-foreground md:text-xs lg:text-sm">
                  {tile.nome}
                </p>
                {tile.kind === "prop" && (
                  <p className="text-[9px] font-medium text-muted-foreground md:text-[10px]">
                    R$ {tile.preco.toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
              {donoJog && (
                <span
                  className="absolute right-1 top-1 flex items-center justify-center"
                  title={`Dono: ${donoJog.nome}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 drop-shadow-sm md:size-5"
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
              <div className="flex items-end gap-0.5">
                {aqui.map((j) => (
                  <svg
                    key={j.id}
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-5 w-5 drop-shadow-sm transition-transform md:h-6 md:w-6",
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
