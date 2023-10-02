export interface NotifyModel {
  alerta_reposicao: number;
  categoria: string;
  codigo: string;
  desconto: number;
  descricao: string;
  estoque_maximo: number;
  estoque_minimo: number;
  fornecedor_id: number | null;
  fornecedor_nome: string | null;
  id: number;
  localizacao: string | null;
  marca: string | null;
  margem_lucro: number | null;
  nome: string;
  preco_custo: number;
  preco_venda: number;
  quantidade: number;
}
