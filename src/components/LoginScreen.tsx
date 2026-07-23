// Importação de dependências do React e ícones do lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, Sun, Moon, ShieldCheck, CheckCircle2 } from 'lucide-react';

// Interface das propriedades recebidas pelo componente de Login
interface LoginScreenProps {
  // Função executada quando o usuário realiza o login com sucesso
  onLogin: (userEmail: string) => void;
  // Estado atual do tema (escuro ou claro)
  darkMode: boolean;
  // Função para alternar entre tema claro e escuro
  onToggleDarkMode: () => void;
}

// Componente principal da Tela de Login
export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, darkMode, onToggleDarkMode }) => {
  // Estado local para armazenar o email digitado pelo usuário
  const [email, setEmail] = useState('marianasilva@empresa.com.br');
  // Estado local para armazenar a senha digitada pelo usuário
  const [password, setPassword] = useState('••••••••••••');
  // Estado de carregamento para simular processo de autenticação
  const [isLoading, setIsLoading] = useState(false);
  // Referência para o elemento HTML Canvas que renderiza as linhas tracejadas animadas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Efeito colateral para controlar a animação do canvas de fundo com linhas tracejadas
  useEffect(() => {
    // Obtém o elemento canvas da página
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Obtém o contexto 2D para renderização gráfica no canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Variável para controlar o identificador da animação requestAnimationFrame
    let animationFrameId: number;
    // Deslocamento para animar os traços das linhas
    let offset = 0;

    // Função de redimensionamento do canvas para ocupar toda a tela
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Define dimensões iniciais do canvas e adiciona ouvinte de redimensionamento de janela
    handleResize();
    window.addEventListener('resize', handleResize);

    // Estrutura das linhas tracejadas horizontais com posições e velocidades específicas
    const lines = Array.from({ length: 18 }, (_, i) => ({
      y: (window.innerHeight / 18) * i + 20, // Posição vertical de cada linha na tela
      speed: (i % 2 === 0 ? 1 : -1) * (0.4 + (i % 3) * 0.2), // Direção e velocidade alternadas
      dashLength: 12 + (i % 4) * 4, // Comprimento dos traços
      gapLength: 10 + (i % 3) * 5, // Espaçamento entre os traços
      opacity: 0.12 + (i % 5) * 0.04, // Opacidade suave das linhas no fundo
    }));

    // Loop de animação contínuo
    const render = () => {
      // Limpa todo o canvas a cada quadro de animação
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Incrementa o deslocamento para gerar a sensação de movimento contínuo
      offset += 0.6;

      // Desenha cada linha tracejada horizontal no canvas
      lines.forEach((line) => {
        ctx.beginPath();
        // Define o padrão do tracejado (comprimento do traço e do espaço)
        ctx.setLineDash([line.dashLength, line.gapLength]);
        // Define o deslocamento do padrão para simular o movimento
        ctx.lineDashOffset = -offset * line.speed;
        // Posição inicial da linha na borda esquerda
        ctx.moveTo(0, line.y);
        // Posição final da linha na borda direita
        ctx.lineTo(canvas.width, line.y);
        // Define a cor da linha conforme o tema ativo (claro ou escuro)
        ctx.strokeStyle = darkMode
          ? `rgba(168, 85, 247, ${line.opacity * 1.5})`
          : `rgba(126, 34, 206, ${line.opacity})`;
        ctx.lineWidth = 1.5;
        // Aplica o traço no canvas
        ctx.stroke();
      });

      // Solicita o próximo quadro de animação
      animationFrameId = requestAnimationFrame(render);
    };

    // Inicia a execução da animação
    render();

    // Limpeza ao desmontar o componente ou alterar o tema
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode]);

  // Função disparada ao enviar o formulário de login
  const handleSubmit = (e: React.FormEvent) => {
    // Previne o comportamento padrão de recarregamento da página do formulário HTML
    e.preventDefault();
    // Ativa o estado de carregamento do botão
    setIsLoading(true);

    // Simula um tempo de resposta de autenticação de 600ms para UX fluida
    setTimeout(() => {
      setIsLoading(false);
      // Chama a função fornecida pelo pai para autenticar e avançar para o app
      onLogin(email || 'marianasilva@empresa.com.br');
    }, 600);
  };

  return (
    // Container principal da tela de login ocupando 100% da viewport
    <div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-900 text-slate-100'
    }`}>
      
      {/* Canvas com linhas tracejadas animadas de lado a lado */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Gradientes sutis para dar profundidade visual e atmosfera moderna */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Botão de Dark Mode no canto superior direito */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onToggleDarkMode}
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-all duration-200 active:scale-95 shadow-lg"
          title="Alternar Tema Claro / Escuro"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-300" />
              <span>Modo Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Card Central de Login */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 rounded-3xl bg-slate-900/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-950/50 space-y-6 animate-fadeIn">
        
        {/* Cabeçalho da Marca Lun.ai */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-purple-700/40 mb-2">
            L
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Lun.ai <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs text-purple-200/80 font-medium max-w-xs mx-auto">
            Plataforma de Gestão Financeira Inteligente & Análise Preditiva
          </p>
        </div>

        {/* Formulário de Autenticação */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo de Entrada: Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-purple-200">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/10 dark:bg-zinc-800/80 border border-purple-400/30 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          {/* Campo de Entrada: Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-purple-200">
                Senha
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-medium text-purple-300 hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/10 dark:bg-zinc-800/80 border border-purple-400/30 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          {/* Botão Principal de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Acessando a Plataforma...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Botão de Acesso Rápido / Demonstração sem necessidade de digitar */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => onLogin('demo@lunai.finance')}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acesso Rápido Sem Cadastro</span>
          </button>
        </div>

        {/* Rodapé com selo de segurança */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-purple-300/60 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Conexão Segura SSL • Criptografia de Ponta a Ponta</span>
          </p>
        </div>

      </div>
    </div>
  );
};
