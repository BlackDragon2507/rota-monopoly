import { createFileRoute } from "@tanstack/react-router";
import { Jogo } from "@/components/game/Jogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RotaLog — Jogo de Tabuleiro de Logística" },
      {
        name: "description",
        content:
          "Compre armazéns, caminhões, portos e ferrovias neste jogo de tabuleiro de logística em português, com dinheiro, eventos aleatórios e ranking.",
      },
      { property: "og:title", content: "RotaLog — Império da Logística" },
      {
        property: "og:description",
        content:
          "Jogo estilo Monopoly de logística: compre ativos, enfrente eventos do mercado e lidere o ranking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Jogo />
    </main>
  );
}
