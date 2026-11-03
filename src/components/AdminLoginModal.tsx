import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { verifyAdminPassword } from '../utils/adminStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  isKioskLock?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Acesso ao Modo Administrador',
  subtitle = 'Insira a senha mestra para desbloquear o painel de controle e configurações globais.',
  isKioskLock = false,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(true);
      setErrorMessage('Por favor digite a senha.');
      return;
    }

    if (verifyAdminPassword(password.trim())) {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-7 shadow-[0_0_35px_rgba(34,211,238,0.25)] overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {!isKioskLock && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-3">
            <Lock className="w-7 h-7 text-cyan-400" />
          </div>

          <h2 className="text-xl font-display font-black text-white tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono-code">
              Senha de Administrador
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                autoFocus
                placeholder="Insira a senha de acesso..."
                className={`w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition ${
                  error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-mono-code">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Default Password Hint */}
          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
            <span>Senha padrão inicial:</span>
            <code className="px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800/60 rounded text-cyan-300 font-bold font-mono-code">
              admin123
            </code>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {!isKioskLock && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl transition shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              Entrar no Modo Administrador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
