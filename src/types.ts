export interface MonthRecord {
  id: string;
  monthName: string; // e.g. "Agosto", "Setembro"
  year: number;
  // Expense amounts keyed by expense category ID
  expenses: Record<string, number>;
  // Income amounts keyed by income category ID
  income: Record<string, number>;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color?: string;
  isFixedDefault?: boolean;
}

export interface AddTransactionPayload {
  title: string;
  categoryId: string;
  amount: number;
  type: 'expense' | 'income';
  startMonthId: string;
  repetitions: number; // 1 = unique, 2..60 = installments/repetitions
  isCustomCategory?: boolean;
  newCategoryName?: string;
}

export interface AiSavingSuggestion {
  category: string;
  currentAmount: number;
  suggestedCut: number;
  reasoning: string;
  actionStep: string;
}

export interface AiAnalysisResult {
  summaryOverview: string;
  financialHealthStatus: 'Excelente' | 'Saudável' | 'Alerta' | 'Crítico';
  healthScore: number; // 0 to 100
  topWasteCategory: string;
  monthlySavingsOpportunity: number;
  suggestions: AiSavingSuggestion[];
  generalAdvice: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
