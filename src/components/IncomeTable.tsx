// Importação de dependências do React e utilitários de formatação e ícones
import React, { useState, useMemo } from 'react';
import { Category, MonthRecord } from '../types';
import { formatBRL, parseBRLInput } from '../utils/formatters';
import { Plus, Edit2, Check, X, Wallet, Filter, ArrowUpDown, RotateCcw, Search } from 'lucide-react';

// Interface das propriedades da Tabela de Renda
interface IncomeTableProps {
  categories: Category[]; // Lista de categorias
  months: MonthRecord[]; // Lista dos meses da planilha
  onUpdateValue: (monthId: string, categoryId: string, value: number) => void; // Handler de edição de célula
  onAddCategory: (name: string, type: 'expense' | 'income') => void; // Criação de categoria de renda
  onDeleteCategory: (categoryId: string) => void; // Exclusão de categoria
  darkMode?: boolean; // Booleano para estilos de tema escuro
}

// Componente Tabela de Renda e Entradas com Filtros por Coluna
export const IncomeTable: React.FC<IncomeTableProps> = ({
  categories,
  months,
  onUpdateValue,
  onAddCategory,
  onDeleteCategory,
  darkMode,
}) => {
  // Célula atualmente em edição
  const [editingCell, setEditingCell] = useState<{ monthId: string; catId: string } | null>(null);
  // Valor digitado temporariamente no input
  const [tempValue, setTempValue] = useState<string>('');
  // Nome da nova fonte de renda e visibilidade do modal
  const [newCatName, setNewCatName] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // ESTADOS DE FILTROS E ORDENAÇÃO DE COLUNAS
  const [monthSearch, setMonthSearch] = useState(''); // Filtro por busca de mês
  const [sortField, setSortField] = useState<string | 'month' | 'total'>('month'); // Campo ordenado
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Sentido da ordenação
  const [minValFilter, setMinValFilter] = useState<string>(''); // Filtro de valor mínimo de renda
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all'); // Filtro por fonte de renda específica

  // Filtra apenas categorias do tipo renda
  const incomeCats = categories.filter((c) => c.type === 'income');

  // Alterna o sentido de ordenação da coluna selecionada
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reseta todos os filtros ativos das colunas
  const handleResetFilters = () => {
    setMonthSearch('');
    setSortField('month');
    setSortDirection('asc');
    setMinValFilter('');
    setSelectedCatFilter('all');
  };

  // Aplicação dos filtros e ordenação na lista de meses
  const filteredAndSortedMonths = useMemo(() => {
    return [...months]
      .filter((m) => {
        // Filtro por nome do mês
        if (monthSearch.trim() && !m.monthName.toLowerCase().includes(monthSearch.toLowerCase())) {
          return false;
        }

        const rowTotal = incomeCats.reduce((acc, cat) => acc + (m.income[cat.id] || 0), 0);

        // Filtro de renda mínima total no mês
        if (minValFilter) {
          const numMin = parseFloat(minValFilter);
          if (!isNaN(numMin) && rowTotal < numMin) {
            return false;
          }
        }

        // Filtro por categoria com renda recebida > 0
        if (selectedCatFilter !== 'all') {
          const valInCat = m.income[selectedCatFilter] || 0;
          if (valInCat <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'month') {
          return sortDirection === 'asc'
            ? a.monthName.localeCompare(b.monthName)
            : b.monthName.localeCompare(a.monthName);
        }

        if (sortField === 'total') {
          const totalA = incomeCats.reduce((acc, cat) => acc + (a.income[cat.id] || 0), 0);
          const totalB = incomeCats.reduce((acc, cat) => acc + (b.income[cat.id] || 0), 0);
          return sortDirection === 'asc' ? totalA - totalB : totalB - totalA;
        }

        const valA = a.income[sortField] || 0;
        const valB = b.income[sortField] || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [months, monthSearch, minValFilter, selectedCatFilter, sortField, sortDirection, incomeCats]);

  // Cálculo dos totais de colunas sobre os meses filtrados
  const columnTotals: Record<string, number> = {};
  incomeCats.forEach((cat) => {
    columnTotals[cat.id] = filteredAndSortedMonths.reduce((acc, m) => acc + (m.income[cat.id] || 0), 0);
  });

  // Cálculo do total por linha e geral das entradas
  let grandTotalIncome = 0;
  const rowTotals: Record<string, number> = {};
  filteredAndSortedMonths.forEach((m) => {
    const sum = incomeCats.reduce((acc, cat) => acc + (m.income[cat.id] || 0), 0);
    rowTotals[m.id] = sum;
    grandTotalIncome += sum;
  });

  // Edição de célula de renda
  const handleStartEdit = (monthId: string, catId: string, currentVal: number) => {
    setEditingCell({ monthId, catId });
    setTempValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '0');
  };

  const handleSaveCell = () => {
    if (editingCell) {
      const num = parseBRLInput(tempValue);
      onUpdateValue(editingCell.monthId, editingCell.catId, num);
      setEditingCell(null);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), 'income');
      setNewCatName('');
      setShowAddCatModal(false);
    }
  };

  const hasActiveFilters = Boolean(monthSearch || minValFilter || selectedCatFilter !== 'all' || sortField !== 'month');

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs mb-8 transition-colors ${
      darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-800'
    }`}>
      
      {/* Cabeçalho da Tabela de Renda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              Tabela de Renda, Entradas e Salários
            </h2>
          </div>
          <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Filtros avançados e ordenação por coluna ativos em tempo real.
          </p>
        </div>

        <button
          onClick={() => setShowAddCatModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition"
        >
          <Plus className="w-4 h-4" />
          Nova Fonte de Renda
        </button>
      </div>

      {/* PAINEL DE FILTROS DAS COLUNAS DE RENDA */}
      <div className={`p-3 rounded-xl border mb-4 flex flex-wrap items-center gap-3 text-xs ${
        darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-emerald-50/70 border-emerald-100'
      }`}>
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filtros das Colunas de Renda:</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar Mês..."
            value={monthSearch}
            onChange={(e) => setMonthSearch(e.target.value)}
            className="pl-8 pr-2 py-1 rounded-lg border text-xs bg-white dark:bg-zinc-900 dark:border-zinc-700 text-slate-900 dark:text-slate-100 w-32 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="px-2 py-1 rounded-lg border text-xs bg-white dark:bg-zinc-900 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          <option value="all">Todas as Fontes de Renda</option>
          {incomeCats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              Apenas meses com entradas em: {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Mínimo R$ Renda..."
          value={minValFilter}
          onChange={(e) => setMinValFilter(e.target.value)}
          className="px-2 py-1 rounded-lg border text-xs bg-white dark:bg-zinc-900 dark:border-zinc-700 text-slate-900 dark:text-slate-100 w-32 focus:outline-none"
        />

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

      {/* Planilha de Renda */}
      <div className={`overflow-x-auto border rounded-xl shadow-xs scrollbar-thin ${
        darkMode ? 'border-zinc-800' : 'border-emerald-200'
      }`}>
        <table className="w-full text-xs text-left border-collapse min-w-[650px]">
          
          <thead>
            <tr className="bg-emerald-800 text-white font-bold border-b-2 border-emerald-950 select-none">
              
              <th className="p-2.5 border-r border-emerald-700 sticky left-0 bg-emerald-800 z-10 w-32">
                <button
                  onClick={() => handleSort('month')}
                  className="flex items-center justify-between w-full hover:text-emerald-200 transition"
                  title="Clique para ordenar por Mês"
                >
                  <span>Meses</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-80" />
                </button>
              </th>

              {incomeCats.map((cat) => (
                <th key={cat.id} className="p-2.5 border-r border-emerald-700 text-center relative group min-w-[120px]">
                  <button
                    onClick={() => handleSort(cat.id)}
                    className="flex items-center justify-center gap-1 w-full hover:text-emerald-200 transition"
                    title={`Clique para ordenar por ${cat.name}`}
                  >
                    <span>{cat.name}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </button>

                  {incomeCats.length > 1 && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="hidden group-hover:inline-block absolute top-1 right-1 text-rose-200 hover:text-white p-0.5"
                      title="Excluir Categoria"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </th>
              ))}

              <th className="p-2.5 text-right bg-emerald-950 font-extrabold text-emerald-200 min-w-[120px]">
                <button
                  onClick={() => handleSort('total')}
                  className="flex items-center justify-end gap-1 w-full hover:text-emerald-200 transition"
                  title="Clique para ordenar pelo Total de Renda"
                >
                  <span>Total</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y font-semibold ${
            darkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-200 text-slate-900'
          }`}>
            {filteredAndSortedMonths.length === 0 ? (
              <tr>
                <td colSpan={incomeCats.length + 2} className="p-8 text-center text-slate-400 font-medium">
                  Nenhum registro encontrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredAndSortedMonths.map((m, idx) => {
                const rowTotal = rowTotals[m.id] || 0;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={m.id}
                    className={`transition ${
                      darkMode
                        ? isEven ? 'bg-zinc-900 hover:bg-zinc-800/80' : 'bg-zinc-800/40 hover:bg-zinc-800/80'
                        : isEven ? 'bg-white hover:bg-emerald-50/60' : 'bg-slate-50/80 hover:bg-emerald-50/60'
                    }`}
                  >
                    <td className={`p-2.5 font-bold border-r sticky left-0 bg-inherit z-10 ${
                      darkMode ? 'border-zinc-800 text-zinc-100' : 'border-slate-200 text-slate-900'
                    }`}>
                      {m.monthName}
                    </td>

                    {incomeCats.map((cat) => {
                      const val = m.income[cat.id];
                      const isEditing = editingCell?.monthId === m.id && editingCell?.catId === cat.id;

                      return (
                        <td
                          key={cat.id}
                          onDoubleClick={() => handleStartEdit(m.id, cat.id, val)}
                          onClick={() => !isEditing && handleStartEdit(m.id, cat.id, val)}
                          className={`p-2 border-r text-right cursor-pointer transition relative group ${
                            darkMode ? 'border-zinc-800 hover:bg-emerald-950/40' : 'border-slate-200 hover:bg-emerald-100/60'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveCell();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-24 px-1 py-0.5 text-xs text-right border-2 border-emerald-600 rounded bg-white text-slate-900 font-bold focus:outline-none"
                              />
                              <button
                                onClick={handleSaveCell}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-100 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition text-slate-400">
                                <Edit2 className="w-3 h-3" />
                              </span>
                              <span>{val !== undefined && val !== null && val !== 0 ? formatBRL(val) : ''}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className={`p-2.5 text-right font-bold ${
                      darkMode ? 'bg-emerald-950/40 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {formatBRL(rowTotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr className="bg-emerald-900 text-white font-extrabold border-t-2 border-emerald-950">
              <td className="p-2.5 border-r border-emerald-800 sticky left-0 bg-emerald-900 z-10">
                Totais
              </td>
              {incomeCats.map((cat) => (
                <td key={cat.id} className="p-2.5 border-r border-emerald-800 text-right">
                  {formatBRL(columnTotals[cat.id] || 0)}
                </td>
              ))}
              <td className="p-2.5 text-right bg-emerald-950 text-emerald-300 text-sm font-black">
                {formatBRL(grandTotalIncome)}
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

      {/* Modal Adicionar Categoria de Renda */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-5 max-w-sm w-full border shadow-2xl ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-2">
              Nova Fonte de Renda
            </h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Nome (ex: Freelance, Dividendos, Bônus)
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Freelance"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold opacity-80 hover:opacity-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
                >
                  Criar Renda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
