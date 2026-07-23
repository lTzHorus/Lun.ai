// Importação de dependências do React e utilitários de formatação e ícones
import React, { useState } from 'react';
import { Category, MonthRecord } from '../types';
import { formatBRL, parseBRLInput } from '../utils/formatters';
import { Plus, Edit2, Check, X, Wallet } from 'lucide-react';

// Interface das propriedades da Tabela de Renda
interface IncomeTableProps {
  categories: Category[]; // Lista de categorias
  months: MonthRecord[]; // Lista dos meses da planilha
  onUpdateValue: (monthId: string, categoryId: string, value: number) => void; // Handler de edição de célula
  onAddCategory: (name: string, type: 'expense' | 'income') => void; // Criação de categoria de renda
  onDeleteCategory: (categoryId: string) => void; // Exclusão de categoria
  darkMode?: boolean; // Booleano para estilos de tema escuro
}

// Componente Tabela de Renda e Entradas
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
  // Nome da nova fonte de renda
  const [newCatName, setNewCatName] = useState('');
  // Estado de visibilidade do modal de nova renda
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Filtra apenas categorias do tipo renda
  const incomeCats = categories.filter((c) => c.type === 'income');

  // Cálculo dos totais de colunas
  const columnTotals: Record<string, number> = {};
  incomeCats.forEach((cat) => {
    columnTotals[cat.id] = months.reduce((acc, m) => acc + (m.income[cat.id] || 0), 0);
  });

  // Cálculo do total por linha e geral
  let grandTotalIncome = 0;
  const rowTotals: Record<string, number> = {};
  months.forEach((m) => {
    const sum = incomeCats.reduce((acc, cat) => acc + (m.income[cat.id] || 0), 0);
    rowTotals[m.id] = sum;
    grandTotalIncome += sum;
  });

  // Inicia edição da célula de renda
  const handleStartEdit = (monthId: string, catId: string, currentVal: number) => {
    setEditingCell({ monthId, catId });
    setTempValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '0');
  };

  // Salva o valor da célula de renda
  const handleSaveCell = () => {
    if (editingCell) {
      const num = parseBRLInput(tempValue);
      onUpdateValue(editingCell.monthId, editingCell.catId, num);
      setEditingCell(null);
    }
  };

  // Submissão do formulário de nova fonte de renda
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), 'income');
      setNewCatName('');
      setShowAddCatModal(false);
    }
  };

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
            Clique em qualquer célula para alterar os valores recebidos.
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

      {/* Planilha de Renda */}
      <div className={`overflow-x-auto border rounded-xl shadow-xs scrollbar-thin ${
        darkMode ? 'border-zinc-800' : 'border-emerald-200'
      }`}>
        <table className="w-full text-xs text-left border-collapse min-w-[650px]">
          
          <thead>
            <tr className="bg-emerald-800 text-white font-bold border-b-2 border-emerald-950 select-none">
              <th className="p-2.5 border-r border-emerald-700 sticky left-0 bg-emerald-800 z-10 w-32">
                Meses
              </th>
              {incomeCats.map((cat) => (
                <th key={cat.id} className="p-2.5 border-r border-emerald-700 text-center relative group min-w-[120px]">
                  <span>{cat.name}</span>
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
                Total
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y font-semibold ${
            darkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-200 text-slate-900'
          }`}>
            {months.map((m, idx) => {
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
            })}
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
