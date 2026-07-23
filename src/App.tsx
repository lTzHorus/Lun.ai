// Importações dos Hooks do React para gerenciamento de estado e ciclo de vida
import React, { useState, useEffect } from 'react';
// Importação dos dados de referência e tipos TypeScript do projeto
import {
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_INCOME_CATEGORIES,
  INITIAL_MONTHS,
} from './data/initialData';
import { Category, MonthRecord } from './types';
// Importação dos componentes da interface de usuário
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ExpensesTable } from './components/ExpensesTable';
import { IncomeTable } from './components/IncomeTable';
import { SummaryTable } from './components/SummaryTable';
import { ChartsView } from './components/ChartsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { DatabaseModal } from './components/DatabaseModal';
import { AiConsultant } from './components/AiConsultant';
import { RotateCcw } from 'lucide-react';

// Componente Raiz da Aplicação Lun.ai
export default function App() {
  // Estado de Autenticação: Inicia como false para SEMPRE abrir na tela de login ao acessar a primeira vez
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // Email do usuário logado na sessão ativa
  const [userEmail, setUserEmail] = useState<string>('');

  // Estado do Modo Escuro: Inicia como FALSE por padrão (Tema claro inicial conforme solicitado)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('lunai_dark_mode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Estado dos registros mensais armazenados em localStorage ou com padrão
  const [months, setMonths] = useState<MonthRecord[]>(() => {
    const saved = localStorage.getItem('lunai_months');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler meses salvos:', e);
      }
    }
    return INITIAL_MONTHS;
  });

  // Estado das categorias cadastradas (Gastos e Rendas)
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('lunai_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler categorias salvas:', e);
      }
    }
    return [...INITIAL_EXPENSE_CATEGORIES, ...INITIAL_INCOME_CATEGORIES];
  });

  // Estados dos seletores de filtros dinâmicos estilo Power BI
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Controle da aba de navegação ativa no dashboard
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'income' | 'summary' | 'ai'>('dashboard');
  // Controle de visibilidade dos modais de transação e banco de dados
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  // Efeito colateral para aplicar/remover a classe 'dark' no elemento raiz HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lunai_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persistência automática dos meses no localStorage
  useEffect(() => {
    localStorage.setItem('lunai_months', JSON.stringify(months));
  }, [months]);

  // Persistência automática das categorias no localStorage
  useEffect(() => {
    localStorage.setItem('lunai_categories', JSON.stringify(categories));
  }, [categories]);

  // Handler de login ativado pela Tela de Login
  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  // Handler de logout para retornar à tela de login
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  // Alterna o tema global da aplicação entre Claro e Escuro
  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Função para zerar todas as informações da planilha (iniciar sem dados simulados)
  const handleClearAllData = () => {
    if (window.confirm('Deseja ZERAR toda a planilha e iniciar com valores limpos (R$ 0,00)?')) {
      const cleared = months.map((m) => ({
        ...m,
        expenses: {},
        income: {},
      }));
      setMonths(cleared);
      localStorage.setItem('lunai_months', JSON.stringify(cleared));
    }
  };

  // Atualização direta do valor de uma célula da planilha
  const handleUpdateValue = (monthId: string, categoryId: string, value: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId) {
          if (category.type === 'expense') {
            return {
              ...m,
              expenses: { ...m.expenses, [categoryId]: value },
            };
          } else {
            return {
              ...m,
              income: { ...m.income, [categoryId]: value },
            };
          }
        }
        return m;
      })
    );
  };

  // Criação de nova categoria de lançamento
  const handleAddCategory = (name: string, type: 'expense' | 'income') => {
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    const newCat: Category = {
      id: newId,
      name,
      type,
      color: type === 'expense' ? '#8b5cf6' : '#10b981',
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Remoção de categoria existente
  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Inclusão de um novo mês na estrutura da planilha
  const handleAddMonth = (monthName: string, year: number) => {
    const newId = 'm_' + Date.now().toString().slice(-6);
    const newMonthRecord: MonthRecord = {
      id: newId,
      monthName,
      year,
      expenses: {},
      income: {},
    };
    setMonths((prev) => [...prev, newMonthRecord]);
  };

  // Restauração aos dados iniciais de referência
  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados originais da imagem de referência?')) {
      setMonths(INITIAL_MONTHS);
      setCategories([...INITIAL_EXPENSE_CATEGORIES, ...INITIAL_INCOME_CATEGORIES]);
      localStorage.removeItem('lunai_months');
      localStorage.removeItem('lunai_categories');
    }
  };

  // Processamento inteligente de contas parceladas ou recorrentes
  const handleSubmitTransaction = (data: {
    title: string;
    categoryId: string;
    type: 'expense' | 'income';
    amount: number;
    startMonthId: string;
    repetitions: number;
    isInstallmentSplit: boolean;
    customCategoryName?: string;
  }) => {
    let finalCatId = data.categoryId;

    if (data.categoryId === 'custom' && data.customCategoryName) {
      finalCatId = data.customCategoryName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
      const newCat: Category = {
        id: finalCatId,
        name: data.customCategoryName,
        type: data.type,
        color: data.type === 'expense' ? '#8b5cf6' : '#10b981',
      };
      setCategories((prev) => [...prev, newCat]);
    }

    const monthlyValue =
      data.isInstallmentSplit && data.repetitions > 1
        ? Number((data.amount / data.repetitions).toFixed(2))
        : data.amount;

    let startIdx = months.findIndex((m) => m.id === data.startMonthId);
    if (startIdx === -1) startIdx = 0;

    const monthNamesList = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    setMonths((prevMonths) => {
      const updated = [...prevMonths];

      for (let i = 0; i < data.repetitions; i++) {
        const targetIdx = startIdx + i;

        if (targetIdx >= updated.length) {
          const lastMonth = updated[updated.length - 1];
          const lastMonthName = lastMonth ? lastMonth.monthName : 'Dezembro';
          const lastYear = lastMonth ? lastMonth.year : 2026;

          let nameIdx = monthNamesList.indexOf(lastMonthName);
          let nextNameIdx = (nameIdx + 1) % 12;
          let nextYear = nameIdx === 11 ? lastYear + 1 : lastYear;
          let nextName = monthNamesList[nextNameIdx];

          const newM: MonthRecord = {
            id: 'm_gen_' + Date.now() + '_' + i,
            monthName: nextName,
            year: nextYear,
            expenses: {},
            income: {},
          };
          updated.push(newM);
        }

        const currentM = updated[targetIdx];
        if (data.type === 'expense') {
          const currentVal = currentM.expenses[finalCatId] || 0;
          updated[targetIdx] = {
            ...currentM,
            expenses: {
              ...currentM.expenses,
              [finalCatId]: Number((currentVal + monthlyValue).toFixed(2)),
            },
          };
        } else {
          const currentVal = currentM.income[finalCatId] || 0;
          updated[targetIdx] = {
            ...currentM,
            income: {
              ...currentM.income,
              [finalCatId]: Number((currentVal + monthlyValue).toFixed(2)),
            },
          };
        }
      }

      return updated;
    });
  };

  // Se o usuário não estiver autenticado, exibe a Tela de Login Animada
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  // Renderização da Aplicação Principal após o Login
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#F8F7FF] text-slate-800'
    }`}>
      
      {/* Cabeçalho e Barra de Navegação */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onResetData={handleResetData}
        onClearAllData={handleClearAllData}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onLogout={handleLogout}
        userEmail={userEmail}
      />

      {/* Conteúdo Principal do Painel */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Cards com Métricas Agregadas */}
        <SummaryCards
          months={months}
          selectedMonthId={selectedMonthId}
          selectedCategoryId={selectedCategoryId}
          onOpenAiConsultant={() => setActiveTab('ai')}
          darkMode={darkMode}
        />

        {/* Exibição Dinâmica da Aba Selecionada */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Gráficos Interativos estilo Power BI com cross-filtering */}
            <ChartsView
              months={months}
              categories={categories}
              selectedMonthId={selectedMonthId}
              selectedCategoryId={selectedCategoryId}
              onSelectMonth={(id) => setSelectedMonthId(id)}
              onSelectCategory={(id) => setSelectedCategoryId(id)}
              darkMode={darkMode}
            />
            {/* Tabela de Resumo Consolidado */}
            <SummaryTable months={months} darkMode={darkMode} />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="animate-fadeIn">
            <ExpensesTable
              categories={categories}
              months={months}
              onUpdateValue={handleUpdateValue}
              onAddCategory={handleAddCategory}
              onAddMonth={handleAddMonth}
              onDeleteCategory={handleDeleteCategory}
              darkMode={darkMode}
            />
          </div>
        )}

        {activeTab === 'income' && (
          <div className="animate-fadeIn">
            <IncomeTable
              categories={categories}
              months={months}
              onUpdateValue={handleUpdateValue}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              darkMode={darkMode}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="animate-fadeIn">
            <SummaryTable months={months} darkMode={darkMode} />
            <ChartsView
              months={months}
              categories={categories}
              selectedMonthId={selectedMonthId}
              selectedCategoryId={selectedCategoryId}
              onSelectMonth={(id) => setSelectedMonthId(id)}
              onSelectCategory={(id) => setSelectedCategoryId(id)}
              darkMode={darkMode}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-fadeIn">
            <AiConsultant
              months={months}
              expenseCategories={categories.filter((c) => c.type === 'expense')}
              incomeCategories={categories.filter((c) => c.type === 'income')}
            />
          </div>
        )}

      </main>

      {/* Rodapé da Aplicação */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-purple-200/60 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className={darkMode ? 'text-purple-300' : 'text-purple-950'}>Lun.ai</strong> — Controle Financeiro Inteligente & Consultoria com IA
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAllData}
              className="hover:text-rose-500 font-bold transition flex items-center gap-1"
            >
              Zerar Tabela ($0)
            </button>
            <button
              onClick={handleResetData}
              className="hover:text-purple-500 flex items-center gap-1 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados da Imagem
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Adição de Transação */}
      <AddTransactionModal
        categories={categories}
        months={months}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitTransaction={handleSubmitTransaction}
      />

      {/* Modal Guia de Criação de Banco de Dados */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

    </div>
  );
}
