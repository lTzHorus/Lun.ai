// Importação de dependências do React, tipos de dados e ícones
import React, { useState } from 'react';
import { Category, MonthRecord } from '../types';
import { formatBRL, parseBRLInput } from '../utils/formatters';
import { Plus, Trash2, Edit2, Check, X, CreditCard } from 'lucide-react';

// Interface das propriedades aceitas pela Tabela de Gastos
interface ExpensesTableProps {
  categories: Category[]; // Lista geral de categorias
  months: MonthRecord[]; // Lista dos meses com registros
  onUpdateValue: (monthId: string, categoryId: string, value: number) => void; // Atualização de célula
  onAddCategory: (name: string, type: 'expense' | 'income') => void; // Criação de categoria
  onAddMonth: (monthName: string, year: number) => void; // Inclusão de mês
  onDeleteCategory: (categoryId: string) => void; // Exclusão de categoria
  darkMode?: boolean; // Booleano para adaptar cores no modo escuro
}

// Componente da Tabela Interativa de Gastos e Despesas
export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  categories,
  months,
  onUpdateValue,
  onAddCategory,
  onAddMonth,
  onDeleteCategory,
  darkMode,
}) => {
  // Estado para armazenar qual célula está sendo editada atualmente
  const [editingCell, setEditingCell] = useState<{ monthId: string; catId: string } | null>(null);
  // Valor temporário digitado durante a edição direta na tabela
  const [tempValue, setTempValue] = useState<string>('');
  // Nome da nova categoria a ser criada
  const [newCatName, setNewCatName] = useState('');
  // Visibilidade do modal de nova categoria
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  // Nome do novo mês a ser adicionado
  const [newMonthName, setNewMonthName] = useState('');
  // Visibilidade do modal de novo mês
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);

  // Filtra apenas as categorias do tipo 'despesa'
  const expenseCats = categories.filter((c) => c.type === 'expense');

  // Calcula os totais por coluna (por categoria de gasto)
  const columnTotals: Record<string, number> = {};
  expenseCats.forEach((cat) => {
    columnTotals[cat.id] = months.reduce((acc, m) => acc + (m.expenses[cat.id] || 0), 0);
  });

  // Calcula os totais por linha (por mês) e o total geral de despesas
  let grandTotalExpenses = 0;
  const rowTotals: Record<string, number> = {};
  months.forEach((m) => {
    const sum = expenseCats.reduce((acc, cat) => acc + (m.expenses[cat.id] || 0), 0);
    rowTotals[m.id] = sum;
    grandTotalExpenses += sum;
  });

  // Inicia a edição direta de uma célula ao clicar ou dar duplo clique
  const handleStartEdit = (monthId: string, catId: string, currentVal: number) => {
    setEditingCell({ monthId, catId });
    setTempValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '0');
  };

  // Salva o valor da célula editada e atualiza os estados globais
  const handleSaveCell = () => {
    if (editingCell) {
      const num = parseBRLInput(tempValue);
      onUpdateValue(editingCell.monthId, editingCell.catId, num);
      setEditingCell(null);
    }
  };

  // Submissão do formulário de criação de nova categoria
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), 'expense');
      setNewCatName('');
      setShowAddCatModal(false);
    }
  };

  // Submissão do formulário de inclusão de novo mês
  const handleAddMonthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMonthName.trim()) {
      onAddMonth(newMonthName.trim(), 2026);
      setNewMonthName('');
      setShowAddMonthModal(false);
    }
  };

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 shadow-xs mb-8 transition-colors ${
      darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-800'
    }`}>
      
      {/* Cabeçalho da Seção de Gastos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              Tabela de Gastos e Despesas Operacionais
            </h2>
          </div>
          <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Clique em qualquer célula para alterar os valores em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCatModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
          <button
            onClick={() => setShowAddMonthModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              darkMode ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Novo Mês
          </button>
        </div>
      </div>

      {/* Tabela Planilha de Gastos */}
      <div className={`overflow-x-auto border rounded-xl shadow-xs scrollbar-thin ${
        darkMode ? 'border-zinc-800' : 'border-purple-200'
      }`}>
        <table className="w-full text-xs text-left border-collapse min-w-[900px]">
          
          {/* Cabeçalho com Estilo Roxo Profundo */}
          <thead>
            <tr className="bg-purple-900 text-white font-bold border-b-2 border-purple-950 select-none">
              <th className="p-2.5 border-r border-purple-800 sticky left-0 bg-purple-900 z-10 w-28">
                Meses
              </th>
              {expenseCats.map((cat) => (
                <th key={cat.id} className="p-2.5 border-r border-purple-800 text-center relative group min-w-[100px]">
                  <span>{cat.name}</span>
                  {expenseCats.length > 1 && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="hidden group-hover:inline-block absolute top-1 right-1 text-rose-300 hover:text-white p-0.5"
                      title="Excluir Categoria"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </th>
              ))}
              <th className="p-2.5 text-right bg-purple-950 font-extrabold min-w-[110px]">
                Total
              </th>
            </tr>
          </thead>

          {/* Corpo das Linhas com Alternância Visual de Cores */}
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
                      : isEven ? 'bg-white hover:bg-purple-50' : 'bg-slate-50/80 hover:bg-purple-50'
                  }`}
                >
                  {/* Nome do Mês */}
                  <td className={`p-2.5 font-bold border-r sticky left-0 bg-inherit z-10 ${
                    darkMode ? 'border-zinc-800 text-zinc-100' : 'border-slate-200 text-slate-900'
                  }`}>
                    {m.monthName}
                  </td>

                  {/* Células de Valores das Categorias */}
                  {expenseCats.map((cat) => {
                    const val = m.expenses[cat.id];
                    const isEditing = editingCell?.monthId === m.id && editingCell?.catId === cat.id;

                    return (
                      <td
                        key={cat.id}
                        onDoubleClick={() => handleStartEdit(m.id, cat.id, val)}
                        onClick={() => !isEditing && handleStartEdit(m.id, cat.id, val)}
                        className={`p-2 border-r text-right cursor-pointer transition relative group ${
                          darkMode ? 'border-zinc-800 hover:bg-purple-950/40' : 'border-slate-200 hover:bg-purple-100/60'
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
                              className="w-20 px-1 py-0.5 text-xs text-right border-2 border-purple-600 rounded bg-white text-slate-900 font-bold focus:outline-none"
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

                  {/* Total da Linha por Mês */}
                  <td className={`p-2.5 text-right font-extrabold ${
                    darkMode ? 'bg-purple-950/30 text-purple-300' : 'bg-purple-50 text-purple-950'
                  }`}>
                    {formatBRL(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Rodapé com Totais Finais por Categoria */}
          <tfoot>
            <tr className="bg-purple-900 text-white font-extrabold border-t-2 border-purple-950">
              <td className="p-2.5 border-r border-purple-800 sticky left-0 bg-purple-900 z-10">
                Totais
              </td>
              {expenseCats.map((cat) => (
                <td key={cat.id} className="p-2.5 border-r border-purple-800 text-right">
                  {formatBRL(columnTotals[cat.id] || 0)}
                </td>
              ))}
              <td className="p-2.5 text-right bg-purple-950 text-amber-300 text-sm font-black">
                {formatBRL(grandTotalExpenses)}
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

      {/* Modal para Adicionar Categoria */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-5 max-w-sm w-full border shadow-2xl ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-2">
              Nova Categoria de Despesa
            </h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Nome da Categoria (ex: Farmácia, Pet, Manutenção)
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Farmácia"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-800 hover:bg-purple-900 text-white shadow-md"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Mês */}
      {showAddMonthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-5 max-w-sm w-full border shadow-2xl ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-purple-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-2">
              Adicionar Novo Mês
            </h3>
            <form onSubmit={handleAddMonthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Nome do Mês (ex: Julho, Agosto)
                </label>
                <input
                  type="text"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  placeholder="Ex: Julho"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMonthModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold opacity-80 hover:opacity-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-800 hover:bg-purple-900 text-white shadow-md"
                >
                  Adicionar Mês
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
