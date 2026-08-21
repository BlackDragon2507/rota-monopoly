export type TipoCasa = 
  | 'propriedade' 
  | 'inicio' 
  | 'fiscalizacao' 
  | 'evento' 
  | 'va_para_fiscalizacao' 
  | 'imposto';

export interface Propriedade {
  id: number;
  nome: string;
  preco: number;
  aluguelBase: number;
  nivelEvolucao: number; // 0: Garagem, 1: Galpão, 2: Centro de Distribuição, 3: Hub Logístico
  donoId?: number;
}

export interface Casa {
  id: number;
  nome: string;
  tipo: TipoCasa;
  propriedade?: Propriedade;
}

export interface Jogador {
  id: number;
  nome: string;
  cor: string;
  saldo: number;
  posicao: number;
  turnosPreso: number; // Para controle de 'Fiscalização' e 'Trânsito Intenso'
  vitorias: number;
}

export interface CartaEvento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'transito' | 'atalho' | 'parceria' | 'carga_prioritaria' | 'multa_fiscalizacao';
  valor?: number;
  casasAvançar?: number;
}
