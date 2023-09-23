export class Sales {
  id?: number;
  data_venda?: Date;
  vendedor?: string;
  cliente?: string;
  cpf?: string;
  telefone?: string;
  forma_pagamento_id?: number;
  bandeira_id?: number;
  parcelamento?: number;
  subtotal?: number;
  desconto?: number;
  valor_total?: number;
  valor_total_pago?: number;
  valor_em_aberto?: number;
  quantidade_itens?: number;
  troco?: number;
  numero_cupom_fiscal?: number;
  imposto_estadual?: number;
  imposto_federal?: number;
  cnpj?: string;
  cliente_id?: number;
  codigo_produto?: string;
  produtos: any;
  preco_custo?: number;
}
