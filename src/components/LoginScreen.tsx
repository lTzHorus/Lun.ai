// Importação de dependências do React e ícones do lucide-react para elementos visuais e de navegação
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, Sun, Moon, ShieldCheck, CheckCircle2, TrendingUp, DollarSign, PieChart, Landmark } from 'lucide-react';

// Interface das propriedades do componente de Login com suporte a tema e callback de autenticação
interface LoginScreenProps {
  // Função executada para prosseguir para a tela principal após o login do usuário
  onLogin: (userEmail: string) => void;
  // Estado que indica se o modo escuro está ativado
  darkMode: boolean;
  // Função para alternar o tema da interface entre claro e escuro
  onToggleDarkMode: () => void;
}

// Componente da Tela de Login com Fundo Animado de Controle Financeiro
export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, darkMode, onToggleDarkMode }) => {
  // Estado local com email inicial de demonstração
  const [email, setEmail] = useState('marianasilva@empresa.com.br');
  // Estado local com senha de demonstração preenchida
  const [password, setPassword] = useState('••••••••••••');
  // Estado de carregamento simulado para feedback visual ao clicar em entrar
  const [isLoading, setIsLoading] = useState(false);
  // Referência para o elemento HTML Canvas que desenha o fundo financeiro dinâmico
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Efeito colateral para renderizar o fundo gráfico financeiro no Canvas (Linhas de Mercado, Moedas e Velas)
  useEffect(() => {
    // Obtém o elemento canvas associado pela referência useRef
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Obtém o contexto 2D de renderização gráfica
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Identificador para controle do laço de animação requestAnimationFrame
    let animationFrameId: number;
    // Variável de tempo incremental para mover os gráficos e elementos financeiros
    let time = 0;

    // Ajusta as dimensões do canvas ao tamanho atual da janela do navegador
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Aplica o redimensionamento inicial e registra o evento window resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Geração de símbolos financeiros flutuantes (R$, $, %, +R$, Velas de Gráfico)
    const symbols = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * window.innerWidth, // Posição horizontal aleatória
      y: Math.random() * window.innerHeight, // Posição vertical aleatória
      text: ['R$', '$', '€', '%', '📈', '▲ +15%', 'R$ 2.500', '✔', '📊'][i % 9], // Rótulo do elemento financeiro
      speedY: 0.3 + Math.random() * 0.5, // Velocidade de ascensão vertical
      speedX: (Math.random() - 0.5) * 0.3, // Leve oscilação lateral
      opacity: 0.12 + Math.random() * 0.25, // Opacidade para não distrair a leitura do formulário
      fontSize: 12 + Math.random() * 14, // Tamanho de fonte variado
    }));

    // Geração de linhas de grade e gráficos de tendência financeira
    const gridRows = 12; // Quantidade de linhas horizontais da planilha no fundo
    const chartBars = 30; // Barras de gráfico financeiro tipo Candlestick na parte inferior

    // Função de renderização contínua do Canvas
    const render = () => {
      // Limpa o canvas antes de desenhar cada novo quadro
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02; // Incrementa o relógio de animação

      const w = canvas.width;
      const h = canvas.height;

      // 1. DESENHO DA GRADE DE PLANILHA FINANCEIRA NO FUNDO
      ctx.lineWidth = 1;
      ctx.strokeStyle = darkMode ? 'rgba(168, 85, 247, 0.07)' : 'rgba(126, 34, 206, 0.08)';
      
      // Desenha linhas horizontais da grade da planilha
      for (let i = 0; i <= gridRows; i++) {
        const y = (h / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Desenha linhas verticais da grade
      const gridCols = Math.floor(w / 80);
      for (let j = 0; j <= gridCols; j++) {
        const x = j * 80;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 2. DESENHO DE CURVA DE TENDÊNCIA FINANCEIRA EM CRESCIMENTO (GRÁFICO DE LINHA)
      ctx.beginPath();
      ctx.setLineDash([8, 6]); // Estilo tracejado para representar projeção financeira
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = darkMode ? 'rgba(52, 211, 153, 0.35)' : 'rgba(16, 185, 129, 0.3)'; // Cor verde esmeralda de lucro
      
      // Inicia o caminho da linha de tendência na extremidade esquerda
      ctx.moveTo(0, h * 0.75);
      for (let x = 0; x <= w; x += 20) {
        // Fórmula matemática para simular oscilação de mercado com tendência geral de alta
        const y = h * 0.65 - Math.sin((x * 0.005) + time) * 40 - (x / w) * (h * 0.35) + Math.cos(x * 0.01) * 15;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Restaura o estilo de linha contínua

      // Segunda curva de investimento (roxa) com fase de onda diferente
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = darkMode ? 'rgba(192, 132, 252, 0.25)' : 'rgba(147, 51, 234, 0.2)';
      ctx.moveTo(0, h * 0.82);
      for (let x = 0; x <= w; x += 25) {
        const y = h * 0.8 - Math.cos((x * 0.006) + time * 1.2) * 35 - (x / w) * (h * 0.25);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. BARRAS / VELAS FINANCEIRAS NO RODA PÉ DO CANVAS (CANDLESTICKS DE BOLSA DE VALORES)
      const barWidth = w / chartBars;
      for (let b = 0; b < chartBars; b++) {
        const bx = b * barWidth + barWidth * 0.25;
        const bw = barWidth * 0.5;
        // Altura animada da barra variando com seno e cosseno
        const bh = 30 + Math.abs(Math.sin(b * 0.5 + time)) * 90;
        const by = h - bh - 10;

        // Alterna entre barras de alta (verde) e baixas moderadas (roxa/azul)
        const isGreen = b % 3 !== 0;
        ctx.fillStyle = isGreen
          ? (darkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.15)')
          : (darkMode ? 'rgba(168, 85, 247, 0.12)' : 'rgba(147, 51, 234, 0.12)');
        
        ctx.fillRect(bx, by, bw, bh);

        // Desenha a mecha / pavio do candlestick financeiro
        ctx.strokeStyle = isGreen
          ? (darkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.25)')
          : (darkMode ? 'rgba(168, 85, 247, 0.25)' : 'rgba(147, 51, 234, 0.25)');
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, by - 12);
        ctx.lineTo(bx + bw / 2, by + bh + 12);
        ctx.stroke();
      }

      // 4. ANIMAR E DESENHAR SÍMBOLOS FINANCEIROS FLUTUANTES (R$, $, %, 📈)
      symbols.forEach((sym) => {
        // Atualiza a posição vertical subindo continuamente
        sym.y -= sym.speedY;
        // Oscilação lateral suave
        sym.x += Math.sin(time + sym.y * 0.01) * sym.speedX;

        // Se o símbolo ultrapassar a borda superior, reposiciona na parte inferior
        if (sym.y < -30) {
          sym.y = h + 20;
          sym.x = Math.random() * w;
        }

        // Define a fonte e opacidade para renderização de texto do símbolo
        ctx.font = `bold ${sym.fontSize}px sans-serif`;
        ctx.fillStyle = darkMode
          ? `rgba(233, 213, 255, ${sym.opacity})`
          : `rgba(109, 40, 217, ${sym.opacity * 1.2})`;
        
        ctx.fillText(sym.text, sym.x, sym.y);
      });

      // Chama recursivamente o próximo quadro do loop de animação
      animationFrameId = requestAnimationFrame(render);
    };

    // Inicia a renderização do fundo financeiro
    render();

    // Função de limpeza executada ao desmontar o componente de login
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode]);

  // Função executada no envio do formulário de acesso
  const handleSubmit = (e: React.FormEvent) => {
    // Evita a recarga padrão da página no formulário
    e.preventDefault();
    // Ativa o estado de carregamento do botão de ação
    setIsLoading(true);

    // Simula validação de credenciais de 500ms
    setTimeout(() => {
      setIsLoading(false);
      // Notifica o componente pai para liberar o acesso ao dashboard
      onLogin(email || 'marianasilva@empresa.com.br');
    }, 500);
  };

  return (
    // Container principal da tela de login ocupando 100% da viewport com isolamento de overflow
    <div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-900 text-slate-100'
    }`}>
      
      {/* Elemento Canvas para o fundo interativo de controle e métricas financeiras */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Luzes de destaque e gradientes no fundo */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Botão para alternar tema no canto superior direito */}
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

      {/* Card Central de Login com Vidro Fosco e Borda Neon */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 rounded-3xl bg-slate-900/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-950/60 space-y-6 animate-fadeIn">
        
        {/* Cabeçalho da Marca Lun.ai com Ícones Financeiros */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 text-white font-black text-2xl shadow-lg shadow-purple-700/40 mb-2 relative">
            L
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-900 rounded-full text-[10px]">
              <TrendingUp className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Lun.ai <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs text-purple-200/90 font-medium max-w-xs mx-auto">
            Plataforma de Gestão e Controle Financeiro Preditivo
          </p>

          {/* Badges Rápidas de Métricas Financeiras */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Balanço R$ +100%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
              <PieChart className="w-3 h-3" /> Relatórios IA
            </span>
          </div>
        </div>

        {/* Formulário de Acesso ao Sistema */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo de Entrada de E-mail */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-purple-200">
              E-mail do Gestor / Usuário
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

          {/* Campo de Entrada de Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-purple-200">
                Senha de Acesso
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-medium text-purple-300 hover:underline">
                Recuperar Senha?
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

          {/* Botão de Submissão para Acessar o Dashboard Financeiro */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/50 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse flex items-center gap-1.5">
                <Landmark className="w-4 h-4 animate-bounce" />
                Carregando Controle Financeiro...
              </span>
            ) : (
              <>
                <span>Acessar Painel Financeiro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Atalho para Acesso Direto de Testes / Demonstração */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => onLogin('demo@lunai.finance')}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Entrar com Dados Demonstrativos</span>
          </button>
        </div>

        {/* Rodapé do Card com Notificação de Segurança de Dados */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-purple-300/60 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Protocolo Seguro de Criptografia SSL 256-bit</span>
          </p>
        </div>

      </div>
    </div>
  );
};
