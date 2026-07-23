import React, { useState } from 'react';
import { X, Database, Check, Copy, Server, FileCode, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [dbType, setDbType] = useState<'postgres' | 'mongodb'>('postgres');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const postgresDDL = `-- ============================================================
-- ESQUEMA RELACIONAL POSTGRESQL / CLOUD PG (Supabase, Neon, GCP)
-- ============================================================

-- 1. Tabela de Categorias
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

-- ÍNDICES RECOMENDADOS PARA PERFORMANCE
CREATE INDEX idx_transactions_month ON transactions(month_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_monthly_records_month ON monthly_records(month_id);`;

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

  const envConfig = `# Exemplo de Conexão com Banco de Dados Nuvem (.env)

# Para PostgreSQL (Neon, Supabase, Cloud SQL, Render)
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/lunai_db?sslmode=require"

# Para MongoDB Nuvem (MongoDB Atlas)
MONGODB_URI="mongodb+srv://usuario:senha@cluster0.mongodb.net/lunai_db?retryWrites=true&w=majority"`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full border border-purple-200 shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Guia de Criação do Banco de Dados Nuvem
              </h2>
              <p className="text-xs text-slate-500">
                Instruções completas para estruturar PostgreSQL (SQL) ou MongoDB (NoSQL) para o Lun.ai
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

        {/* Content Body */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1 text-xs text-slate-700">
          
          {/* Selector Tabs: PostgreSQL vs MongoDB */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
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

          {/* Table Breakdown Info Card */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
            <h3 className="font-bold text-purple-900 flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Estrutura das Tabelas & Relacionamentos
            </h3>
            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              O banco de dados precisa armazenar 2 entidades principais: <strong>Categories</strong> (Categorias de Gastos e Rendas) e <strong>Months / MonthlyRecords</strong> (Meses da planilha com os valores preenchidos em cada célula por categoria).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                <span className="font-bold text-purple-900 block text-[11px]">1. Categories (Tabela)</span>
                <span className="text-[10px] text-slate-500">Guarda ID, Nome da Categoria, Tipo ('expense' | 'income') e Cor.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                <span className="font-bold text-purple-900 block text-[11px]">2. Monthly Records (Valores)</span>
                <span className="text-[10px] text-slate-500">Relaciona cada Mês a cada Categoria com o valor em R$.</span>
              </div>
            </div>
          </div>

          {/* DDL / Code Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-600" />
                {dbType === 'postgres' ? 'Código SQL DDL (Criação das Tabelas)' : 'Código Mongoose (Schemas Documentais)'}
              </span>
              <button
                onClick={() => handleCopy(dbType === 'postgres' ? postgresDDL : mongodbSchemas, 'code')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
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

          {/* Connection String Example */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Variáveis de Ambiente Recomendadas (.env)
              </span>
              <button
                onClick={() => handleCopy(envConfig, 'env')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
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

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0 mt-4">
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
