// Importação de dependências do React e utilitários de formatação e ícones
import React from 'react';
import { MonthRecord } from '../types';
import { formatBRL } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Sparkles } from 'lucide-react';

// Interface das propriedades do componente SummaryCards
interface SummaryCardsProps {
  months: MonthRecord[]; // Lista de meses da planilha
  selectedMonthId?: string | null; // ID do mês filtrado no gráfico Power BI
  selectedCategoryId?: string | null; // ID da categoria filtrada no gráfico
  onOpenAiConsultant: () => void; // Handler para abrir o painel da IA
  darkMode?: boolean; // Booleano para alternar estilos de tema escuro
}

// Componente dos Cards com Métricas Consolidadas e Responsivas
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  months,
  selectedMonthId,
  selectedCategoryId,
  onOpenAiConsultant,
  darkMode,
}) => {
  // Filtra os meses caso haja um filtro de mês ativo no Power BI
  const displayMonths = selectedMonthId
    ? months.filter((m) => m.id === selectedMonthId)
    : months;

  // Cálculo agregador de totais de entradas e saídas
  let totalIncome = 0;
  let totalExpenses = 0;

  displayMonths.forEach((m) => {
    if (selectedCategoryId) {
      // Se houver filtro de categoria ativo
      totalIncome += Number(m.income[selectedCategoryId] || 0);
      totalExpenses += Number(m.expenses[selectedCategoryId] || 0);
    } else {
      // Caso contrário acumula tudo do mês
      Object.values(m.income || {}).forEach((val) => (totalIncome += Number(val) || 0));
      Object.values(m.expenses || {}).forEach((val) => (totalExpenses += Number(val) || 0));
    }
  });

  // Saldo líquido acumulado
  const netBalance = totalIncome - totalExpenses;
  // Taxa percentual de economia mantida
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total de Renda / Entradas */}
      <div className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Total Renda
          </span>
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black">
          {formatBRL(totalIncome)}
        </div>
        <p className={`text-[11px] mt-1 font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          {selectedMonthId ? 'Período do mês selecionado' : `Acumulado em ${displayMonths.length} meses`}
        </p>
      </div>

      {/* Card 2: Total de Gastos / Saídas */}
      <div className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Total Gastos
          </span>
          <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black">
          {formatBRL(totalExpenses)}
        </div>
        <p className={`text-[11px] mt-1 font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          Contas, faturas e saídas operacionais
        </p>
      </div>

      {/* Card 3: Saldo Líquido / Balanço */}
      <div className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Saldo / Diferença
          </span>
          <div className={`p-2 rounded-xl ${
            netBalance >= 0
              ? 'bg-purple-100 text-purple-900'
              : 'bg-amber-100 text-amber-900'
          }`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-black ${
          netBalance >= 0
            ? darkMode ? 'text-purple-300' : 'text-purple-950'
            : 'text-rose-600'
        }`}>
          {formatBRL(netBalance)}
        </div>
        <p className={`text-[11px] mt-1 font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          {netBalance >= 0 ? 'Superávit no período analisado' : 'Déficit no período analisado'}
        </p>
      </div>

      {/* Card 4: Taxa de Economia e Chamada para o Consultor IA */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            Economia & Consultoria IA
          </span>
          <PiggyBank className="w-4 h-4 text-purple-300" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{savingsRate}%</span>
          <span className="text-xs text-purple-200 font-medium">Reservado da Renda</span>
        </div>
        <button
          onClick={onOpenAiConsultant}
          className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-100 flex items-center justify-center gap-1.5 backdrop-blur-sm transition border border-white/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Diagnóstico com IA Lun.ai
        </button>
      </div>

    </div>
  );
};
