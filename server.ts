import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Lun.ai' });
  });

  // AI Financial Analysis Endpoint
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { monthsData, expenseCategories, incomeCategories } = req.body;

      if (!apiKey) {
        return res.status(400).json({
          error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        });
      }

      // Prepare context summary for Gemini
      const promptData = {
        months: monthsData.map((m: any) => {
          const totalExpense = Number(
            Object.values(m.expenses || {}).reduce(
              (acc: number, val: any) => acc + (Number(val) || 0),
              0
            )
          );
          const totalIncome = Number(
            Object.values(m.income || {}).reduce(
              (acc: number, val: any) => acc + (Number(val) || 0),
              0
            )
          );
          return {
            month: `${m.monthName} / ${m.year}`,
            income: totalIncome,
            expenses: totalExpense,
            balance: totalIncome - totalExpense,
            expenseBreakdown: m.expenses,
          };
        }),
        expenseCategories: expenseCategories.map((c: any) => c.name),
        incomeCategories: incomeCategories.map((c: any) => c.name),
      };

      const systemInstruction = `Você é o Lun.ai, um analista e consultor financeiro pessoal extremamente inteligente, prático e objetivo.
Seu objetivo é examinar a planilha financeira do usuário e oferecer estratégias claras de otimização, identificando desperdícios, indicando em quais categorias cortar gastos e calculando a economia potencial.
Responda SEMPRE em Português do Brasil de forma estruturada em JSON seguindo o schema fornecido.`;

      const prompt = `Analise a seguinte planilha financeira do usuário e forneça um diagnóstico profissional com sugestões concretas de cortes de gastos:
${JSON.stringify(promptData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryOverview: {
                type: Type.STRING,
                description: 'Visão geral resumida do comportamento financeiro.',
              },
              financialHealthStatus: {
                type: Type.STRING,
                enum: ['Excelente', 'Saudável', 'Alerta', 'Crítico'],
                description: 'Status atual da saúde financeira.',
              },
              healthScore: {
                type: Type.INTEGER,
                description: 'Nota de saúde financeira de 0 a 100.',
              },
              topWasteCategory: {
                type: Type.STRING,
                description: 'Categoria onde há maior potencial de vazamento de dinheiro ou alto impacto.',
              },
              monthlySavingsOpportunity: {
                type: Type.NUMBER,
                description: 'Estimativa realista de economia mensal em R$.',
              },
              suggestions: {
                type: Type.ARRAY,
                description: 'Sugestões detalhadas de cortes em categorias específicas.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    currentAmount: { type: Type.NUMBER },
                    suggestedCut: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING },
                    actionStep: { type: Type.STRING },
                  },
                  required: ['category', 'currentAmount', 'suggestedCut', 'reasoning', 'actionStep'],
                },
              },
              generalAdvice: {
                type: Type.ARRAY,
                description: 'Dicas práticas de planejamento financeiro e reservas.',
                items: { type: Type.STRING },
              },
            },
            required: [
              'summaryOverview',
              'financialHealthStatus',
              'healthScore',
              'topWasteCategory',
              'monthlySavingsOpportunity',
              'suggestions',
              'generalAdvice',
            ],
          },
        },
      });

      const analysisJson = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: analysisJson });
    } catch (err: any) {
      console.error('Error in /api/ai/analyze:', err);
      return res.status(500).json({
        error: 'Erro ao gerar análise com Lun.ai.',
        details: err?.message || String(err),
      });
    }
  });

  // AI Chat Endpoint for Lun.ai Assistant
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { userMessage, history, monthsData } = req.body;

      if (!apiKey) {
        return res.status(400).json({
          error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        });
      }

      // Calculate brief financial summary
      let totalIncomeSum = 0;
      let totalExpenseSum = 0;
      (monthsData || []).forEach((m: any) => {
        Object.values(m.expenses || {}).forEach((v: any) => (totalExpenseSum += Number(v) || 0));
        Object.values(m.income || {}).forEach((v: any) => (totalIncomeSum += Number(v) || 0));
      });

      const contextSummary = `
Contexto Financeiro Atual do Usuário (Lun.ai App):
- Total acumulado Renda: R$ ${totalIncomeSum.toFixed(2)}
- Total acumulado Gastos: R$ ${totalExpenseSum.toFixed(2)}
- Saldo acumulado: R$ ${(totalIncomeSum - totalExpenseSum).toFixed(2)}
- Meses registrados: ${(monthsData || []).map((m: any) => m.monthName).join(', ')}
`;

      const systemInstruction = `Você é o Lun.ai, o assistente virtual financeiro pessoal do aplicativo Lun.ai.
Sua postura é amigável, encorajadora, empática e altamente focada em educação financeira prática.
Responda de forma concisa, direta, legível com formatação markdown, sugerindo planos práticos para economizar, quitar dívidas, controlar parcelamentos e investir com segurança no Brasil.`;

      const formattedContents = [
        {
          role: 'user',
          parts: [{ text: `Abaixo estão os dados financeiros do usuário:\n${contextSummary}` }],
        },
      ];

      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        });
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        reply: response.text || 'Não consegui analisar no momento.',
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      return res.status(500).json({
        error: 'Erro no chat do Lun.ai.',
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lun.ai] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
