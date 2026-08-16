export type Jogador = {
  id: number;
  nome: string;
  cor: string;
  dinheiro: number;
  posicao: number;
  cpu: boolean;
  falido: boolean;
  pontos: number;
  rodadas: number;
};

export const CORES = [
  "var(--player-1)",
  "var(--player-2)",
  "var(--player-3)",
  "var(--player-4)",
];
