import React, { useState } from 'react';
import { Category, MonthRecord, AiAnalysisResult, ChatMessage } from '../types';
import { formatBRL } from '../utils/formatters';
import {
  Sparkles,
  Bot,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Send,
  Loader2,
  Scissors,
  PiggyBank,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';

interface AiConsultantProps {
  months: MonthRecord[];
  expenseCategories: Category[];
  incomeCategories: Category[];
}

export const AiConsultant: React.FC<AiConsultantProps> = ({
  months,
  expenseCategories,
  incomeCategories,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Olá! Sou o Lun.ai, seu consultor e analista financeiro pessoal. Como posso te ajudar hoje? Posso sugerir onde cortar gastos, avaliar seus parcelamentos ou criar um plano de economia.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Trigger Automatic AI Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthsData: months,
          expenseCategories,
          incomeCategories,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        setAnalysisError(data.error || 'Não foi possível gerar a análise.');
      }
    } catch (err: any) {
      console.error('Error fetching AI analysis:', err);
      setAnalysisError('Erro de conexão ao comunicar com o servidor da IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message to AI Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isChatSending) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    const userMsgObj: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsgObj]);
    setIsChatSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          history: chatMessages.map((m) => ({ sender: m.sender, text: m.text })),
          monthsData: months,
        }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        const aiMsgObj: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, aiMsgObj]);
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Desculpe, tive um problema ao analisar sua pergunta. Tente novamente em instantes.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-xl border border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-800/80 text-amber-300 ring-1 ring-purple-600/50">
              <BrainCircuit className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Analista e Consultor Financeiro IA (Lun.ai)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-purple-200">
            A IA do Lun.ai analisa seus padrões mensais de renda, faturas de cartão e contas recorrentes para apontar exatamente onde você pode cortar despesas e economizar todo mês.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-70 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              Analisando Planilha...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Executar Análise de Gastos
            </>
          )}
        </button>
      </div>

      {/* Analysis Error Message */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Health Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Score & Status */}
            <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-xs flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-purple-900 text-white font-black text-xl shadow-md">
                {analysisResult.healthScore}
                <span className="text-[10px] text-purple-300 absolute bottom-1">/100</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Saúde Financeira
                </span>
                <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  {analysisResult.financialHealthStatus}
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pontuação com base nos fluxos registrados
                </p>
              </div>
            </div>

            {/* Top Waste Category */}
            <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Maior Foco de Custo
              </span>
              <div className="text-lg font-bold text-rose-600 mt-1 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                {analysisResult.topWasteCategory}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Categoria prioritária para revisão de hábitos
              </p>
            </div>

            {/* Savings Opportunity */}
            <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-300">
                Oportunidade de Economia Mensal
              </span>
              <div className="text-2xl font-black text-emerald-300 my-1">
                {formatBRL(analysisResult.monthlySavingsOpportunity)} / mês
              </div>
              <p className="text-[11px] text-emerald-200">
                Potencial de corte acumulado com ajustes simples
              </p>
            </div>

          </div>

          {/* Overview text */}
          <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-700" />
              Visão Geral do Diagnóstico
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {analysisResult.summaryOverview}
            </p>
          </div>

          {/* Cost Cutting Suggestions List */}
          <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sugestões de Cortes de Gastos Recomendados
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Plano acionável formulado pelo analista com base na sua planilha
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      {sug.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                      Corte Sugerido: {formatBRL(sug.suggestedCut)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {sug.reasoning}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-purple-100 text-xs text-purple-950 font-semibold flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Ação recomendada:</strong> {sug.actionStep}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Financial Advice */}
          <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-700" />
              Diretrizes de Planejamento Financeiro
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
              {analysisResult.generalAdvice.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-700 shrink-0 mt-2" />
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* Interactive AI Chat Window ("Pergunte à Lun.ai") */}
      <div className="bg-white border border-purple-200 rounded-3xl p-5 shadow-md space-y-4">
        
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-purple-900 text-white">
            <MessageSquare className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pergunte à Lun.ai (Chat do Consultor)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tire dúvidas sobre investimentos, parcelamentos ou peça planos para economizar.
            </p>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="h-72 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 scrollbar-thin">
          {chatMessages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow ${
                    isAi
                      ? 'bg-purple-900 text-purple-100'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : 'Você'}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAi
                      ? 'bg-white text-slate-900 font-medium border border-purple-200'
                      : 'bg-purple-900 text-white font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isAi ? 'text-slate-400 font-medium' : 'text-purple-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isChatSending && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-purple-800 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
              <span>Lun.ai está digitando a resposta...</span>
            </div>
          )}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ex: Como economizar R$ 300 este mês? Ou devo quitar o empréstimo?"
            disabled={isChatSending}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isChatSending}
            className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </form>

      </div>

    </div>
  );
};
