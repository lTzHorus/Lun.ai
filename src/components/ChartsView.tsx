// Importações de dependências do React e bibliotecas de gráficos Chart.js e ícones lucide-react
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Category, MonthRecord } from '../types';
import { formatBRL } from '../utils/formatters';
import { BarChart3, PieChart, TrendingUp, Filter, X, Sparkles } from 'lucide-react';

// Registro dos elementos e escalas necessários para funcionamento do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Interface com as propriedades recebidas pelo componente ChartsView
interface ChartsViewProps {
  months: MonthRecord[]; // Lista dos meses cadastrados
  categories: Category[]; // Lista de categorias financeiras
  selectedMonthId: string | null; // Mês selecionado para filtro dinâmico
  selectedCategoryId: string | null; // Categoria selecionada para filtro dinâmico
  onSelectMonth: (monthId: string | null) => void; // Callback para alterar mês filtrado
  onSelectCategory: (categoryId: string | null) => void; // Callback para alterar categoria filtrada
  darkMode?: boolean; // Booleano para adaptar cores dos gráficos no modo escuro
}

// Componente de Gráficos e Filtro Interativo Padrão Power BI
export const ChartsView: React.FC<ChartsViewProps> = ({
  months,
  categories,
  selectedMonthId,
  selectedCategoryId,
  onSelectMonth,
  onSelectCategory,
  darkMode,
}) => {
  // Rótulos dos meses para o eixo X do gráfico principal
  const monthLabels = months.map((m) => m.monthName);

  // Filtra dados com base nos seletores ativos (Power BI Cross-Filtering)
  const filteredMonths = selectedMonthId
    ? months.filter((m) => m.id === selectedMonthId)
    : months;

  // Cálculo da renda total por mês considerando filtros
  const incomeData: number[] = months.map((m) => {
    if (selectedCategoryId) {
      return Number(m.income[selectedCategoryId] || 0);
    }
    return Number(Object.values(m.income || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
  });

  // Cálculo de gastos totais por mês considerando filtros
  const expenseData: number[] = months.map((m) => {
    if (selectedCategoryId) {
      return Number(m.expenses[selectedCategoryId] || 0);
    }
    return Number(Object.values(m.expenses || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
  });

  // Cálculo da diferença/saldo mensal (Renda - Gastos)
  const diffData = incomeData.map((inc, i) => inc - expenseData[i]);

  // Agregação geral dos valores
  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpenses = expenseData.reduce((a, b) => a + b, 0);

  // Lista de categorias de gastos
  const expenseCats = categories.filter((c) => c.type === 'expense');
  const catTotals = expenseCats.map((cat) => {
    return filteredMonths.reduce((acc, m) => acc + (m.expenses[cat.id] || 0), 0);
  });

  // Definição dinâmica de cores com base no tema ativo
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

  // Configuração dos dados para o Gráfico Combinado (Barras + Linha)
  const comboChartData = {
    labels: monthLabels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Saldo (Diferença)',
        data: diffData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: '#7e22ce',
        pointRadius: 5,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Entradas / Renda',
        data: incomeData,
        backgroundColor: '#059669',
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Saídas / Gastos',
        data: expenseData,
        backgroundColor: '#e11d48',
        borderRadius: 6,
        yAxisID: 'y',
      },
    ],
  };

  // Configuração de opções e evento de clique estilo Power BI no Gráfico Combinado
  const comboChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedMonth = months[index];
        if (clickedMonth) {
          // Alterna ou aplica a seleção do mês clicado
          if (selectedMonthId === clickedMonth.id) {
            onSelectMonth(null);
          } else {
            onSelectMonth(clickedMonth.id);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: 'sans-serif', size: 12, weight: 'bold' as const },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatBRL(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: function (value: any) {
            return 'R$ ' + value;
          },
        },
        grid: { color: gridColor },
      },
    },
  };

  // Dados do gráfico de Rosca (Proporção Gastos x Renda)
  const pieChartData = {
    labels: ['Gastos Totais', 'Saldo Remanescente'],
    datasets: [
      {
        data: [totalExpenses, Math.max(0, totalIncome - totalExpenses)],
        backgroundColor: ['#f43f5e', '#10b981'],
        hoverBackgroundColor: ['#e11d48', '#059669'],
        borderWidth: 2,
        borderColor: darkMode ? '#18181b' : '#ffffff',
      },
    ],
  };

  // Opções do gráfico de Rosca com Tooltip formatada em R$ e %
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: textColor, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const rawVal = context.raw || 0;
            const percentage = totalIncome > 0 ? ((rawVal / totalIncome) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatBRL(rawVal)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Dados do gráfico de distribuição por Categorias
  const categoryChartData = {
    labels: expenseCats.map((c) => c.name),
    datasets: [
      {
        data: catTotals,
        backgroundColor: [
          '#8b5cf6',
          '#ec4899',
          '#3b82f6',
          '#10b981',
          '#06b6d4',
          '#f59e0b',
          '#ef4444',
          '#84cc16',
          '#a855f7',
          '#f97316',
          '#64748b',
        ],
        borderWidth: 2,
        borderColor: darkMode ? '#18181b' : '#ffffff',
      },
    ],
  };

  // Opções do gráfico de categorias com evento de clique interativo estilo Power BI
  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedCat = expenseCats[index];
        if (clickedCat) {
          if (selectedCategoryId === clickedCat.id) {
            onSelectCategory(null);
          } else {
            onSelectCategory(clickedCat.id);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: textColor, font: { size: 11 } },
      },
    },
  };

  // Obtém nome do mês e da categoria selecionados para exibir no banner de filtro
  const selectedMonthObj = months.find((m) => m.id === selectedMonthId);
  const selectedCatObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6 mb-8">
      
      {/* Banner de Controle de Filtros Dinâmicos Estilo Power BI */}
      <div className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
        selectedMonthId || selectedCategoryId
          ? 'bg-purple-900 text-white border-purple-700 shadow-md'
          : darkMode
            ? 'bg-zinc-900 text-zinc-200 border-zinc-800'
            : 'bg-white text-slate-800 border-purple-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${selectedMonthId || selectedCategoryId ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-900'}`}>
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Filtros Dinâmicos (Power BI Interativo)</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200">
                Clique nos gráficos para filtrar
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {selectedMonthId || selectedCategoryId
                ? `Exibindo dados filtrados por: ${selectedMonthObj ? `Mês (${selectedMonthObj.monthName})` : ''} ${selectedCatObj ? ` Categoria (${selectedCatObj.name})` : ''}`
                : 'Selecione um mês ou categoria clicando diretamente nos elementos dos gráficos abaixo.'}
            </p>
          </div>
        </div>

        {/* Botão de Limpar Filtros quando ativo */}
        {(selectedMonthId || selectedCategoryId) && (
          <button
            onClick={() => {
              onSelectMonth(null);
              onSelectCategory(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Seletor Rápido de Mês e Categoria estilo Slicer do Power BI */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Slicers Rápido:
        </span>
        {months.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectMonth(selectedMonthId === m.id ? null : m.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedMonthId === m.id
                ? 'bg-purple-700 text-white shadow-xs'
                : darkMode
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-white text-slate-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            {m.monthName}
          </button>
        ))}
      </div>

      {/* Gráfico Principal: Evolução Mensal (Barras + Linha) */}
      <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs transition-colors ${
        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-purple-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-purple-100 text-purple-900'}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Evolução Mensal (Renda vs Gastos e Saldo)
              </h2>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Clique em uma barra para isolar o mês selecionado em todo o painel
              </p>
            </div>
          </div>
        </div>

        <div className="h-80 w-full relative">
          <Bar data={comboChartData as any} options={comboChartOptions} />
        </div>
      </div>

      {/* Linha Inferior com 2 Gráficos de Rosca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Proporção Gastos x Renda */}
        <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between transition-colors ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-purple-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-100 text-indigo-900'}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Proporção: Gastos x Renda Total
              </h3>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Percentual da renda comprometido com saídas
              </p>
            </div>
          </div>

          <div className="h-64 w-full relative my-auto">
            <Doughnut data={pieChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Categoria de Gastos */}
        <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between transition-colors ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-purple-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-rose-950 text-rose-300' : 'bg-rose-100 text-rose-800'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Distribuição por Categoria de Gastos
              </h3>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Clique em uma fatia para filtrar por categoria específica
              </p>
            </div>
          </div>

          <div className="h-64 w-full relative my-auto">
            <Doughnut data={categoryChartData} options={categoryChartOptions} />
          </div>
        </div>

      </div>

    </div>
  );
};
