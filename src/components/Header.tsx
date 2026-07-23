// Importação das dependências do React e ícones lucide-react
import React from 'react';
import {
  Sparkles,
  Table,
  BarChart3,
  PlusCircle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Database,
  Sun,
  Moon,
  LogOut,
  Eraser,
} from 'lucide-react';

// Interface das propriedades aceitas pelo componente de Cabeçalho (Header)
interface HeaderProps {
  // Aba ativa selecionada pelo usuário no menu de navegação
  activeTab: 'dashboard' | 'expenses' | 'income' | 'summary' | 'ai';
  // Função para alterar a aba ativa da aplicação
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'income' | 'summary' | 'ai') => void;
  // Handler para abrir o modal de inserção de nova transação
  onOpenAddModal: () => void;
  // Handler para abrir o guia de criação de banco de dados
  onOpenDatabaseModal: () => void;
  // Handler para restaurar a planilha aos dados de referência
  onResetData: () => void;
  // Handler para zerar totalmente a planilha (iniciar sem dados simulados)
  onClearAllData: () => void;
  // Booleano informando se o modo escuro está ativado
  darkMode: boolean;
  // Função para alternar o modo claro e escuro em toda a aplicação
  onToggleDarkMode: () => void;
  // Função para realizar logout e retornar à tela de login
  onLogout: () => void;
  // Email do usuário logado na sessão atual
  userEmail: string;
}

// Componente Header do Sistema Lun.ai
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenDatabaseModal,
  onResetData,
  onClearAllData,
  darkMode,
  onToggleDarkMode,
  onLogout,
  userEmail,
}) => {
  return (
    // Elemento <header> fixo no topo com efeito glassmorphism e cores dinâmicas de tema
    <header className={`sticky top-0 z-30 border-b transition-colors duration-200 backdrop-blur-md shadow-xs ${
      darkMode
        ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
        : 'bg-white/95 border-purple-100 text-slate-800'
    }`}>
      {/* Container responsivo com largura máxima contida */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-3">
          
          {/* Barra Superior: Logotipo, Status do Analista IA e Ações de Usuário */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Bloco da Marca e Identidade Visual */}
            <div className="flex items-center gap-3">
              {/* Logotipo Lun.ai em caixa roxa destacada */}
              <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                L
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-purple-300' : 'text-purple-950'}`}>
                    Lun.ai
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                    darkMode
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    Financial Intelligence
                  </span>
                </div>
                <p className={`text-[11px] font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Controle financeiro inteligente & consultoria IA
                </p>
              </div>

              {/* Indicador de Status do Consultor IA Ativo */}
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border ml-2 ${
                darkMode ? 'bg-purple-950/60 border-purple-800 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-800'
              }`}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold">
                  Lun.ai Analyst Active
                </span>
              </div>
            </div>

            {/* Lado Direito: Perfil, Botão de Dark Mode, Zerar Dados e Botão Principal */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Botão de Alternar Modo Claro / Escuro (Solicitado pelo usuário) */}
              <button
                onClick={onToggleDarkMode}
                type="button"
                className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                  darkMode
                    ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700'
                    : 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
                }`}
                title={darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline text-zinc-200">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-700" />
                    <span className="hidden md:inline text-purple-900">Escuro</span>
                  </>
                )}
              </button>

              {/* Perfil do Usuário Logado */}
              <div className="hidden sm:flex items-center gap-2.5 border-r border-slate-200 dark:border-zinc-800 pr-3">
                <div className="text-right">
                  <p className={`text-xs font-bold ${darkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                    {userEmail.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-purple-600 font-semibold">Conta Verificada</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userEmail.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Botão de Guia de Banco de Dados */}
              <button
                onClick={onOpenDatabaseModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-xs font-bold shadow-xs active:scale-95 ${
                  darkMode
                    ? 'bg-purple-950/60 border-purple-800 text-purple-200 hover:bg-purple-900'
                    : 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
                }`}
                title="Ver Como Criar Banco de Dados (PostgreSQL / MongoDB)"
              >
                <Database className="w-4 h-4 text-purple-600" />
                <span className="hidden md:inline">Banco SQL</span>
              </button>

              {/* Botão para Zerar Tabela / Limpar Planilha (Sem dados simulados) */}
              <button
                onClick={onClearAllData}
                className={`p-2 rounded-lg transition ${
                  darkMode ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Zerar dados e iniciar planilha limpa ($0)"
              >
                <Eraser className="w-4 h-4" />
              </button>

              {/* Botão de Restaurar Dados Originais da Imagem */}
              <button
                onClick={onResetData}
                className={`p-2 rounded-lg transition ${
                  darkMode ? 'text-zinc-400 hover:text-purple-300 hover:bg-zinc-800' : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
                }`}
                title="Restaurar dados de exemplo da imagem"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Botão de Nova Transação */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Transação</span>
                <span className="sm:hidden">+</span>
              </button>

              {/* Botão de Sair / Voltar ao Login */}
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg transition ${
                  darkMode ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                }`}
                title="Sair do Sistema e Voltar ao Login"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Menu de Navegação Superior por Abas */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-purple-700 text-white font-bold shadow-sm'
                  : darkMode
                    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-purple-300'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Visão Geral & Power BI
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'bg-purple-700 text-white font-bold shadow-sm'
                  : darkMode
                    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-purple-300'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-orange-500" />
              Tabela de Gastos
            </button>

            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'income'
                  ? 'bg-purple-700 text-white font-bold shadow-sm'
                  : darkMode
                    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-purple-300'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Tabela de Renda
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-purple-700 text-white font-bold shadow-sm'
                  : darkMode
                    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-purple-300'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <Table className="w-4 h-4" />
              Resumo Anual
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-sm font-bold'
                  : darkMode
                    ? 'text-purple-300 bg-purple-950/60 border border-purple-800 hover:bg-purple-900'
                    : 'text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Consultor IA (Lun.ai)
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
