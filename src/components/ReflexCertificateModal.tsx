import React, { useRef } from 'react';
import { PlayerStats } from '../types/game';
import { Award, ShieldCheck, Zap, Target, Star, X, Check, Copy } from 'lucide-react';

interface ReflexCertificateModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const ReflexCertificateModal: React.FC<ReflexCertificateModalProps> = ({ stats, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const bestMs = stats.bestReactionEverMs || 240;
  const totalStars = Object.values(stats.levelProgress).reduce((acc, p) => acc + p.stars, 0);

  let pilotTitle = 'Cadete Sináptico';
  let badgeRank = 'GRAU B';
  if (bestMs < 195) {
    pilotTitle = 'Piloto Cibernético Nível Divino';
    badgeRank = 'GRAU S+ MÁXIMO';
  } else if (bestMs < 250) {
    pilotTitle = 'Operador Hipersônico de Caça';
    badgeRank = 'GRAU S ELITE';
  } else if (bestMs < 320) {
    pilotTitle = 'Atirador de Reação Rápida';
    badgeRank = 'GRAU A VETERANO';
  }

  const handleCopySummary = () => {
    const text = `🏆 Certificado Oficial NeuroReflex\nOperador: ${stats.playerName} ${stats.country}\nTítulo: ${pilotTitle} (${badgeRank})\n⚡ Melhor Tempo de Reação: ${bestMs}ms\n🎯 Total de Acertos: ${stats.totalHits}\n⭐ Estrelas: ${totalStars}★\nVerificado no NeuroReflex Arena.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Printable/Visual Card */}
        <div
          ref={certRef}
          className="relative p-6 sm:p-8 rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-950 via-[#0d1322] to-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.15)] text-center overflow-hidden"
        >
          {/* Subtle ornate corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

          {/* Badge Icon */}
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_20px_#fbbf24]">
            <Award className="w-9 h-9 text-amber-400" />
          </div>

          <div className="text-[11px] font-mono-code uppercase tracking-widest text-amber-400 font-bold mb-1">
            CERTIFICADO OFICIAL DE APTIDÃO NEURAL
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide">
            LICENÇA DE OPERADOR DE REFLEXOS
          </h2>

          <div className="my-4 py-2 border-y border-amber-500/20">
            <div className="text-xs text-slate-400">Certifica-se formalmente que</div>
            <div className="text-2xl font-display font-bold text-cyan-400 my-0.5">
              {stats.playerName} <span className="text-xl">{stats.country}</span>
            </div>
            <div className="text-xs font-semibold text-amber-300">
              {pilotTitle} · {badgeRank}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Melhor Tempo
              </div>
              <div className="text-base font-mono-code font-bold text-cyan-400 mt-0.5">
                {bestMs}ms
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                Alvos Atingidos
              </div>
              <div className="text-base font-mono-code font-bold text-emerald-400 mt-0.5">
                {stats.totalHits}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                Estrelas
              </div>
              <div className="text-base font-mono-code font-bold text-amber-400 mt-0.5">
                {totalStars}★
              </div>
            </div>
          </div>

          {/* Holographic Verification Stamp */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono-code">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>REGISTRO: NR-2026-X99 · VERIFICADO NEUROREFLEX</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Dados do Certificado
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
