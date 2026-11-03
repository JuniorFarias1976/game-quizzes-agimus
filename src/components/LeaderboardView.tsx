import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { Trophy, Globe, Zap, Target, Search, Medal, Shield, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onPlayLevel: (levelId: number) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, onPlayLevel }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter entries
  const filtered = entries.filter((e) => {
    if (filterLevel !== 'all' && String(e.levelId) !== filterLevel) {
      return false;
    }
    if (searchQuery.trim() && !e.playerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/50 shadow-[0_0_10px_#fbbf24]">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 font-bold border border-slate-300/50">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/30 text-amber-600 font-bold border border-amber-700/50">
          🥉
        </span>
      );
    }
    return <span className="font-mono-code text-xs text-slate-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Ranking Global de Reflexos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placar mundial dos tempos de resposta mais rápidos registrados no NeuroReflex.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar jogador..."
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-4">
        <button
          onClick={() => setFilterLevel('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterLevel === 'all'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Geral (Todas as Fases)
        </button>
        {[1, 2, 3, 4, 5, 6].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(String(lvl))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterLevel === String(lvl)
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fase {lvl}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono-code">
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Operador / País</th>
                <th className="py-3 px-4 text-center">Fase</th>
                <th className="py-3 px-4 text-right">Média (ms)</th>
                <th className="py-3 px-4 text-right">Melhor (ms)</th>
                <th className="py-3 px-4 text-center">Precisão</th>
                <th className="py-3 px-4 text-right">Pontuação</th>
                <th className="py-3 px-4 text-center">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum recorde encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        entry.isUser
                          ? 'bg-cyan-950/30 hover:bg-cyan-900/40 border-l-4 border-cyan-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold">
                        <div className="flex items-center justify-center">
                          {getRankBadge(rank)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{entry.country}</span>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{entry.playerName}</span>
                              {entry.isUser && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-cyan-500 text-slate-950 rounded">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono-code">
                              {entry.date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-slate-950 text-slate-300 border border-slate-800">
                          {entry.levelId === 'all' ? 'Geral' : `Fase ${entry.levelId}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-code font-bold text-cyan-400">
                        {entry.averageReactionMs}ms
                      </td>
                      <td className="py-3 px-4 text-right font-mono-code text-amber-400">
                        {entry.bestReactionMs}ms
                      </td>
                      <td className="py-3 px-4 text-center font-mono-code text-emerald-400">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3 px-4 text-right font-display font-bold text-white text-sm">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-display font-black text-xs px-2 py-0.5 rounded ${
                            entry.tier === 'S+'
                              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                              : entry.tier === 'S'
                              ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30'
                              : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/30'
                          }`}
                        >
                          {entry.tier}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
