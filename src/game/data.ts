import { Casa, CartaEvento } from './types';

export const CARTAS_EVENTO: CartaEvento[] = [
  // --- Movimentação e Tráfego (6 Cartas) ---
  {
    id: 'transito',
    titulo: 'Trânsito Intenso',
    descricao: 'Sua frota ficou presa em um grande engarrafamento na rodovia. Fique 1 rodada sem jogar.',
    tipo: 'transito'
  },
  {
    id: 'atalho',
    titulo: 'Você Encontrou um Atalho',
    descricao: 'Rota alternativa expressa e asfaltada! Avance 3 casas.',
    tipo: 'atalho',
    casasAvançar: 3
  },
  {
    id: 'obras_pista',
    titulo: 'Obras na Pista',
    descricao: 'Trecho interditado para recapeamento. Volte 2 casas.',
    tipo: 'atalho',
    casasAvançar: -2
  },
  {
    id: 'pneu_furado',
    titulo: 'Pneu Furado',
    descricao: 'Um pneu estourou na estrada. Perca a vez para realizar a troca com segurança.',
    tipo: 'transito'
  },
  {
    id: 'pedagio_expresso',
    titulo: 'Tag Pedágio Expresso',
    descricao: 'Sua frota usou a cabine de cobrança automática e evitou filas. Avance 2 casas.',
    tipo: 'atalho',
    casasAvançar: 2
  },
  {
    id: 'chuva_forte',
    titulo: 'Tempestade na Serra',
    descricao: 'Pista escorregadia e pouca visibilidade. Reduza a velocidade e volte 1 casa.',
    tipo: 'atalho',
    casasAvançar: -1
  },

  // --- Finanças e Parcerias (6 Cartas) ---
  {
    id: 'parceria',
    titulo: 'Parceria Comercial',
    descricao: 'Uma grande multinacional fechou contrato exclusivo de frete com sua frota. Receba R$ 20.000.',
    tipo: 'parceria',
    valor: 20000
  },
  {
    id: 'restituicao_imposto',
    titulo: 'Restituição de Pedágio',
    descricao: 'Sua empresa recebeu um incentivo fiscal do governo estadual. Receba R$ 10.000.',
    tipo: 'parceria',
    valor: 10000
  },
  {
    id: 'combustivel_alta',
    titulo: 'Alta no Diesel',
    descricao: 'O preço do combustível subiu de surpresa nas bombas. Pague R$ 5.000 de taxa operacional.',
    tipo: 'parceria',
    valor: -5000
  },
  {
    id: 'manutencao_frota',
    titulo: 'Manutenção Preventiva',
    descricao: 'Revisão periódica de freios e suspensão efetuada na oficina. Pague R$ 8.000.',
    tipo: 'parceria',
    valor: -8000
  },
  {
    id: 'patrocinio_logistico',
    titulo: 'Contrato de Exclusividade',
    descricao: 'Um fabricante de peças fechou patrocínio com a sua marca. Receba R$ 15.000.',
    tipo: 'parceria',
    valor: 15000
  },
  {
    id: 'seguro_frota',
    titulo: 'Renovação do Seguro',
    descricao: 'Apólice de seguro contra sinistros e roubo renovada. Pague R$ 7.000.',
    tipo: 'parceria',
    valor: -7000
  },

  // --- Agilidade e Logística Expressa (4 Cartas) ---
  {
    id: 'carga_prioritaria',
    titulo: 'Carga Prioritária',
    descricao: 'Entrega urgente solicitada com bonificação! Jogue os dados novamente.',
    tipo: 'carga_prioritaria'
  },
  {
    id: 'rastreamento_satelite',
    titulo: 'Sistema de Rastreamento',
    descricao: 'Sua frota otimizou o tempo de viagem com rotas otimizadas por IA. Jogue os dados novamente.',
    tipo: 'carga_prioritaria'
  },
  {
    id: 'frete_expresso',
    titulo: 'Frete Corujão',
    descricao: 'Entrega realizada no período noturno com pista livre. Jogue os dados novamente.',
    tipo: 'carga_prioritaria'
  },
  {
    id: 'logistica_reversa',
    titulo: 'Carga de Retorno',
    descricao: 'O caminhão não voltou vazio e aproveitou o frete de volta! Receba R$ 12.000.',
    tipo: 'parceria',
    valor: 12000
  },

  // --- Fiscalização e Documentação (4 Cartas) ---
  {
    id: 'fiscalizacao_surpresa',
    titulo: 'Blitz da ANTT',
    descricao: 'A fiscalização parou o seu caminhão para checar a nota fiscal. Fique 1 rodada sem jogar ou pague R$ 3.000 de liberação expressa.',
    tipo: 'multa_fiscalizacao',
    valor: 3000
  },
  {
    id: 'excesso_peso',
    titulo: 'Excesso de Carga',
    descricao: 'Sua carreta foi flagrada com excesso de peso no posto de balança. Pague R$ 6.000 de multa.',
    tipo: 'parceria',
    valor: -6000
  },
  {
    id: 'documentacao_ok',
    titulo: 'Selo Frota Verde',
    descricao: 'Sua empresa ganhou um prêmio por emissão reduzida de poluentes. Receba R$ 8.000.',
    tipo: 'parceria',
    valor: 8000
  },
  {
    id: 'tacografo_vencido',
    titulo: 'Tacógrafo Desatualizado',
    descricao: 'Infração detectada na vistoria de rotina da fiscalização. Pague R$ 4.000.',
    tipo: 'parceria',
    valor: -4000
  }
];

export const CASAS_INICIAIS: Casa[] = [
  { id: 0, nome: 'Ponto de Partida', tipo: 'inicio' },
  { id: 1, nome: 'Garagem Central', tipo: 'propriedade', propriedade: { id: 1, nome: 'Garagem Central', preco: 10000, aluguelBase: 1000, nivelEvolucao: 0 } },
  { id: 2, nome: 'Evento de Rota', tipo: 'evento' },
  { id: 3, nome: 'Depósito Sul', tipo: 'propriedade', propriedade: { id: 3, nome: 'Depósito Sul', preco: 12000, aluguelBase: 1200, nivelEvolucao: 0 } },
  { id: 4, nome: 'Imposto de Roda', tipo: 'imposto' },
  { id: 5, nome: 'Fiscalização', tipo: 'fiscalizacao' },
  { id: 6, nome: 'Terminal Leste', tipo: 'propriedade', propriedade: { id: 6, nome: 'Terminal Leste', preco: 15000, aluguelBase: 1500, nivelEvolucao: 0 } },
  { id: 7, nome: 'Evento de Rota', tipo: 'evento' },
  { id: 8, nome: 'Hub Norte', tipo: 'propriedade', propriedade: { id: 8, nome: 'Hub Norte', preco: 18000, aluguelBase: 1800, nivelEvolucao: 0 } },
  { id: 9, nome: 'Parada Obrigatória', tipo: 'va_para_fiscalizacao' }
];
