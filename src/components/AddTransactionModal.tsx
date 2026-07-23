import React, { useState } from 'react';
import { Category, MonthRecord } from '../types';
import { PlusCircle, X, Calendar, DollarSign, Repeat, Sparkles } from 'lucide-react';

interface AddTransactionModalProps {
  categories: Category[];
  months: MonthRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitTransaction: (data: {
    title: string;
    categoryId: string;
    type: 'expense' | 'income';
    amount: number;
    startMonthId: string;
    repetitions: number;
    isInstallmentSplit: boolean;
    customCategoryName?: string;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  categories,
  months,
  isOpen,
  onClose,
  onSubmitTransaction,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<string>(
    categories.find((c) => c.type === 'expense')?.id || 'custom'
  );
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [amount, setAmount] = useState<string>('150.00');
  const [startMonthId, setStartMonthId] = useState<string>(months[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [repetitions, setRepetitions] = useState<number>(6);
  const [isInstallmentSplit, setIsInstallmentSplit] = useState<boolean>(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSubmitTransaction({
      title,
      categoryId,
      type,
      amount: parsedAmount,
      startMonthId,
      repetitions: isRecurring ? Math.max(1, repetitions) : 1,
      isInstallmentSplit,
      customCategoryName: categoryId === 'custom' ? customCategoryName : undefined,
    });

    // Reset & Close
    setTitle('');
    setAmount('150.00');
    setIsRecurring(false);
    onClose();
  };

  const calculatedMonthlyValue = () => {
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;
    if (isRecurring && isInstallmentSplit && repetitions > 1) {
      return (numAmount / repetitions).toFixed(2);
    }
    return numAmount.toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-purple-200 shadow-2xl transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inserir Conta ou Parcelamento
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Controle de despesas fixas, recorrentes ou parceladas com repetição automática.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Type Toggle: Despesa vs Renda */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense');
                if (firstExp) setCategoryId(firstExp.id);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesa / Saída (Gasto)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income');
                if (firstInc) setCategoryId(firstInc.id);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Renda / Entrada (Ganho)
            </button>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição / Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Cartão Nubank, Parcela da Geladeira, Internet Fibra"
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Category & Amount in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="custom">+ Nova Categoria...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Total ou Mensal (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* If Custom Category selected */}
          {categoryId === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-purple-800 mb-1">
                Nome da Nova Categoria
              </label>
              <input
                type="text"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="Ex: Assinaturas, Pet, Escola"
                required
                className="w-full px-3.5 py-2 text-xs border border-purple-300 rounded-xl bg-purple-50/50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}

          {/* Start Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              A partir de qual mês?
            </label>
            <select
              value={startMonthId}
              onChange={(e) => setStartMonthId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.monthName} ({m.year})
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence & Installment Section */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold text-slate-900">
                  Conta fixa recorrente ou parcelada?
                </span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-purple-800 rounded cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 pt-2 border-t border-purple-200">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Repetir por quantos meses?
                    </label>
                    <select
                      value={repetitions}
                      onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none"
                    >
                      <option value={2}>2 meses (2x)</option>
                      <option value={3}>3 meses (3x)</option>
                      <option value={6}>6 meses (6x)</option>
                      <option value={10}>10 meses (10x)</option>
                      <option value={12}>12 meses (1 Ano)</option>
                      <option value={24}>24 meses (2 Anos)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Forma de cálculo:
                    </label>
                    <select
                      value={isInstallmentSplit ? 'split' : 'fixed'}
                      onChange={(e) => setIsInstallmentSplit(e.target.value === 'split')}
                      className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none"
                    >
                      <option value="fixed">Valor Fixo Todo Mês</option>
                      <option value="split">Dividir Valor em Parcelas</option>
                    </select>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-purple-100/80 text-[11px] text-purple-950 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Será aplicado <strong>R$ {calculatedMonthlyValue()}</strong> por mês durante{' '}
                    <strong>{repetitions} meses</strong> consecutivos.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-900 hover:bg-purple-800 text-white shadow-md transition active:scale-95"
            >
              Salvar Lançamento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
