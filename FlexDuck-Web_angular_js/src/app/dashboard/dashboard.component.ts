import { Component, OnInit } from '@angular/core';
import { SalesService } from '@app/_services';
import { Sales } from '@app/_models';
import { map } from 'rxjs';
import { Chart } from 'chart.js/auto';
import { format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
  sales: Sales[] = [];
  chart: any;
  startDate: string = '';
  endDate: string = '';
  selectedVendedor: string = 'Todos os Vendedores';
  vendedores: string[] = [];
  barChart: any;
  vendasTotal: number = 0;
  filteredSales: Sales[] = [];
  topProducts?: [string, number][];
  distinctCustomerCount: any;
  averagePrice?: number;

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.getAllSales();
    this.loadVendedores();
  }

  getAllSales(): void {
    this.salesService
      .getAllVendasReport()
      .pipe(map((response: any) => response.rows as Sales[]))
      .subscribe(
        (sales: Sales[]) => {
          this.sales = sales;
          console.log('Dados de vendas:', this.sales);

          this.loadVendedores();

          // Chame os Charts aqui
          this.createChart();
          this.createBarChart();

          // Calcule a soma total das vendas aqui
          this.calculateTotalSales();
          // Calcule a os top produtos vendidos aqui
          this.calculateTopProducts();

          // Filtrar as vendas com base nos critérios iniciais
          this.filterSales();
        },
        (error) => {
          console.error('Erro ao buscar dados de vendas:', error);
        }
      );
  }

  calculateTotalSales(): void {
    // Recupere as datas selecionadas (startDate e endDate)
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    // Filtrar as vendas com base nas datas selecionadas e no vendedor selecionado
    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        // Verifica se a data da venda está dentro do intervalo selecionado
        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          // Verifica se o vendedor selecionado é vazio ou corresponde ao vendedor da venda
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            return true;
          }
        }
      }
      return false;
    });

    // Calcular a soma de todos os campos sale.valor_total
    this.vendasTotal = filteredSales.reduce(
      (acc, sale) => (acc += sale.valor_total || 0),
      0
    );
  }

  loadVendedores(): void {
    const uniqueVendedores: Set<string> = new Set<string>();

    // Extrair vendedores únicos dos dados de vendas
    this.sales.forEach((sale) => {
      if (sale.vendedor) {
        uniqueVendedores.add(sale.vendedor);
      }
    });

    // Converter o Set de vendedores únicos de volta para um array
    const vendedoresArray = Array.from(uniqueVendedores);

    // Verificar se "Todos os Vendedores" está no array e substituí-lo por uma string vazia
    if (vendedoresArray.includes('Todos os Vendedores')) {
      vendedoresArray.splice(
        vendedoresArray.indexOf('Todos os Vendedores'),
        1,
        ''
      );
    }

    // Adicione "Todos os Vendedores" como a primeira opção na lista de vendedores
    this.vendedores = ['Todos os Vendedores', ...vendedoresArray];
  }

  createChart(): void {
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    const canvas: any = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');

    // Verifica se já existe um gráfico e o destrói
    if (this.chart) {
      this.chart.destroy();
    }

    // Recupere as datas selecionadas (startDate e endDate)
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;

    // Filtrar as vendas com base nas datas selecionadas e no vendedor selecionado
    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        // Verifica se a data da venda está dentro do intervalo selecionado
        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          // Verifica se o vendedor selecionado é vazio ou corresponde ao vendedor da venda
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            return true;
          }
        }
      }
      return false;
    });

    // Agrupar vendas por dia e calcular o valor total de vendas e a quantidade de vendas em cada dia
    const groupedSales: {
      [date: string]: { quantidadeVendas: number; valorTotalVendas: number };
    } = {};

    // Calcular a soma de todos os campos sale.valor_total
    const somaTotalVendas = filteredSales.reduce(
      (acc, sale) => (acc += sale.valor_total || 0),
      0
    );

    filteredSales.forEach((sale) => {
      if (sale.data_venda && sale.valor_total !== undefined) {
        const date = format(
          new Date(sale.data_venda),
          'dd-MM-yyyy'
        ); // Formate a data aqui
        if (!groupedSales[date]) {
          groupedSales[date] = { quantidadeVendas: 0, valorTotalVendas: 0 };
        }
        groupedSales[date].quantidadeVendas += 1;
        groupedSales[date].valorTotalVendas += sale.valor_total;
      }
    });

    const labels = Object.keys(groupedSales);
    const quantidadeVendas = Object.values(groupedSales).map(
      (data) => data.quantidadeVendas
    );
    const valorTotalVendas = Object.values(groupedSales).map(
      (data) => data.valorTotalVendas
    );

    this.vendasTotal = somaTotalVendas;

    this.chart = new Chart(ctx, {
      type: 'bar', // Tipo de gráfico de barras
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade de Vendas',
            data: quantidadeVendas,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'quantidade', // Eixo Y para a quantidade de vendas
          },
          {
            label: 'Valor Total de Vendas',
            data: valorTotalVendas,
            type: 'line', // Tipo de gráfico de linha
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'valor', // Eixo Y para o valor total de vendas
          },
        ],
      },
      options: {
        scales: {
          quantidade: {
            position: 'left',
            beginAtZero: true,
          },
          valor: {
            position: 'right',
            beginAtZero: true,
          },
        },
      },
    });
  }


  createBarChart(): void {
    // Recupere as datas selecionadas (startDate e endDate)
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    // Filtrar as vendas com base nas datas selecionadas e no vendedor selecionado
    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        // Verifica se a data da venda está dentro do intervalo selecionado
        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          // Verifica se o vendedor selecionado é vazio ou corresponde ao vendedor da venda
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            return true;
          }
        }
      }
      return false;
    });

    const vendedorSalesMap = new Map<string, number>();

    // Calcular o total de vendas para cada vendedor
    filteredSales.forEach((sale) => {
      const vendedor = sale.vendedor || 'Sem Vendedor';
      const valorTotal = sale.valor_total || 0;

      if (!vendedorSalesMap.has(vendedor)) {
        vendedorSalesMap.set(vendedor, valorTotal);
      } else {
        vendedorSalesMap.set(vendedor, vendedorSalesMap.get(vendedor)! + valorTotal);
      }
    });

    // Ordenar os vendedores com base no total de vendas (do maior para o menor)
    const sortedVendedores = [...vendedorSalesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    // Criar dados para o gráfico de barra
    const labels = sortedVendedores;
    const data = labels.map((label) => vendedorSalesMap.get(label) || 0);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
    ];

    // Verifique se já existe um gráfico de barras e o destrua
    if (this.barChart) {
      this.barChart.destroy();
    }

    // Crie o gráfico de barras no elemento HTML
    const barCanvas: any = document.getElementById('barChart');
    const barCtx = barCanvas.getContext('2d');

    const dataset = labels.map((label, index) => ({
      label: label,
      data: [data[index]],
      backgroundColor: backgroundColors[index % backgroundColors.length],
    }));

    this.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Vendedores'],
        datasets: dataset,
      },
    });
  }

  filterSales(): void {
    // Recupere as datas selecionadas (startDate e endDate)
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    // Filtrar as vendas com base nas datas selecionadas e no vendedor selecionado
    this.filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        // Verifica se a data da venda está dentro do intervalo selecionado
        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          // Verifica se o vendedor selecionado é vazio ou corresponde ao vendedor da venda
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            return true;
          }
        }
      }
      return false;
    });

    this.createChart();
    this.createBarChart();
    this.calculateTopProducts();
    this.calculateDistinctCustomerCount();
    this.calculateAveragePrice();
  }

  calculateTopProducts(): void {
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        // Imprima informações de depuração no console
        console.log('Venda:', sale);
        console.log('startDate:', startDate);
        console.log('endDate:', endDate);
        console.log('selectedVendedor:', selectedVendedor);

        // Verifica se a data da venda está dentro do intervalo selecionado
        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          // Verifica se o vendedor selecionado é vazio ou corresponde ao vendedor da venda
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            return true;
          }
        }
      }
      return false;
    });

    // Agora, você pode trabalhar com o array de vendas filtradas.
    const productQuantities: { [key: string]: number } = {};
    const productPrices: { [key: string]: number } = {};

    filteredSales.forEach((sale) => {
      sale.produtos.forEach((produto: { codigo_produto: string; quantidade: number; preco_unitario: number; }) => {
        const productCode = produto.codigo_produto || 'P000000';
        const quantitySold = produto.quantidade || 0;
        const pricePerUnit = produto.preco_unitario || 0;

        if (productQuantities.hasOwnProperty(productCode)) {
          productQuantities[productCode] += quantitySold;
        } else {
          productQuantities[productCode] = quantitySold;
        }

        if (!productPrices.hasOwnProperty(productCode)) {
          productPrices[productCode] = pricePerUnit;
        }
      });
    });

    const productSales: { [key: string]: number } = {};

    for (const productCode in productQuantities) {
      if (productQuantities.hasOwnProperty(productCode) && productPrices.hasOwnProperty(productCode)) {
        const quantitySold = productQuantities[productCode];
        const pricePerUnit = productPrices[productCode];
        const totalSales = quantitySold * pricePerUnit;
        productSales[productCode] = totalSales;
      }
    }

    const productSalesArray: [string, number][] = Object.entries(productSales);

    productSalesArray.sort((a, b) => b[1] - a[1]);

    this.topProducts = productSalesArray.slice(0, 1);
  }

  calculateDistinctCustomerCount(): void {
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    const distinctCustomers = new Set<string>();

    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            if (sale.cliente != null) {
              distinctCustomers.add(sale.cliente);
            }
            return true;
          }
        }
      }
      return false;
    });

    this.distinctCustomerCount = distinctCustomers.size;
  }

  calcularSomaCustoProdutos(venda: any): number {
    if (venda.produtos && venda.produtos.length > 0) {
      return venda.produtos.reduce((total: number, produto: any) => total + produto.preco_custo, 0);
    } else {
      return 0;
    }
  }

  calcularLucroTotal(venda: any): number {
    if (venda.produtos && venda.produtos.length > 0) {
      const somaCustoProdutos = this.calcularSomaCustoProdutos(venda);
      const valorTotal = parseFloat(venda.valor_total);

      if (!isNaN(valorTotal)) {
        return valorTotal - somaCustoProdutos;
      }
    }

    return 0;
  }

  calculateAveragePrice(): void {
    const startDate = this.startDate ? new Date(this.startDate) : null;
    const endDate = this.endDate ? new Date(this.endDate) : null;
    const selectedVendedor =
      this.selectedVendedor === 'Todos os Vendedores'
        ? ''
        : this.selectedVendedor;

    let totalValue = 0;
    let totalQuantity = 0;

    const filteredSales = this.sales.filter((sale) => {
      if (sale.data_venda) {
        const saleDate = new Date(sale.data_venda);

        if (
          (!startDate || saleDate >= startDate) &&
          (!endDate || saleDate <= endDate)
        ) {
          if (
            !selectedVendedor ||
            sale.vendedor === selectedVendedor
          ) {
            for (const produto of sale.produtos) {
              totalValue += produto.quantidade * produto.preco_unitario;
              totalQuantity += produto.quantidade;
            }
            return true;
          }
        }
      }
      return false;
    });

    if (totalQuantity > 0) {
      this.averagePrice = totalValue / totalQuantity;
    } else {
      this.averagePrice = 0;
    }
  }


  clearFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedVendedor = 'Todos os Vendedores';
    this.filteredSales = this.sales;
    this.createChart();
    this.createBarChart();
    this.calculateTopProducts();
    this.calculateDistinctCustomerCount();
    this.calculateAveragePrice();

  }


  //QickFilter Buttons//
  filterThisMonth(): void {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    this.startDate = firstDayOfMonth.toISOString().slice(0, 10);
    this.endDate = lastDayOfMonth.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterLastMonth(): void {
    const currentDate = new Date();
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    this.startDate = firstDayOfLastMonth.toISOString().slice(0, 10);
    this.endDate = lastDayOfLastMonth.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterThisWeek(): void {
    const currentDate = new Date();
    const today = currentDate.getDay();
    const firstDayOfThisWeek = new Date(currentDate);
    firstDayOfThisWeek.setDate(currentDate.getDate() - today);
    this.startDate = firstDayOfThisWeek.toISOString().slice(0, 10);
    this.endDate = currentDate.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterLastWeek(): void {
    const currentDate = new Date();
    const today = currentDate.getDay();
    const lastSunday = new Date(currentDate);
    lastSunday.setDate(currentDate.getDate() - today - 7);
    const lastSaturday = new Date(currentDate);
    lastSaturday.setDate(currentDate.getDate() - today - 1);
    this.startDate = lastSunday.toISOString().slice(0, 10);
    this.endDate = lastSaturday.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterLastYear(): void {
    const currentDate = new Date();
    const firstDayOfLastYear = new Date(currentDate.getFullYear() - 1, 0, 1);
    const lastDayOfLastYear = new Date(currentDate.getFullYear() - 1, 11, 31);
    this.startDate = firstDayOfLastYear.toISOString().slice(0, 10);
    this.endDate = lastDayOfLastYear.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterThisYear(): void {
    const currentDate = new Date();
    const firstDayOfThisYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfThisYear = new Date(currentDate.getFullYear(), 11, 31);
    this.startDate = firstDayOfThisYear.toISOString().slice(0, 10);
    this.endDate = lastDayOfThisYear.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }

  filterToday(): void {
    const currentDate = new Date();
    this.startDate = currentDate.toISOString().slice(0, 10);
    this.endDate = currentDate.toISOString().slice(0, 10);
    this.filterSales(); // Aplicar o filtro
  }


}
