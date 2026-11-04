import React, { useState, useEffect } from 'react';
import { 
  RegistrationFormConfig, 
  PlayerRegistration, 
  CompanyLogoConfig, 
  BrandingColorsConfig 
} from '../types/game';
import { 
  UserPlus, 
  Settings, 
  Download, 
  Trash2, 
  Check, 
  Play, 
  X, 
  Building, 
  Mail, 
  Phone, 
  Briefcase, 
  User, 
  ShieldCheck, 
  FileText,
  Lock
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RegistrationFormConfig;
  onSaveConfig: (newConfig: RegistrationFormConfig) => void;
  logo: CompanyLogoConfig;
  branding: BrandingColorsConfig;
  initialPlayerName: string;
  onCompleteRegistration: (reg: PlayerRegistration) => void;
  registrations: PlayerRegistration[];
  onDeleteRegistration?: (id: string) => void;
  onClearRegistrations?: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  logo,
  branding,
  initialPlayerName,
  onCompleteRegistration,
  registrations,
  onDeleteRegistration,
  onClearRegistrations,
  isAdminLoggedIn = false,
  onOpenAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'config' | 'leads'>('form');

  // Form inputs - strictly blank by default
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [cargo, setCargo] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Whenever modal opens, guarantee all fields are blank
  useEffect(() => {
    if (isOpen) {
      setPlayerName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setCargo('');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Draft config for the config tab
  const [draftConfig, setDraftConfig] = useState<RegistrationFormConfig>(config);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    setDraftConfig(config);
  }, [config]);

  // Non-admins must strictly only see the participant form
  useEffect(() => {
    if (!isAdminLoggedIn && activeTab !== 'form') {
      setActiveTab('form');
    }
  }, [isAdminLoggedIn, activeTab]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!playerName.trim()) {
      setErrorMsg('Por favor insira o seu nome ou apelido de jogador.');
      return;
    }

    if (config.showEmail && config.requireEmail && !email.trim()) {
      setErrorMsg('Por favor insira o seu e-mail.');
      return;
    }

    if (config.showPhone && config.requirePhone && !phone.trim()) {
      setErrorMsg('Por favor insira o seu telefone de contato.');
      return;
    }

    if (config.showCompany && config.requireCompany && !company.trim()) {
      setErrorMsg('Por favor informe a sua empresa ou organização.');
      return;
    }

    if (config.showCargo && config.requireCargo && !cargo.trim()) {
      setErrorMsg('Por favor informe o seu cargo ou função.');
      return;
    }

    if (config.showConsent && !consentGiven) {
      setErrorMsg('É necessário aceitar os termos de consentimento para prosseguir.');
      return;
    }

    const newReg: PlayerRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerName: playerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      cargo: cargo.trim(),
      consentGiven,
      createdAt: new Date().toISOString(),
      gamesPlayed: 0,
      bestScore: 0,
      bestReactionMs: 0,
    };

    onCompleteRegistration(newReg);
  };

  const handleSaveConfig = () => {
    onSaveConfig(draftConfig);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Export registrations as CSV file
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Data de Inscrição', 'Pontuação Máxima', 'Melhor Tempo (ms)'];
    const rows = registrations.map((r) => [
      r.id,
      `"${r.playerName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.cargo.replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('pt-PT')}"`,
      r.bestScore || 0,
      r.bestReactionMs || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inscricoes_quiosque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md">
      <div 
        className="relative w-full max-w-xl bg-[#090d18] border-2 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ borderColor: `${branding.primaryColor}88` }}
      >
        {/* Top Header with Company Branding */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo.enabled && logo.logoUrl ? (
              <img
                src={logo.logoUrl}
                alt={logo.companyName || 'Logo'}
                className="h-10 max-w-[120px] object-contain rounded"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white shadow-md"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {logo.companyName ? logo.companyName.charAt(0) : 'A'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-white text-base tracking-wider">
                  {logo.companyName || 'AGIMUS'}
                </span>
                <span 
                  className="px-1.5 py-0.2 rounded text-[9px] font-mono-code font-bold uppercase"
                  style={{ backgroundColor: `${branding.primaryColor}33`, color: branding.primaryColor }}
                >
                  {logo.subTitle || 'QUIOSQUE OFICIAL'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {(!isAdminLoggedIn || activeTab === 'form') && 'Ficha de Inscrição do Participante'}
                {isAdminLoggedIn && activeTab === 'config' && 'Configurações dos Campos de Cadastro (Admin)'}
                {isAdminLoggedIn && activeTab === 'leads' && `Lista de Inscritos (${registrations.length}) (Admin)`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenAdminLogin && !isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 rounded-lg transition"
                title="Acesso Administrador"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection - Strictly visible only to Admin */}
        {isAdminLoggedIn && (
          <div className="px-5 pt-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'form'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Inscrição</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'config'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar Formulário</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono-code">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'leads'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Inscritos ({registrations.length})</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono-code">ADMIN</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* TAB 1: FORMULÁRIO DE INSCRIÇÃO DO JOGADOR */}
          {activeTab === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-display font-black text-white">
                  {config.title || 'Inscrição no Quiosque'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {config.description || 'Preencha seus dados para competir pelo placar do evento.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              {/* Player Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome Completo / Apelido no Jogo <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder=""
                    maxLength={24}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Email */}
              {config.showEmail && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail {config.requireEmail && <span className="text-rose-400">*</span>}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required={config.requireEmail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* Phone / WhatsApp */}
              {config.showPhone && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telefone / WhatsApp {config.requirePhone && <span className="text-rose-400">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required={config.requirePhone}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* Company & Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.showCompany && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Empresa {config.requireCompany && <span className="text-rose-400">*</span>}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required={config.requireCompany}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder=""
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {config.showCargo && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cargo / Função {config.requireCargo && <span className="text-rose-400">*</span>}
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required={config.requireCargo}
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        placeholder=""
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Consent checkbox */}
              {config.showConsent && (
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                    <span className="leading-relaxed">
                      {config.consentText || 'Concordo com os termos do evento e autorizo o envio de resultados.'}
                    </span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-5 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl transition shadow-lg active:scale-95"
                  style={{
                    backgroundColor: branding.primaryColor,
                    boxShadow: `0 0 20px ${branding.primaryColor}55`,
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Iniciar Partida & Desafiar Reflexos!
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CONFIGURAÇÃO DO FORMULÁRIO */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Personalização dos Campos de Inscrição
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina quais informações o quiosque deve solicitar aos participantes.
                  </p>
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-white rounded-lg transition shadow active:scale-95"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar
                </button>
              </div>

              {savedNotification && (
                <div className="p-2.5 bg-emerald-950 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Configurações do formulário salvas com sucesso!</span>
                </div>
              )}

              {/* Enable / Disable registration gate */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    Exigir Inscrição Obrigatória Antes de Jogar
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Apresenta este formulário para os jogadores antes de cada nova partida.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={draftConfig.enabled}
                  onChange={(e) => setDraftConfig({ ...draftConfig, enabled: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Titles configuration */}
              <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Formulário:</label>
                  <input
                    type="text"
                    value={draftConfig.title}
                    onChange={(e) => setDraftConfig({ ...draftConfig, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Instrução:</label>
                  <input
                    type="text"
                    value={draftConfig.description}
                    onChange={(e) => setDraftConfig({ ...draftConfig, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Fields visibility and requirements */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Campos Solicitados
                </div>

                {/* Email field */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-xs">
                  <span className="text-slate-300">Campo E-mail</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.showEmail}
                        onChange={(e) => setDraftConfig({ ...draftConfig, showEmail: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Exibir</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!draftConfig.showEmail}
                        checked={draftConfig.requireEmail}
                        onChange={(e) => setDraftConfig({ ...draftConfig, requireEmail: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Obrigatório</span>
                    </label>
                  </div>
                </div>

                {/* Phone field */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-xs">
                  <span className="text-slate-300">Campo Telefone / WhatsApp</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.showPhone}
                        onChange={(e) => setDraftConfig({ ...draftConfig, showPhone: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Exibir</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!draftConfig.showPhone}
                        checked={draftConfig.requirePhone}
                        onChange={(e) => setDraftConfig({ ...draftConfig, requirePhone: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Obrigatório</span>
                    </label>
                  </div>
                </div>

                {/* Company field */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-xs">
                  <span className="text-slate-300">Campo Empresa</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.showCompany}
                        onChange={(e) => setDraftConfig({ ...draftConfig, showCompany: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Exibir</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!draftConfig.showCompany}
                        checked={draftConfig.requireCompany}
                        onChange={(e) => setDraftConfig({ ...draftConfig, requireCompany: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Obrigatório</span>
                    </label>
                  </div>
                </div>

                {/* Cargo field */}
                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-slate-300">Campo Cargo / Função</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.showCargo}
                        onChange={(e) => setDraftConfig({ ...draftConfig, showCargo: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Exibir</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!draftConfig.showCargo}
                        checked={draftConfig.requireCargo}
                        onChange={(e) => setDraftConfig({ ...draftConfig, requireCargo: e.target.checked })}
                        className="accent-cyan-400"
                      />
                      <span>Obrigatório</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Consent text */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto do Consentimento / RGPD / LGPD:
                </label>
                <textarea
                  rows={2}
                  value={draftConfig.consentText}
                  onChange={(e) => setDraftConfig({ ...draftConfig, consentText: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LEADS / INSCRIÇÕES COLETADAS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Cadastros Coletados no Quiosque ({registrations.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sincronizados com o banco de dados e acessíveis em qualquer dispositivo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={registrations.length === 0}
                    className="px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar CSV
                  </button>

                  {onClearRegistrations && (
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente limpar todos os cadastros coletados?')) {
                          onClearRegistrations();
                        }
                      }}
                      className="px-3 py-1.5 text-xs text-rose-300 bg-rose-950/80 border border-rose-800 rounded-lg hover:bg-rose-900"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Table of registrations */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono-code uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Nome</th>
                      <th className="py-2 px-3">Contato</th>
                      <th className="py-2 px-3">Empresa / Cargo</th>
                      <th className="py-2 px-3 text-right">Data</th>
                      {onDeleteRegistration && <th className="py-2 px-3 text-center">Ação</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          Nenhum participante inscrito ainda.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-semibold text-white">
                            {r.playerName}
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-mono-code text-[11px]">
                            {r.email && <div>{r.email}</div>}
                            {r.phone && <div className="text-slate-400">{r.phone}</div>}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {r.company && <div>{r.company}</div>}
                            {r.cargo && <div className="text-slate-400 text-[11px]">{r.cargo}</div>}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400 font-mono-code text-[11px]">
                            {new Date(r.createdAt).toLocaleDateString('pt-PT')}
                          </td>
                          {onDeleteRegistration && (
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => onDeleteRegistration(r.id)}
                                className="p-1 text-rose-400 hover:text-rose-200"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
