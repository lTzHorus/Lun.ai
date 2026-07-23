// Importação de dependências do React e utilitários
import React from 'react';
import { MonthRecord } from '../types';
import { formatBRL } from '../utils/formatters';
import { Calculator, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';

// Interface das propriedades do componente SummaryTable
interface SummaryTableProps {
  months: MonthRecord[]; // Lista dos meses da planilha
  darkMode?: boolean; // Booleano para alternar tema escuro
}

// Componente da Tabela de Resumo Anual Comparativo
export const SummaryTable: React.FC<SummaryTableProps> = ({ months, darkMode }) => {
  // Variáveis para consolidação dos totais anuais
  let grandTotalIncome = 0;
  let grandTotalExpenses = 0;

  // Processamento linha a linha calculando entradas, saídas e saldo
  const rows = months.map((m) => {
    const inc = Number(Object.values(m.income || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
    const exp = Number(Object.values(m.expenses || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0));
    const diff = inc - exp;

    grandTotalIncome += inc;
    grandTotalExpenses += exp;

    return {
      monthId: m.id,
      monthName: m.monthName,
      income: inc,
      expenses: exp,
      diff: diff,
    };
  });

  // Cálculo da diferença final do ano (Saldo Total)
  const grandTotalDiff = grandTotalIncome - grandTotalExpenses;

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
            Balanço consolidado período a período com análise de superávit / déficit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabela de Resumo Mês a Mês */}
        <div className={`lg:col-span-2 overflow-x-auto border rounded-xl shadow-xs ${
          darkMode ? 'border-zinc-800' : 'border-purple-200'
        }`}>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-purple-900 text-white font-bold">
                <th className="p-2.5 border-r border-purple-800">Meses</th>
                <th className="p-2.5 border-r border-purple-800 text-right">Renda Total</th>
                <th className="p-2.5 border-r border-purple-800 text-right">Gastos Totais</th>
                <th className="p-2.5 text-right bg-purple-950">Diferença (Saldo)</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-semibold ${
              darkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-200 text-slate-900'
            }`}>
              {rows.map((r, idx) => {
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
              })}
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
