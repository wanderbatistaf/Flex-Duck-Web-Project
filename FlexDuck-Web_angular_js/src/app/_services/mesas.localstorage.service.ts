import { Injectable } from '@angular/core';

interface Produto {
  codigo: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface ProdutoConsumido {
  codigo: string;
  nome: string;
  quantidade: number;
  preco: number;
}

interface Mesa {
  id: number;
  numero: number;
  nome: string;
  telefoneResponsavel: string;
  produtosConsumidos: Produto[];
  totalAPagar: number;
  abertura: Date;
  tempoAberta: Date;
  iniciado: boolean;
  tempoInicial: number;
  tempoTotal: number;
}


@Injectable({
  providedIn: 'root'
})
export class MesasLocalstorageService {
  private mesaDataKey = 'mesasAbertas';
  mesasAbertas: Mesa[] = [];

  constructor() {
    // Carregue os dados das mesas do localStorage durante a inicialização
    const savedMesas = localStorage.getItem(this.mesaDataKey);
    if (savedMesas) {
      this.mesasAbertas = JSON.parse(savedMesas);
    }
  }

  atualizarDadosDaMesa(mesa: Mesa) {
    // Atualize a mesa no array mesasAbertas
    const mesaIndex = this.mesasAbertas.findIndex(m => m.id === mesa.id);
    if (mesaIndex !== -1) {
      this.mesasAbertas[mesaIndex] = mesa;
      this.salvarMesasNoLocalStorage(this.mesasAbertas);
    }
  }

  salvarMesasNoLocalStorage(mesas: Mesa[]): void {
    // Converta o objeto Mesa em JSON e salve no armazenamento local
    const mesasJSON = JSON.stringify(mesas);
    localStorage.setItem('mesasAbertas', mesasJSON);
  }

  iniciarCronometro(mesa: Mesa) {
    mesa.iniciado = true;
    mesa.tempoInicial = new Date().getTime();
    this.atualizarDadosDaMesa(mesa);
  }

  pararCronometro(mesa: Mesa) {
    if (mesa.iniciado) {
      const agora = new Date().getTime();
      const tempoDecorrido = agora - mesa.tempoInicial;
      mesa.tempoTotal += tempoDecorrido;
      mesa.iniciado = false;
      this.atualizarDadosDaMesa(mesa);
    }
  }
}
