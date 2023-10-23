  export class Servico {
    numeroOrdem?: number;
    servico?: string;
    responsavel?: string;
    cliente?: string;
    telefone?: string;
    cpf?: string;
    modelo?: string;
    imei?: string;
    estadoAparelho?: string;
    chip?: string;
    cartaoMemoria?: string;
    pelicula?: string;
    defeitoRelatado?: string;
    servicoARealizar?: string;
    status?: string;
    valorInicial?: number;
    itens?: ItemServico[];
  }

  interface ItemServico {
      codigo: string;
      produto: string;
      preco: number;
      desconto: number;
      quantidade: number;
      total: number;
  }
