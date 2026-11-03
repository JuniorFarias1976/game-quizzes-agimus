import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro não tratado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0a101f] border-2 border-cyan-500/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(34,211,238,0.25)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-500/60 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-lg font-display font-black text-white">
              {this.props.fallbackTitle || 'Ocorreu um imprevisto temporário'}
            </h2>
            <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
              O painel de controle encontrou um formato de dados inesperado. Clique abaixo para reiniciar com as configurações seguras.
            </p>

            {this.state.error && (
              <div className="p-2.5 mb-4 bg-slate-900 border border-slate-800 rounded-xl text-left text-[11px] font-mono-code text-rose-300 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-xl transition shadow active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar e Restaurar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
