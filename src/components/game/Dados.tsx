import { cn } from "@/lib/utils";

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 25],
    [72, 25],
    [28, 50],
    [72, 50],
    [28, 75],
    [72, 75],
  ],
};

export function Dado({ valor, rolando }: { valor: number; rolando: boolean }) {
  return (
    <div
      role="img"
      aria-label={`Dado com ${valor}`}
      className={cn(
        "relative size-16 rounded-2xl border-2 border-primary/40 bg-secondary shadow-elev",
        rolando && "animate-dice",
      )}
    >
      {(PIPS[valor] ?? []).map(([x, y], i) => (
        <span
          key={i}
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

type Props = {
  dados: [number, number];
  rolando: boolean;
  passos: number | null;
  andados: number;
  casaNome: string;
};

export function PainelDados({ dados, rolando, passos, andados, casaNome }: Props) {
  const total = passos ?? dados[0] + dados[1];
  const restantes = passos !== null ? Math.max(passos - andados, 0) : 0;
  const pct = passos && passos > 0 ? (andados / passos) * 100 : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Dado valor={dados[0]} rolando={rolando} />
          <Dado valor={dados[1]} rolando={rolando} />
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Resultado
          </p>
          <p className="font-display text-2xl font-bold text-primary">
            {dados[0]} + {dados[1]} = {total}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {rolando || restantes > 0
              ? `Avançando ${total} casas`
              : `Você avançou ${total} casas`}
          </p>
        </div>
      </div>

      {passos !== null && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Casa {andados} de {passos}
            </span>
            <span>
              {restantes > 0 ? `Faltam ${restantes}` : "Chegou"} · {casaNome}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
