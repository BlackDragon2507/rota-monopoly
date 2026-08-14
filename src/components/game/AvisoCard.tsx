import type { Jogador } from "@/game/types";
import { cn } from "@/lib/utils";
import {
  Anchor,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Handshake,
  Landmark,
  Newspaper,
  Package,
  ReceiptText,
  Train,
  Truck,
  Wrench,
} from "lucide-react";

export type IconeAviso =
  | "armazem"
  | "caminhao"
  | "porto"
  | "ferrovia"
  | "taxa"
  | "bonus"
  | "evento"
  | "parada"
  | "inicio"
  | "frete";

const ICONES: Record<IconeAviso, typeof Package> = {
  armazem: Package,
  caminhao: Truck,
  porto: Anchor,
  ferrovia: Train,
  taxa: ReceiptText,
  bonus: Coins,
  evento: Newspaper,
  parada: Wrench,
  inicio: Landmark,
  frete: Handshake,
};

export type Aviso = {
  titulo: string;
  subtitulo: string;
  texto: string;
  detalhe?: string;
  delta?: number;
  tom: "bom" | "ruim" | "neutro";
  icone: IconeAviso;
  jogadorId: number;
};

export function AvisoCard({ aviso, jogadores }: { aviso: Aviso; jogadores: Jogador[] }) {
  const jog = jogadores.find((j) => j.id === aviso.jogadorId);
  const Icone = ICONES[aviso.icone];
  const tomTexto =
    aviso.tom === "ruim"
      ? "text-destructive"
      : aviso.tom === "bom"
        ? "text-success"
        : "text-primary";

  return (
    <div className="animate-pop w-full max-w-sm overflow-hidden rounded-2xl border border-primary/50 bg-popover shadow-elev">
      <div className="flex items-center gap-3 border-b border-border/60 bg-secondary/60 px-4 py-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 ring-1 ring-border",
            tomTexto,
          )}
        >
          <Icone className="size-5" />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
            {aviso.subtitulo}
          </p>
          <p className="font-display truncate text-lg font-bold text-foreground">
            {aviso.titulo}
          </p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4 text-left">
        {jog && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: jog.cor }} />
            <span className="font-semibold text-foreground/90">{jog.nome}</span>
          </p>
        )}
        <p className="text-sm text-foreground/90">{aviso.texto}</p>
        {aviso.detalhe && (
          <p className="rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            {aviso.detalhe}
          </p>
        )}

        {aviso.delta !== undefined ? (
          <div className="flex items-end justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {aviso.delta >= 0 ? "Você recebeu" : "Você pagou"}
              </p>
              <p className={cn("font-display flex items-center gap-1 text-2xl font-bold", tomTexto)}>
                {aviso.delta >= 0 ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <ArrowDownRight className="size-5" />
                )}
                {aviso.delta >= 0 ? "+" : "−"}R$ {Math.abs(aviso.delta).toLocaleString("pt-BR")}
              </p>
            </div>
            {jog && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Saldo
                </p>
                <p className="font-display text-base font-bold text-foreground">
                  R$ {jog.dinheiro.toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            Nenhum valor foi movimentado nesta casa.
          </p>
        )}
      </div>
    </div>
  );
}
