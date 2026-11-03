import React, { useState, useRef, useEffect } from 'react';
import { 
  AppAdminSettings, 
  LevelConfig, 
  CustomTargetImageConfig, 
  LeaderboardEntry,
  PlayerRegistration,
  BrandingColorsConfig,
  CompanyLogoConfig,
  RegistrationFormConfig
} from '../types/game';
import { LEVELS } from '../utils/levels';
import { updateAdminPassword } from '../utils/adminStorage';
import { THEME_PRESETS } from '../utils/brandingPresets';
import { 
  ShieldCheck, 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Trophy, 
  Key, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  X, 
  Sliders, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Upload, 
  Link as LinkIcon, 
  AlertTriangle,
  Sparkles,
  Palette,
  Users,
  Download,
  Building,
  Mail,
  Phone,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
  Award
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  adminSettings: AppAdminSettings;
  onSaveAdminSettings: (settings: AppAdminSettings) => void;
  leaderboardEntries: LeaderboardEntry[];
  onDeleteLeaderboardEntry: (id: string) => void;
  onClearLeaderboard: () => void;
  onRestoreLeaderboard: () => void;
  registrations?: PlayerRegistration[];
  onDeleteRegistration?: (id: string) => void;
  onClearRegistrations?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  adminSettings,
  onSaveAdminSettings,
  leaderboardEntries,
  onDeleteLeaderboardEntry,
  onClearLeaderboard,
  onRestoreLeaderboard,
  registrations = [],
  onDeleteRegistration,
  onClearRegistrations,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'registration' | 'levels' | 'image' | 'endgame' | 'leaderboard' | 'security'>('branding');
  const [settingsDraft, setSettingsDraft] = useState<AppAdminSettings>(adminSettings);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync draft whenever adminSettings changes (e.g. from cloud)
  useEffect(() => {
    setSettingsDraft(adminSettings);
  }, [adminSettings]);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Target image file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  // Logo file input
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  // End Game image file input
  const endGameFileInputRef = useRef<HTMLInputElement>(null);
  const [endGameUrlInput, setEndGameUrlInput] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveAll = () => {
    onSaveAdminSettings(settingsDraft);
    showToast('Configurações salvas e sincronizadas na nuvem em tempo real!');
  };

  // Preset theme selector
  const handleApplyPreset = (presetId: BrandingColorsConfig['themePreset']) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSettingsDraft((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        themePreset: preset.id,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        backgroundColor: preset.background,
      },
    }));
    showToast(`Tema visual "${preset.name}" aplicado!`);
  };

  // Level config updater
  const handleUpdateLevelField = (levelId: number, field: keyof LevelConfig, value: unknown) => {
    setSettingsDraft((prev) => {
      const existing = prev.customLevelConfigs[levelId] || {};
      const updated = {
        ...prev,
        customLevelConfigs: {
          ...prev.customLevelConfigs,
          [levelId]: {
            ...existing,
            [field]: value,
          },
        },
      };
      return updated;
    });
  };

  // Reset single level
  const handleResetLevel = (levelId: number) => {
    setSettingsDraft((prev) => {
      const updatedConfigs = { ...prev.customLevelConfigs };
      delete updatedConfigs[levelId];
      return { ...prev, customLevelConfigs: updatedConfigs };
    });
    showToast(`Fase ${levelId} restaurada para os valores padrão.`);
  };

  // Change Admin Password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (currentPassword !== adminSettings.passwordHash) {
      setPasswordError('Senha atual incorreta.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    updateAdminPassword(newPassword);
    const updated = { ...settingsDraft, passwordHash: newPassword };
    setSettingsDraft(updated);
    onSaveAdminSettings(updated);
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Senha de administrador alterada com sucesso!');
  };

  // File upload for admin custom image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettingsDraft((prev) => ({
          ...prev,
          customTargetImage: {
            ...prev.customTargetImage,
            enabled: true,
            imageUrl: result,
            imageName: file.name,
          },
        }));
        showToast('Imagem carregada pelo administrador!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      setSettingsDraft((prev) => ({
        ...prev,
        customTargetImage: {
          ...prev.customTargetImage,
          enabled: true,
          imageUrl: urlInput.trim(),
          imageName: 'Imagem da Web (Admin)',
        },
      }));
      setUrlInput('');
      showToast('URL de imagem aplicada pelo administrador!');
    } catch {
      showToast('URL inválida.');
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettingsDraft((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            enabled: true,
            logoUrl: result,
          },
        }));
        showToast('Logotipo da empresa carregado!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) return;
    try {
      new URL(logoUrlInput);
      setSettingsDraft((prev) => ({
        ...prev,
        logo: {
          ...prev.logo,
          enabled: true,
          logoUrl: logoUrlInput.trim(),
        },
      }));
      setLogoUrlInput('');
      showToast('URL do Logotipo aplicada!');
    } catch {
      showToast('URL do Logotipo inválida.');
    }
  };

  // End Game image handlers
  const handleEndGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast('Imagem muito grande (máximo 4MB recomendado).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettingsDraft((prev) => ({
          ...prev,
          endGameImage: {
            ...prev.endGameImage,
            enabled: true,
            imageUrl: reader.result as string,
            imageName: file.name,
          },
        }));
        showToast('Imagem de fim de jogo carregada!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyEndGameUrl = () => {
    if (!endGameUrlInput.trim()) return;
    try {
      new URL(endGameUrlInput);
      setSettingsDraft((prev) => ({
        ...prev,
        endGameImage: {
          ...prev.endGameImage,
          enabled: true,
          imageUrl: endGameUrlInput.trim(),
          imageName: 'Imagem via URL',
        },
      }));
      setEndGameUrlInput('');
      showToast('URL da imagem de fim de jogo aplicada!');
    } catch {
      showToast('URL da imagem de fim de jogo inválida.');
    }
  };

  // Export registrations as CSV
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
    link.setAttribute('download', `leads_quiosque_agimus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md">
      <div 
        className="relative w-full max-w-5xl bg-[#090e1a] border-2 rounded-2xl shadow-[0_0_50px_rgba(0,210,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden"
        style={{ borderColor: `${settingsDraft.branding.primaryColor}88` }}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: settingsDraft.branding.primaryColor }}
            >
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-black text-white tracking-wide">
                  Central do Modo Administrador
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-[10px] font-mono-code font-bold text-emerald-400">
                  NUVEM SINCRONIZADA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalização de cores, logotipo da empresa, cadastro de leads, fases e banco de dados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-white rounded-lg transition shadow-md active:scale-95"
              style={{
                backgroundColor: settingsDraft.branding.primaryColor,
                boxShadow: `0 0 15px ${settingsDraft.branding.primaryColor}55`,
              }}
            >
              <Save className="w-3.5 h-3.5 text-slate-950" />
              <span className="text-slate-950 font-bold">Salvar na Nuvem</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 rounded-lg transition"
              title="Sair do Modo Administrador"
            >
              Sair
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 pt-3 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto bg-slate-950/40">
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'branding'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Cores & Logotipo</span>
          </button>

          <button
            onClick={() => setActiveTab('registration')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'registration'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Inscrição & Leads ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'levels'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Editor de Fases (1 a 6)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'image'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Imagem do Alvo</span>
          </button>

          <button
            onClick={() => setActiveTab('endgame')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'endgame'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Imagem Fim de Jogo</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Gestão do Ranking</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Segurança & Senha</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CORES & LOGOTIPO DA EMPRESA */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Theme presets */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Paletas de Cores Prontas (Presets de Marca)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Escolha um tema ou personalize livremente as cores hexadecimais para coincidir com a identidade da sua empresa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((p) => {
                    const isSelected = settingsDraft.branding.themePreset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleApplyPreset(p.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 border-2 shadow-lg scale-[1.02]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                        style={{
                          borderColor: isSelected ? p.primary : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white font-display">
                            {p.name}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase"
                            style={{ backgroundColor: `${p.primary}33`, color: p.primary }}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">{p.description}</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.primary }}
                            title="Cor Primária"
                          />
                          <div
                            className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.secondary }}
                            title="Cor Secundária"
                          />
                          <div
                            className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.background }}
                            title="Cor de Fundo"
                          />
                          {isSelected && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> ATIVO
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Cores Personalizadas (Hexadecimal)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor Primária (Botões, Destaques):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.primaryColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              primaryColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsDraft.branding.primaryColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              primaryColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor Secundária (Bordas, Gradientes):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.secondaryColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              secondaryColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsDraft.branding.secondaryColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              secondaryColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor de Fundo da Aplicação:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.backgroundColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              backgroundColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsDraft.branding.backgroundColor}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              backgroundColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPANY LOGO SECTION */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Logotipo da Empresa & Marca no Topo
                    </h4>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <span>Exibir Logo no Cabeçalho:</span>
                    <input
                      type="checkbox"
                      checked={settingsDraft.logo.enabled}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, enabled: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nome da Empresa / Marca:
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.logo.companyName}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, companyName: e.target.value },
                        }))
                      }
                      placeholder="Ex: AGIMUS"
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Subtítulo / Descrição Curta:
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.logo.subTitle || ''}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, subTitle: e.target.value },
                        }))
                      }
                      placeholder="Ex: QUIOSQUE OFICIAL"
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Logo Preview and Actions */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                      {settingsDraft.logo.logoUrl ? (
                        <img
                          src={settingsDraft.logo.logoUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-500 font-mono-code text-center">
                          Sem Logo
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Visualização do Logotipo</div>
                      <div className="text-[11px] text-slate-400">
                        {settingsDraft.logo.logoUrl ? 'Imagem carregada' : 'Usando badge textual padrão'}
                      </div>
                    </div>
                  </div>

                  {settingsDraft.logo.logoUrl && (
                    <button
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, logoUrl: '' },
                        }))
                      }
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover Logo
                    </button>
                  )}
                </div>

                {/* Upload or Link for Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload do Arquivo do Logo</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="Ou cole a URL do Logo..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      onClick={handleApplyLogoUrl}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSCRIÇÕES & FORMULÁRIO DE LEADS */}
          {activeTab === 'registration' && (
            <div className="space-y-6">
              {/* Gate toggle */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Exigir Cadastro de Jogador Antes de Iniciar a Partida</span>
                    {settingsDraft.registration.enabled && (
                      <span className="px-1.5 py-0.2 bg-cyan-400 text-slate-950 text-[9px] font-bold rounded">
                        ATIVO NO QUIOSQUE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Quando ativado, cada participante deve preencher o formulário antes de jogar.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settingsDraft.registration.enabled}
                  onChange={(e) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      registration: { ...prev.registration, enabled: e.target.checked },
                    }))
                  }
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Form config settings */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Configuração dos Textos e Campos do Formulário
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Título do Formulário:
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.registration.title}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          registration: { ...prev.registration, title: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Subtítulo / Instrução:
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.registration.description}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          registration: { ...prev.registration, description: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Fields toggle grid */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-300 uppercase">
                    Campos Habilitados no Cadastro
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-900 text-xs">
                    <span className="text-slate-300">E-mail corporativo / pessoal</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.showEmail}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, showEmail: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Exibir</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.requireEmail}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, requireEmail: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Obrigatório</span>
                      </label>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-900 text-xs">
                    <span className="text-slate-300">Telefone / WhatsApp</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.showPhone}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, showPhone: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Exibir</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.requirePhone}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, requirePhone: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Obrigatório</span>
                      </label>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-900 text-xs">
                    <span className="text-slate-300">Empresa / Organização</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.showCompany}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, showCompany: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Exibir</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.requireCompany}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, requireCompany: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Obrigatório</span>
                      </label>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="text-slate-300">Cargo / Função</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.showCargo}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, showCargo: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Exibir</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsDraft.registration.requireCargo}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              registration: { ...prev.registration, requireCargo: e.target.checked },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>Obrigatório</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collected Leads Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Leads e Participantes Coletados ({registrations.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Sincronizados na base de dados na nuvem para download e acompanhamento.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      disabled={registrations.length === 0}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 transition disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>

                    {onClearRegistrations && (
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir todos os leads gravados?')) {
                            onClearRegistrations();
                            showToast('Lista de participantes zerada.');
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs text-rose-300 bg-rose-950/70 border border-rose-800 rounded-lg hover:bg-rose-900"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono-code uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Nome</th>
                        <th className="py-2.5 px-3">Contato</th>
                        <th className="py-2.5 px-3">Empresa / Cargo</th>
                        <th className="py-2.5 px-3 text-right">Data</th>
                        {onDeleteRegistration && <th className="py-2.5 px-3 text-center">Ação</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500">
                            Nenhum participante registrado até o momento.
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
                                  onClick={() => {
                                    onDeleteRegistration(r.id);
                                    showToast(`Participante ${r.playerName} removido.`);
                                  }}
                                  className="p-1 text-rose-400 hover:text-rose-200"
                                  title="Remover"
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
            </div>
          )}

          {/* TAB 3: Editor de Fases */}
          {activeTab === 'levels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    Configuração de Dificuldade de Cada Fase
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajuste o tempo de permanência, tamanho, quantidade de alvos e taxa de armadilhas.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSettingsDraft((prev) => ({ ...prev, customLevelConfigs: {} }));
                    showToast('Todas as fases foram restauradas para os padrões originais.');
                  }}
                  className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Restaurar Todas as Fases
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LEVELS.map((lvl) => {
                  const custom = settingsDraft.customLevelConfigs[lvl.id] || {};
                  const duration = custom.baseDurationMs ?? lvl.baseDurationMs;
                  const size = custom.targetSize ?? lvl.targetSize;
                  const count = custom.targetCount ?? lvl.targetCount;
                  const trapChance = custom.trapChance ?? lvl.trapChance;
                  const moving = custom.movingTargets ?? lvl.movingTargets;

                  const isModified = Boolean(settingsDraft.customLevelConfigs[lvl.id]);

                  return (
                    <div
                      key={lvl.id}
                      className={`p-4 rounded-xl border transition ${
                        isModified
                          ? 'bg-slate-900/90 border-cyan-500/50 shadow-md'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs font-bold font-mono-code text-cyan-400">
                            {lvl.id}
                          </span>
                          <span className="text-xs font-bold text-white font-display">
                            {lvl.name}
                          </span>
                        </div>

                        {isModified && (
                          <button
                            onClick={() => handleResetLevel(lvl.id)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Padrão
                          </button>
                        )}
                      </div>

                      {/* Sliders Grid */}
                      <div className="space-y-3 text-xs">
                        {/* Duration Slider */}
                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Tempo de Exposição:</span>
                            <span className="font-mono-code font-bold text-cyan-400">{duration}ms</span>
                          </div>
                          <input
                            type="range"
                            min="250"
                            max="2000"
                            step="25"
                            value={duration}
                            onChange={(e) =>
                              handleUpdateLevelField(lvl.id, 'baseDurationMs', Number(e.target.value))
                            }
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>

                        {/* Size Slider */}
                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Tamanho dos Alvos:</span>
                            <span className="font-mono-code font-bold text-emerald-400">{size}px</span>
                          </div>
                          <input
                            type="range"
                            min="35"
                            max="110"
                            step="2"
                            value={size}
                            onChange={(e) =>
                              handleUpdateLevelField(lvl.id, 'targetSize', Number(e.target.value))
                            }
                            className="w-full accent-emerald-400 cursor-pointer"
                          />
                        </div>

                        {/* Count & Traps */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">Qtd. Alvos:</span>
                            <input
                              type="number"
                              min="5"
                              max="60"
                              value={count}
                              onChange={(e) =>
                                handleUpdateLevelField(lvl.id, 'targetCount', Number(e.target.value))
                              }
                              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">Armadilhas:</span>
                            <select
                              value={Math.round(trapChance * 100)}
                              onChange={(e) =>
                                handleUpdateLevelField(lvl.id, 'trapChance', Number(e.target.value) / 100)
                              }
                              className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                            >
                              <option value="0">0% (Sem Bombas)</option>
                              <option value="10">10%</option>
                              <option value="20">20%</option>
                              <option value="30">30%</option>
                              <option value="40">40%</option>
                              <option value="50">50%</option>
                            </select>
                          </div>
                        </div>

                        {/* Moving toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">Alvos em Movimento:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateLevelField(lvl.id, 'movingTargets', !moving)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              moving
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {moving ? 'Ativado' : 'Desativado'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Imagem Global do Alvo */}
          {activeTab === 'image' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Tornar Imagem Obrigatória para Todos os Jogadores</span>
                    {settingsDraft.customImageMandatory && (
                      <span className="px-1.5 py-0.2 bg-cyan-400 text-slate-950 text-[9px] font-bold rounded">
                        OBRIGATÓRIA
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Quando ativado, todos os usuários jogarão com a imagem definida pelo administrador.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settingsDraft.customImageMandatory}
                  onChange={(e) =>
                    setSettingsDraft((prev) => ({ ...prev, customImageMandatory: e.target.checked }))
                  }
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4">
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-xl"
                  style={{
                    borderColor: settingsDraft.customTargetImage.customBorderColor || '#22d3ee',
                    boxShadow: `0 0 20px ${settingsDraft.customTargetImage.customBorderColor || '#22d3ee'}88`,
                    backgroundColor: '#050b14',
                  }}
                >
                  {settingsDraft.customTargetImage.imageUrl ? (
                    <img
                      src={settingsDraft.customTargetImage.imageUrl}
                      alt="Alvo do Admin"
                      className={`w-full h-full ${
                        settingsDraft.customTargetImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                      }`}
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500 text-center font-mono-code">
                      Sem Imagem
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-white">Imagem Atual do Alvo Master</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {settingsDraft.customTargetImage.imageUrl
                      ? settingsDraft.customTargetImage.imageName || 'Imagem Carregada'
                      : 'Nenhuma imagem configurada.'}
                  </div>
                  {settingsDraft.customTargetImage.imageUrl && (
                    <button
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          customTargetImage: {
                            ...prev.customTargetImage,
                            imageUrl: '',
                            enabled: false,
                          },
                        }))
                      }
                      className="mt-2 text-rose-400 text-xs hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover Imagem
                    </button>
                  )}
                </div>
              </div>

              {/* Upload file */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload de Arquivo Local para o Alvo</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition border border-cyan-400/40"
                >
                  Selecionar Foto / Imagem do Computador
                </button>
              </div>

              {/* Paste URL */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Definir Imagem por Link (URL da Web)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/alvo.png"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Imagem de Fim de Jogo */}
          {activeTab === 'endgame' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Imagem e Banner de Fim de Jogo (Tela de Encerramento)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta imagem é exibida com destaque quando a partida termina, acompanhada da pontuação, tempo de reação alcançado e botão para começar de novo.
                </p>
              </div>

              {/* Toggle Enable */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Exibir Imagem Personalizada no Fim de Jogo</span>
                    {settingsDraft.endGameImage.enabled && (
                      <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 text-[9px] font-bold rounded">
                        ATIVADA
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Quando ativado, a imagem configurada será apresentada na tela de encerramento para todos os jogadores.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settingsDraft.endGameImage.enabled}
                  onChange={(e) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      endGameImage: {
                        ...prev.endGameImage,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono-code uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pré-Visualização ao Vivo da Tela de Fim de Jogo</span>
                  </div>
                  {settingsDraft.endGameImage.imageUrl && (
                    <button
                      onClick={() => {
                        setSettingsDraft((prev) => ({
                          ...prev,
                          endGameImage: {
                            ...prev.endGameImage,
                            imageUrl: '',
                            imageName: '',
                          },
                        }));
                        showToast('Imagem de fim de jogo removida.');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover Imagem</span>
                    </button>
                  )}
                </div>

                <div 
                  className="p-5 rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-xl max-w-lg mx-auto flex flex-col items-center text-center space-y-3"
                  style={{
                    boxShadow: `0 0 30px ${settingsDraft.branding.primaryColor}25`,
                  }}
                >
                  {/* Image display */}
                  {settingsDraft.endGameImage.imageUrl ? (
                    <div className="w-full relative rounded-xl overflow-hidden border border-slate-700 max-h-56 bg-slate-950 flex items-center justify-center shadow-lg">
                      <img
                        src={settingsDraft.endGameImage.imageUrl}
                        alt="Fim de jogo"
                        className="w-full h-auto max-h-56 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-900/40 text-slate-500">
                      <ImageIcon className="w-8 h-8 mb-1 text-slate-600" />
                      <span className="text-xs font-semibold">Nenhuma imagem carregada</span>
                      <span className="text-[10px] text-slate-600">Carregue um banner ou foto abaixo</span>
                    </div>
                  )}

                  {/* Headline */}
                  <div className="text-base font-display font-black text-white">
                    {settingsDraft.endGameImage.headline || 'Parabéns pelo Desafio!'}
                  </div>

                  {/* Subheadline */}
                  <div className="text-xs text-slate-400 max-w-xs">
                    {settingsDraft.endGameImage.subheadline || 'Obrigado por participar! Veja a sua pontuação e tempo de reação abaixo.'}
                  </div>

                  {/* Dummy Stats Preview */}
                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg text-center">
                      <div className="text-[9px] uppercase font-mono-code text-slate-400">Tempo Médio</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono-code">218ms</div>
                    </div>
                    <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg text-center">
                      <div className="text-[9px] uppercase font-mono-code text-slate-400">Pontuação</div>
                      <div className="text-sm font-bold text-amber-400 font-display">24.500</div>
                    </div>
                  </div>

                  {/* Dummy CTA button */}
                  <button 
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider text-slate-950 shadow-md transition"
                    style={{ backgroundColor: settingsDraft.branding.primaryColor }}
                  >
                    {settingsDraft.endGameImage.ctaText || 'Começar Novamente'}
                  </button>
                </div>
              </div>

              {/* Upload image controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload de Arquivo (PNG, JPG, WebP)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Selecione um arquivo de imagem do seu computador ou dispositivo.
                  </p>
                  <input
                    ref={endGameFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEndGameFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => endGameFileInputRef.current?.click()}
                    className="w-full py-2 px-4 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition border border-cyan-400/40"
                  >
                    Selecionar Imagem do Computador
                  </button>
                </div>

                {/* Direct URL */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Definir Imagem por Link (URL)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Insira a URL direta da imagem hospedada na web.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={endGameUrlInput}
                      onChange={(e) => setEndGameUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/fim-de-jogo.png"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyEndGameUrl}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Customization Fields */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Textos da Tela de Encerramento
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Título Principal (Headline):</label>
                    <input
                      type="text"
                      value={settingsDraft.endGameImage.headline ?? ''}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          endGameImage: {
                            ...prev.endGameImage,
                            headline: e.target.value,
                          },
                        }))
                      }
                      placeholder="Ex: Parabéns pelo Desafio!"
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Texto do Botão de Reiniciar (CTA):</label>
                    <input
                      type="text"
                      value={settingsDraft.endGameImage.ctaText ?? ''}
                      onChange={(e) =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          endGameImage: {
                            ...prev.endGameImage,
                            ctaText: e.target.value,
                          },
                        }))
                      }
                      placeholder="Ex: Jogar Novamente / Começar"
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Subtítulo / Mensagem para o Jogador:</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.endGameImage.subheadline ?? ''}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        endGameImage: {
                          ...prev.endGameImage,
                          subheadline: e.target.value,
                        },
                      }))
                    }
                    placeholder="Ex: Obrigado por participar! Consulte a sua pontuação e tempo de reação."
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Gestão do Ranking */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    Gerenciador de Placar & Recordes Mundiais
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modere recordes, remova trapaceiros ou reinicie o ranking para um novo campeonato.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Zerar todas as pontuações e iniciar um novo torneio do zero?')) {
                        onClearLeaderboard();
                        showToast('Ranking global zerado para novo torneio!');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/70 border border-rose-800 hover:bg-rose-900 rounded-lg transition"
                  >
                    Zerar Todo o Ranking
                  </button>

                  <button
                    onClick={() => {
                      onRestoreLeaderboard();
                      showToast('Recordes padrão restaurados com sucesso.');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>

              {/* Table of entries */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono-code uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Jogador</th>
                      <th className="py-2.5 px-3 text-right">Pontuação</th>
                      <th className="py-2.5 px-3 text-right">Tempo Médio</th>
                      <th className="py-2.5 px-3 text-center">Fase</th>
                      <th className="py-2.5 px-3 text-center">Data</th>
                      <th className="py-2.5 px-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leaderboardEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Nenhum recorde registrado no momento.
                        </td>
                      </tr>
                    ) : (
                      leaderboardEntries.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-semibold text-white flex items-center gap-2">
                            <span>{e.country}</span>
                            <span>{e.playerName}</span>
                            {e.isUser && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1 rounded border border-cyan-800">
                                VOCÊ
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-display font-bold text-white">
                            {e.score.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono-code text-cyan-400">
                            {e.averageReactionMs}ms
                          </td>
                          <td className="py-2 px-3 text-center font-mono-code text-slate-400">
                            {e.levelId === 'all' ? 'Geral' : `Fase ${e.levelId}`}
                          </td>
                          <td className="py-2 px-3 text-center text-slate-400 font-mono-code">
                            {e.date}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                onDeleteLeaderboardEntry(e.id);
                                showToast(`Recorde de ${e.playerName} excluído.`);
                              }}
                              className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/80 rounded transition"
                              title="Excluir recorde"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Segurança & Senha Mestra */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {/* Lock Entire App with Password */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Bloquear Todo o Aplicativo com Senha (Modo Kiosk)</span>
                    {settingsDraft.lockEntireAppWithPassword && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-bold rounded">
                        BLOQUEIO ATIVO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Exige que qualquer pessoa insira a senha mestra para jogar ou visualizar o app.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settingsDraft.lockEntireAppWithPassword}
                  onChange={(e) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      lockEntireAppWithPassword: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Tournament Mode */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Modo Torneio Competitivo Oficial</span>
                    {settingsDraft.tournamentMode && (
                      <span className="px-1.5 py-0.2 bg-cyan-400 text-slate-950 text-[9px] font-bold rounded">
                        TORNEIO ATIVO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Desativa cheats de sandbox durante partidas para garantir integridade competitiva.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settingsDraft.tournamentMode}
                  onChange={(e) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      tournamentMode: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Change Password Form */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Alterar Senha Mestra do Administrador</span>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Senha Atual:</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite a senha atual..."
                        className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nova Senha:</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Confirmar Nova Senha:</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  {passwordError && (
                    <div className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Senha atualizada com sucesso!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                  >
                    Atualizar Senha Mestra
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono-code text-[11px]">
            Atalho rápido do Admin: <strong className="text-cyan-400">ALT + C</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
            >
              Fechar Painel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 font-bold text-slate-950 rounded-xl transition shadow-lg active:scale-95"
              style={{
                backgroundColor: settingsDraft.branding.primaryColor,
                boxShadow: `0 0 15px ${settingsDraft.branding.primaryColor}55`,
              }}
            >
              Salvar Tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
