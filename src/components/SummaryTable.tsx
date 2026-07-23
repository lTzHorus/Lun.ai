// Importação de dependências do React e utilitários
import React, { useState, useMemo } from 'react';
import { MonthRecord } from '../types';
import { formatBRL } from '../utils/formatters';
import { Calculator, ArrowUpRight, ArrowDownRight, Scale, Filter, ArrowUpDown, RotateCcw, Search } from 'lucide-react';

// Interface das propriedades do componente SummaryTable
interface SummaryTableProps {
  months: MonthRecord[]; // Lista dos meses da planilha
  darkMode?: boolean; // Booleano para alternar tema escuro
}

// Componente da Tabela de Resumo Anual Comparativo com Filtros e Ordenação de Colunas
export const SummaryTable: React.FC<SummaryTableProps> = ({ months, darkMode }) => {
  // ESTADOS DE FILTROS E ORDENAÇÃO DE COLUNAS
  const [monthSearch, setMonthSearch] = useState(''); // Filtro por busca de mês
  const [statusFilter, setStatusFilter] = useState<'all' | 'surplus' | 'deficit'>('all'); // Filtro de saldo positivo ou negativo
  const [sortField, setSortField] = useState<'month' | 'income' | 'expenses' | 'diff'>('month'); // Campo ordenado
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Sentido da ordenação

  // Alterna a ordenação da coluna selecionada
  const handleSort = (field: 'month' | 'income' | 'expenses' | 'diff') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reseta todos os filtros das colunas
  const handleResetFilters = () => {
    setMonthSearch('');
    setStatusFilter('all');
    setSortField('month');
    setSortDirection('asc');
  };

  // Mapeamento e cálculo de Renda, Despesas e Diferença por Mês
  const processedRows = useMemo(() => {
    return months.map((m) => {
      const inc = Number(Object.values(m.income || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
      const exp = Number(Object.values(m.expenses || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
      const diff = inc - exp;

      return {
        monthId: m.id,
        monthName: m.monthName,
        income: inc,
        expenses: exp,
        diff: diff,
      };
    });
  }, [months]);

  // Aplicação dos filtros e ordenação na tabela comparativa
  const filteredAndSortedRows = useMemo(() => {
    return processedRows
      .filter((r) => {
        // Busca por nome do mês
        if (monthSearch.trim() && !r.monthName.toLowerCase().includes(monthSearch.toLowerCase())) {
          return false;
        }

        // Filtro de saldo (Superávit vs Déficit)
        if (statusFilter === 'surplus' && r.diff < 0) return false;
        if (statusFilter === 'deficit' && r.diff >= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'month') {
          return sortDirection === 'asc'
            ? a.monthName.localeCompare(b.monthName)
            : b.monthName.localeCompare(a.monthName);
        }
        if (sortField === 'income') {
          return sortDirection === 'asc' ? a.income - b.income : b.income - a.income;
        }
        if (sortField === 'expenses') {
          return sortDirection === 'asc' ? a.expenses - b.expenses : b.expenses - a.expenses;
        }
        if (sortField === 'diff') {
          return sortDirection === 'asc' ? a.diff - b.diff : b.diff - a.diff;
        }
        return 0;
      });
  }, [processedRows, monthSearch, statusFilter, sortField, sortDirection]);

  // Cálculo dos totais agregados sobre os dados exibidos
  let grandTotalIncome = 0;
  let grandTotalExpenses = 0;
  filteredAndSortedRows.forEach((r) => {
    grandTotalIncome += r.income;
    grandTotalExpenses += r.expenses;
  });
  const grandTotalDiff = grandTotalIncome - grandTotalExpenses;

  const hasActiveFilters = Boolean(monthSearch || statusFilter !== 'all' || sortField !== 'month');

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs mb-8 transition-colors ${
      darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-800'
    }`}>
      
      {/* Cabeçalho da Seção de Resumo */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-purple-100 text-purple-900'}`}>
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
            Resumo Anual Comparativo (Renda x Gastos)
          </h2>
          <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Balanço consolidado com filtros de coluna e ordenação de desempenho.
          </p>
        </div>
      </div>

      {/* PAINEL DE FILTROS DAS COLUNAS DE RESUMO */}
      <div className={`p-3 rounded-xl border mb-4 flex flex-wrap items-center gap-3 text-xs ${
        darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-purple-50/70 border-purple-100'
      }`}>
        <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filtros das Colunas de Resumo:</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar Mês..."
            value={monthSearch}
            onChange={(e) => setMonthSearch(e.target.value)}
            className="pl-8 pr-2 py-1 rounded-lg border text-xs bg-white dark:bg-zinc-900 dark:border-zinc-700 text-slate-900 dark:text-slate-100 w-32 focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-2 py-1 rounded-lg border text-xs bg-white dark:bg-zinc-900 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          <option value="all">Todos os Balanços (Positivos e Negativos)</option>
          <option value="surplus">Apenas Superávit (Saldo Positivo ≥ 0)</option>
          <option value="deficit">Apenas Déficit (Saldo Negativo &lt; 0)</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabela de Resumo Mês a Mês */}
        <div className={`lg:col-span-2 overflow-x-auto border rounded-xl shadow-xs ${
          darkMode ? 'border-zinc-800' : 'border-purple-200'
        }`}>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-purple-900 text-white font-bold select-none">
                
                <th className="p-2.5 border-r border-purple-800">
                  <button
                    onClick={() => handleSort('month')}
                    className="flex items-center justify-between w-full hover:text-amber-300 transition"
                    title="Ordenar por Mês"
                  >
                    <span>Meses</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </th>

                <th className="p-2.5 border-r border-purple-800 text-right">
                  <button
                    onClick={() => handleSort('income')}
                    className="flex items-center justify-end gap-1 w-full hover:text-amber-300 transition"
                    title="Ordenar por Renda Total"
                  >
                    <span>Renda Total</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </th>

                <th className="p-2.5 border-r border-purple-800 text-right">
                  <button
                    onClick={() => handleSort('expenses')}
                    className="flex items-center justify-end gap-1 w-full hover:text-amber-300 transition"
                    title="Ordenar por Gastos Totais"
                  >
                    <span>Gastos Totais</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </th>

                <th className="p-2.5 text-right bg-purple-950">
                  <button
                    onClick={() => handleSort('diff')}
                    className="flex items-center justify-end gap-1 w-full hover:text-amber-300 transition"
                    title="Ordenar por Diferença / Saldo"
                  >
                    <span>Diferença (Saldo)</span>
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </th>

              </tr>
            </thead>
            <tbody className={`divide-y font-semibold ${
              darkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-200 text-slate-900'
            }`}>
              {filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    Nenhum período atende aos filtros de resumo selecionados.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map((r, idx) => {
                  const isEven = idx % 2 === 0;
                  const isDiffPositive = r.diff >= 0;

                  return (
                    <tr
                      key={r.monthId}
                      className={`transition ${
                        darkMode
                          ? isEven ? 'bg-zinc-900 hover:bg-zinc-800/80' : 'bg-zinc-800/40 hover:bg-zinc-800/80'
                          : isEven ? 'bg-white hover:bg-purple-50' : 'bg-slate-50/80 hover:bg-purple-50'
                      }`}
                    >
                      <td className={`p-2.5 font-bold border-r ${darkMode ? 'border-zinc-800 text-zinc-100' : 'border-slate-200 text-slate-900'}`}>
                        {r.monthName}
                      </td>
                      <td className={`p-2.5 text-right font-bold border-r ${darkMode ? 'border-zinc-800 text-emerald-400' : 'border-slate-200 text-emerald-700'}`}>
                        {formatBRL(r.income)}
                      </td>
                      <td className={`p-2.5 text-right font-bold border-r ${darkMode ? 'border-zinc-800 text-rose-400' : 'border-slate-200 text-rose-700'}`}>
                        {formatBRL(r.expenses)}
                      </td>
                      <td
                        className={`p-2.5 text-right font-extrabold ${
                          isDiffPositive
                            ? darkMode ? 'text-purple-300 bg-purple-950/40' : 'text-purple-950 bg-purple-50'
                            : 'text-amber-600 bg-amber-50/50'
                        }`}
                      >
                        {formatBRL(r.diff)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-purple-900 text-white font-extrabold border-t-2 border-purple-950">
                <td className="p-2.5 border-r border-purple-800">Totais</td>
                <td className="p-2.5 text-right border-r border-purple-800 text-emerald-300">
                  {formatBRL(grandTotalIncome)}
                </td>
                <td className="p-2.5 text-right border-r border-purple-800 text-rose-300">
                  {formatBRL(grandTotalExpenses)}
                </td>
                <td className="p-2.5 text-right bg-purple-950 text-amber-300 font-black">
                  {formatBRL(grandTotalDiff)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Card Lateral com Balanço Geral do Ano */}
        <div className="p-5 rounded-2xl bg-purple-900 text-white shadow-md flex flex-col justify-between border border-purple-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-purple-300" />
              <h3 className="font-bold text-base text-white">Balanço Consolidado</h3>
            </div>
            
            <div className="space-y-3 divide-y divide-purple-800/80 text-sm">
              <div className="flex items-center justify-between pt-2">
                <span className="text-purple-200">Gasto Total:</span>
                <span className="font-bold text-rose-300">{formatBRL(grandTotalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-purple-200">Renda Total:</span>
                <span className="font-bold text-emerald-300">{formatBRL(grandTotalIncome)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-base">
                <span className="font-semibold text-white">Diferença (Saldo):</span>
                <span className="font-black text-amber-300">{formatBRL(grandTotalDiff)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-purple-950/60 border border-purple-800/50 text-xs text-purple-200">
            {grandTotalDiff >= 0 ? (
              <div className="flex items-start gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Você possui um saldo positivo de <strong>{formatBRL(grandTotalDiff)}</strong>.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Seus gastos superam a renda acumulada no período.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
