export type Categoria = "armazem" | "caminhao" | "porto" | "ferrovia";

export type Tile =
  | { kind: "inicio"; nome: string }
  | { kind: "parada"; nome: string }
  | { kind: "evento"; nome: string }
  | { kind: "taxa"; nome: string; valor: number }
  | { kind: "bonus"; nome: string; valor: number }
  | {
      kind: "prop";
      nome: string;
      categoria: Categoria;
      preco: number;
      aluguel: number;
      sigla: string;
    };

const MULTIPLICADOR = 100;

const prop = (
  nome: string,
  sigla: string,
  categoria: Categoria,
  preco: number,
): Tile => ({
  kind: "prop",
  nome,
  sigla,
  categoria,
  preco: preco * MULTIPLICADOR,
  aluguel: Math.round(preco * MULTIPLICADOR * 0.22),
});

/** 28 casas no perímetro de um tabuleiro 8x8 */
export const TABULEIRO: Tile[] = [
  { kind: "inicio", nome: "Centro de Distribuição" },
  prop("Armazém Santos", "AS", "armazem", 120),
  prop("Frota Leve SP", "FL", "caminhao", 100),
  { kind: "evento", nome: "Boletim Logístico" },
  prop("Porto de Paranaguá", "PP", "porto", 220),
  prop("Armazém Campinas", "AC", "armazem", 140),
  { kind: "taxa", nome: "Pedágio Nacional", valor: 9000 },
  { kind: "parada", nome: "Pátio de Manutenção" },
  prop("Ferrovia Centro-Oeste", "FC", "ferrovia", 200),
  prop("Frota Pesada MG", "FP", "caminhao", 160),
  { kind: "evento", nome: "Boletim Logístico" },
  prop("Armazém Curitiba", "AR", "armazem", 170),
  prop("Porto de Itajaí", "PI", "porto", 240),
  { kind: "bonus", nome: "Contrato Fechado", valor: 15000 },
  { kind: "inicio", nome: "Hub Internacional" },
  prop("Ferrovia Norte-Sul", "FN", "ferrovia", 230),
  prop("Frota Refrigerada", "FR", "caminhao", 190),
  { kind: "evento", nome: "Boletim Logístico" },
  prop("Porto de Suape", "PS", "porto", 260),
  prop("Armazém Manaus", "AM", "armazem", 200),
  { kind: "taxa", nome: "Multa Ambiental", valor: 12000 },
  { kind: "parada", nome: "Fila na Alfândega" },
  prop("Ferrovia Carajás", "FJ", "ferrovia", 280),
  prop("Frota Internacional", "FI", "caminhao", 240),
  { kind: "evento", nome: "Boletim Logístico" },
  prop("Porto de Santos", "PT", "porto", 320),
  prop("Armazém Automatizado", "AA", "armazem", 300),
  { kind: "bonus", nome: "Bônus de Eficiência", valor: 20000 },
];

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  armazem: "Armazém",
  caminhao: "Caminhão",
  porto: "Porto",
  ferrovia: "Ferrovia",
};

export type Evento = { texto: string; delta: number };

export const EVENTOS: Evento[] = [
  { texto: "Greve dos caminhoneiros: você perde entregas.", delta: -14000 },
  { texto: "Combustível em alta, custos operacionais sobem.", delta: -11000 },
  { texto: "Novo contrato de e-commerce assinado!", delta: 26000 },
  { texto: "Container extraviado no porto.", delta: -18000 },
  { texto: "Otimização de rotas reduz custos em 12%.", delta: 19000 },
  { texto: "Chuvas fecham a BR-101, frete atrasado.", delta: -9000 },
  { texto: "Subsídio logístico do governo liberado.", delta: 21000 },
  { texto: "Manutenção emergencial da frota.", delta: -13000 },
  { texto: "Exportação recorde de grãos pela ferrovia.", delta: 30000 },
  { texto: "Multa por excesso de peso na balança.", delta: -10000 },
];
