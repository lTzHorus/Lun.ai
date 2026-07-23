// Importação do React e ícones para manipulação do Modal de Banco de Dados
import React, { useState } from 'react';
import { X, Database, Check, Copy, Server, FileCode, Layers, ShieldCheck, Sparkles, Download, Printer, FileText } from 'lucide-react';

// Interface das propriedades recebidas pelo DatabaseModal
interface DatabaseModalProps {
  isOpen: boolean; // Indica se o modal está visível
  onClose: () => void; // Callback para fechar o modal
}

// Componente do Guia e Exportador da Documentação do Banco de Dados
export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Estado para alternar visualização entre SQL (PostgreSQL) e NoSQL (MongoDB)
  const [dbType, setDbType] = useState<'postgres' | 'mongodb'>('postgres');
  // Estado para indicar qual código foi copiado com sucesso para a área de transferência
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copia trechos de código para a área de transferência
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Script SQL DDL Completo para PostgreSQL
  const postgresDDL = `-- ============================================================
-- ESQUEMA RELACIONAL POSTGRESQL / CLOUD PG (Supabase, Neon, GCP)
-- ============================================================

-- 1. Tabela de Categorias (Gastos e Rendas)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  color VARCHAR(30) DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Meses Registrados
CREATE TABLE IF NOT EXISTS months (
  id VARCHAR(50) PRIMARY KEY,
  month_name VARCHAR(30) NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_month_year UNIQUE (month_name, year)
);

-- 3. Tabela de Lançamentos Individuais / Transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  month_id VARCHAR(50) REFERENCES months(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Valores Mensais Consolidados por Categoria (Matriz da Planilha)
CREATE TABLE IF NOT EXISTS monthly_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id VARCHAR(50) NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_month_category UNIQUE (month_id, category_id)
);

-- ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX idx_transactions_month ON transactions(month_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_monthly_records_month ON monthly_records(month_id);`;

  // 2. Schemas Mongoose para MongoDB
  const mongodbSchemas = `// ============================================================
// SCHEMAS MONGOOSE / MONGODB ATLAS (NUVEM)
// ============================================================
import mongoose, { Schema, Document } from 'mongoose';

// 1. Schema de Categoria
export interface ICategory extends Document {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
}

const CategorySchema = new Schema<ICategory>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  color: { type: String, default: '#8b5cf6' }
});

// 2. Schema de Registro Mensal (Estrutura de Planilha)
export interface IMonthRecord extends Document {
  id: string;
  monthName: string;
  year: number;
  expenses: Map<string, number>; // key: categoryId, value: amount
  income: Map<string, number>;   // key: categoryId, value: amount
}

const MonthRecordSchema = new Schema<IMonthRecord>({
  id: { type: String, required: true, unique: true },
  monthName: { type: String, required: true },
  year: { type: Number, required: true },
  expenses: { type: Map, of: Number, default: {} },
  income: { type: Map, of: Number, default: {} }
}, { timestamps: true });

// Models
export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
export const MonthRecordModel = mongoose.model<IMonthRecord>('MonthRecord', MonthRecordSchema);`;

  const envConfig = `# Conexão de Banco de Dados Nuvem (.env)

# PostgreSQL (Neon / Supabase / GCP Cloud SQL)
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/lunai_db?sslmode=require"

# MongoDB Atlas (Nuvem NoSQL)
MONGODB_URI="mongodb+srv://usuario:senha@cluster0.mongodb.net/lunai_db?retryWrites=true&w=majority"`;

  // Função para realizar o download da documentação em formato JSON
  const handleDownloadJSON = () => {
    const jsonDocumentation = {
      app: "Lun.ai - Controle Financeiro Inteligente",
      version: "2.0.0",
      description: "Documentação completa para criação das tabelas e esquemas de dados em banco de dados",
      databaseArchitecture: {
        tables: [
          {
            tableName: "categories",
            description: "Armazena as categorias de despesas e fontes de receita",
            fields: [
              { name: "id", type: "VARCHAR(50)", isPrimaryKey: true, description: "Identificador único (ex: mercado, salario)" },
              { name: "name", type: "VARCHAR(100)", description: "Nome visível da categoria" },
              { name: "type", type: "VARCHAR(20)", description: "Tipo de lançamento ('expense' ou 'income')" },
              { name: "color", type: "VARCHAR(30)", description: "Código Hex da cor da categoria para gráficos" }
            ]
          },
          {
            tableName: "months",
            description: "Armazena os períodos mensais da planilha financeira",
            fields: [
              { name: "id", type: "VARCHAR(50)", isPrimaryKey: true, description: "ID único do mês (ex: m_jan26)" },
              { name: "month_name", type: "VARCHAR(30)", description: "Nome por extenso do mês (ex: Janeiro)" },
              { name: "year", type: "INT", description: "Ano de referência (ex: 2026)" }
            ]
          },
          {
            tableName: "monthly_records",
            description: "Armazena a matriz de valores cruzando mês e categoria",
            fields: [
              { name: "id", type: "UUID", isPrimaryKey: true, description: "Chave primária única" },
              { name: "month_id", type: "VARCHAR(50)", isForeignKey: true, references: "months.id" },
              { name: "category_id", type: "VARCHAR(50)", isForeignKey: true, references: "categories.id" },
              { name: "amount", type: "NUMERIC(12,2)", description: "Valor financeiro em Reais (R$)" }
            ]
          }
        ],
        ddlSQL: postgresDDL,
        mongooseSchemas: mongodbSchemas
      },
      sampleSeedData: {
        categories: [
          { id: "mercado", name: "Mercado / Alimentação", type: "expense", color: "#8b5cf6" },
          { id: "salario", name: "Salário Principal", type: "income", color: "#10b981" }
        ],
        months: [
          {
            id: "m_jan26",
            monthName: "Janeiro",
            year: 2026,
            expenses: { mercado: 1850.50 },
            income: { salario: 8500.00 }
          }
        ]
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonDocumentation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "lunai_banco_de_dados_documentacao.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Função para baixar documentação explicativa em Markdown/Texto
  const handleDownloadMD = () => {
    const mdContent = `# Documentação e Guia de Banco de Dados — Lun.ai

## 1. Visão Geral
O Lun.ai utiliza um modelo financeiro matricial composto por categorias de receita/despesa e períodos mensais.

## 2. Esquema Relacional PostgreSQL (SQL DDL)
\`\`\`sql
${postgresDDL}
\`\`\`

## 3. Schemas Mongoose / MongoDB (NoSQL)
\`\`\`typescript
${mongodbSchemas}
\`\`\`

## 4. Variáveis de Ambiente (.env)
\`\`\`env
${envConfig}
\`\`\`

---
Gerado automaticamente pelo Lun.ai Platform
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = "lunai_guia_banco_de_dados.md";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Função para acionar o modo de impressão do navegador para gerar PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full border border-purple-200 shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Guia & Documentação de Banco de Dados
              </h2>
              <p className="text-xs text-slate-500">
                Instruções de criação de tabelas SQL, schemas NoSQL e exportação de documentação JSON/PDF.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Conteúdo */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1 text-xs text-slate-700">
          
          {/* BARRA DE AÇÕES E DOWNLOAD DE DOCUMENTAÇÃO */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md print:hidden">
            <div>
              <span className="font-bold text-sm block">Exportar Documentação do Banco</span>
              <span className="text-[11px] text-purple-200">Baixe o pacote com scripts SQL, Schemas e dados JSON para criação das tabelas.</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
                title="Download do arquivo JSON com todas as tabelas e schemas"
              >
                <Download className="w-4 h-4" />
                <span>Baixar JSON</span>
              </button>

              <button
                onClick={handleDownloadMD}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition active:scale-95"
                title="Baixar documentação em formato Markdown"
              >
                <FileText className="w-4 h-4" />
                <span>Guia MD</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
                title="Imprimir ou salvar como PDF"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Abas Selecionadoras: PostgreSQL vs MongoDB */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl print:hidden">
            <button
              onClick={() => setDbType('postgres')}
              className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                dbType === 'postgres'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-4 h-4" />
              PostgreSQL / Cloud PG (SQL)
            </button>
            <button
              onClick={() => setDbType('mongodb')}
              className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                dbType === 'mongodb'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              MongoDB Nuvem / Atlas (NoSQL)
            </button>
          </div>

          {/* Card explicativo das Tabelas */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
            <h3 className="font-bold text-purple-900 flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Como Criar e Estruturar as Tabelas no Banco de Dados
            </h3>
            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              Para persistir os dados do Lun.ai na nuvem, você deve executar o script SQL ou definir os esquemas NoSQL conforme documentado abaixo. A estrutura consiste na tabela <strong>categories</strong> (Categorias), <strong>months</strong> (Meses) e <strong>monthly_records</strong> (Matriz de valores).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                <span className="font-bold text-purple-900 block text-[11px]">1. Tabela Categories</span>
                <span className="text-[10px] text-slate-500">Contém id, name, type ('expense' | 'income') e color hexadecimal.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                <span className="font-bold text-purple-900 block text-[11px]">2. Tabela Monthly Records</span>
                <span className="text-[10px] text-slate-500">Chave estrangeira relacionando Mês e Categoria com o valor em Reais.</span>
              </div>
            </div>
          </div>

          {/* Código SQL DDL / Mongoose */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-600" />
                {dbType === 'postgres' ? 'Código SQL DDL (Criação das Tabelas)' : 'Código Mongoose (Schemas Documentais)'}
              </span>
              <button
                onClick={() => handleCopy(dbType === 'postgres' ? postgresDDL : mongodbSchemas, 'code')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition print:hidden"
              >
                {copiedKey === 'code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800 shadow-xs max-h-64">
              {dbType === 'postgres' ? postgresDDL : mongodbSchemas}
            </pre>
          </div>

          {/* Variáveis de Ambiente */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Variáveis de Conexão (.env)
              </span>
              <button
                onClick={() => handleCopy(envConfig, 'env')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition print:hidden"
              >
                {copiedKey === 'env' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar .env
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
              {envConfig}
            </pre>
          </div>

        </div>

        {/* Rodapé com Fechamento e Botões de Ação */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 mt-4 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs hover:bg-purple-200 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download Schemas JSON
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            Entendido, Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
