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
import { updateAdminPassword, DEFAULT_ADMIN_SETTINGS } from '../utils/adminStorage';
import { THEME_PRESETS, TARGET_PRESET_IMAGES } from '../utils/brandingPresets';
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
  Award, 
  CircleDot, 
  Grid, 
  Layout, 
  Star, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { readAndCompressImageFile } from '../utils/imageOptimizer';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  adminSettings: AppAdminSettings;
  onSaveAdminSettings: (settings: AppAdminSettings) => Promise<{ success: boolean; error?: string } | void> | void;
  leaderboardEntries: LeaderboardEntry[];
  onDeleteLeaderboardEntry: (id: string) => void;
  onClearLeaderboard: () => void;
  onRestoreLeaderboard: () => void;
  registrations?: PlayerRegistration[];
  onDeleteRegistration?: (id: string) => void;
  onClearRegistrations?: () => void;
  onForceSyncCloud?: () => Promise<boolean>;
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
  onForceSyncCloud,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'registration' | 'levels' | 'image' | 'endgame' | 'leaderboard' | 'security'>('branding');
  const [settingsDraft, setSettingsDraft] = useState<AppAdminSettings>(() => ({
    ...DEFAULT_ADMIN_SETTINGS,
    ...(adminSettings || {}),
    branding: { ...DEFAULT_ADMIN_SETTINGS.branding, ...(adminSettings?.branding || {}) },
    logo: { ...DEFAULT_ADMIN_SETTINGS.logo, ...(adminSettings?.logo || {}) },
    customTargetImage: { ...DEFAULT_ADMIN_SETTINGS.customTargetImage, ...(adminSettings?.customTargetImage || {}) },
    endGameImage: { ...DEFAULT_ADMIN_SETTINGS.endGameImage, ...(adminSettings?.endGameImage || {}) },
    registration: { ...DEFAULT_ADMIN_SETTINGS.registration, ...(adminSettings?.registration || {}) },
    customLevelConfigs: adminSettings?.customLevelConfigs || {},
  }));
  const [notification, setNotification] = useState<string | null>(null);

  // Sync draft whenever adminSettings changes (e.g. from cloud)
  useEffect(() => {
    if (adminSettings) {
      setSettingsDraft((prev) => ({
        ...DEFAULT_ADMIN_SETTINGS,
        ...prev,
        ...adminSettings,
        branding: {
          ...DEFAULT_ADMIN_SETTINGS.branding,
          ...(prev?.branding || {}),
          ...(adminSettings?.branding || {}),
        },
        logo: {
          ...DEFAULT_ADMIN_SETTINGS.logo,
          ...(prev?.logo || {}),
          ...(adminSettings?.logo || {}),
        },
        customTargetImage: {
          ...DEFAULT_ADMIN_SETTINGS.customTargetImage,
          ...(prev?.customTargetImage || {}),
          ...(adminSettings?.customTargetImage || {}),
        },
        endGameImage: {
          ...DEFAULT_ADMIN_SETTINGS.endGameImage,
          ...(prev?.endGameImage || {}),
          ...(adminSettings?.endGameImage || {}),
        },
        registration: {
          ...DEFAULT_ADMIN_SETTINGS.registration,
          ...(prev?.registration || {}),
          ...(adminSettings?.registration || {}),
        },
        customLevelConfigs: adminSettings?.customLevelConfigs || prev?.customLevelConfigs || {},
      }));
    }
  }, [adminSettings]);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Target image file input & multiple target images pool
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetImageFileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [targetImageUrlInput, setTargetImageUrlInput] = useState('');

  // Logo file input
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  // App Background file input & URL
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [bgUrlInput, setBgUrlInput] = useState('');

  // End Game image file input
  const endGameFileInputRef = useRef<HTMLInputElement>(null);
  const [endGameUrlInput, setEndGameUrlInput] = useState('');

  // Saving and syncing states
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const result = await onSaveAdminSettings(settingsDraft);
      if (result && typeof result === 'object' && result.success === false) {
        showToast(`Salvo localmente, mas aviso da nuvem: ${result.error}`);
      } else {
        showToast('✓ Configurações salvas e sincronizadas na nuvem em tempo real!');
      }
    } catch {
      showToast('✓ Configurações salvas!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceSync = async () => {
    if (!onForceSyncCloud) return;
    setIsSyncing(true);
    try {
      const ok = await onForceSyncCloud();
      if (ok) {
        showToast('✓ Dados mais recentes recarregados da nuvem!');
      } else {
        showToast('Nuvem sincronizada ou sem novos dados.');
      }
    } catch {
      showToast('Erro ao sincronizar com a nuvem.');
    } finally {
      setIsSyncing(false);
    }
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
        headerBackgroundColor: preset.headerBackground || preset.background,
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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await readAndCompressImageFile(file, { maxWidth: 320, maxHeight: 320, quality: 0.82 });
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
        showToast('Imagem carregada e otimizada pelo administrador!');
      }
    } catch {
      showToast('Erro ao processar imagem.');
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      setSettingsDraft((prev) => {
        const currentList = prev.customTargetImage.images || (prev.customTargetImage.imageUrl ? [prev.customTargetImage.imageUrl] : []);
        const updatedImages = currentList.includes(urlInput.trim()) ? currentList : [...currentList, urlInput.trim()];
        return {
          ...prev,
          customTargetImage: {
            ...prev.customTargetImage,
            enabled: true,
            imageUrl: urlInput.trim(),
            images: updatedImages,
            imageName: 'Imagem da Web (Admin)',
          },
        };
      });
      setUrlInput('');
      showToast('URL de imagem aplicada pelo administrador!');
    } catch {
      showToast('URL inválida.');
    }
  };

  // App Background Upload & URL handlers
  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await readAndCompressImageFile(file, { maxWidth: 1280, maxHeight: 800, quality: 0.75 });
      if (result) {
        setSettingsDraft((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            backgroundImageUrl: result,
            backgroundPattern: 'image',
          },
        }));
        showToast('Imagem de fundo do aplicativo carregada e otimizada!');
      }
    } catch {
      showToast('Erro ao carregar imagem de fundo.');
    }
  };

  const handleApplyBgUrl = () => {
    if (!bgUrlInput.trim()) return;
    try {
      new URL(bgUrlInput);
      setSettingsDraft((prev) => ({
        ...prev,
        branding: {
          ...prev.branding,
          backgroundImageUrl: bgUrlInput.trim(),
          backgroundPattern: 'image',
        },
      }));
      setBgUrlInput('');
      showToast('URL da imagem de fundo aplicada com sucesso!');
    } catch {
      showToast('URL de imagem inválida.');
    }
  };

  const handleRemoveBgImage = () => {
    setSettingsDraft((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        backgroundImageUrl: '',
        backgroundPattern: prev.branding.backgroundPattern === 'image' ? 'grid' : prev.branding.backgroundPattern,
      },
    }));
    showToast('Imagem de fundo removida.');
  };

  // Multi-Target Images Handlers
  const handleAddTargetImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await readAndCompressImageFile(file, { maxWidth: 320, maxHeight: 320, quality: 0.82 });
      if (result) {
        setSettingsDraft((prev) => {
          const currentList = prev.customTargetImage.images || (prev.customTargetImage.imageUrl ? [prev.customTargetImage.imageUrl] : []);
          const updated = [...currentList, result];
          return {
            ...prev,
            customTargetImage: {
              ...prev.customTargetImage,
              enabled: true,
              imageUrl: prev.customTargetImage.imageUrl || result,
              images: updated,
              imageName: file.name,
            },
          };
        });
        showToast('Nova imagem otimizada adicionada aos alvos!');
      }
    } catch {
      showToast('Erro ao processar imagem de alvo.');
    }
  };

  const handleAddTargetImageUrl = () => {
    if (!targetImageUrlInput.trim()) return;
    try {
      new URL(targetImageUrlInput);
      setSettingsDraft((prev) => {
        const currentList = prev.customTargetImage.images || (prev.customTargetImage.imageUrl ? [prev.customTargetImage.imageUrl] : []);
        const updated = [...currentList, targetImageUrlInput.trim()];
        return {
          ...prev,
          customTargetImage: {
            ...prev.customTargetImage,
            enabled: true,
            imageUrl: prev.customTargetImage.imageUrl || targetImageUrlInput.trim(),
            images: updated,
          },
        };
      });
      setTargetImageUrlInput('');
      showToast('Imagem adicionada aos alvos pelo link!');
    } catch {
      showToast('URL de imagem inválida.');
    }
  };

  const handleAddPresetTargetImage = (presetUrl: string, presetName: string) => {
    setSettingsDraft((prev) => {
      const currentList = prev.customTargetImage.images || (prev.customTargetImage.imageUrl ? [prev.customTargetImage.imageUrl] : []);
      const updated = currentList.includes(presetUrl) ? currentList : [...currentList, presetUrl];
      return {
        ...prev,
        customTargetImage: {
          ...prev.customTargetImage,
          enabled: true,
          imageUrl: presetUrl,
          images: updated,
          imageName: presetName,
        },
      };
    });
    showToast(`Alvo "${presetName}" ativado na galeria!`);
  };

  const handleRemoveTargetImage = (imgUrl: string) => {
    setSettingsDraft((prev) => {
      const currentList = prev.customTargetImage.images || (prev.customTargetImage.imageUrl ? [prev.customTargetImage.imageUrl] : []);
      const updated = currentList.filter((img) => img !== imgUrl);
      const newPrimary = prev.customTargetImage.imageUrl === imgUrl
        ? updated[0] || ''
        : prev.customTargetImage.imageUrl;
      return {
        ...prev,
        customTargetImage: {
          ...prev.customTargetImage,
          imageUrl: newPrimary,
          images: updated,
          enabled: updated.length > 0 || Boolean(newPrimary),
        },
      };
    });
    showToast('Imagem de alvo removida da lista.');
  };

  const handleSetPrimaryTargetImage = (imgUrl: string) => {
    setSettingsDraft((prev) => ({
      ...prev,
      customTargetImage: {
        ...prev.customTargetImage,
        enabled: true,
        imageUrl: imgUrl,
      },
    }));
    showToast('Imagem definida como alvo principal!');
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await readAndCompressImageFile(file, { maxWidth: 400, maxHeight: 180, quality: 0.85, mimeType: 'image/png' });
      if (result) {
        setSettingsDraft((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            enabled: true,
            logoUrl: result,
          },
        }));
        showToast('Logotipo da empresa carregado e otimizado!');
      }
    } catch {
      showToast('Erro ao processar logotipo.');
    }
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
  const handleEndGameFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    try {
      const result = await readAndCompressImageFile(file, { maxWidth: 640, maxHeight: 480, quality: 0.8 });
      if (result) {
        setSettingsDraft((prev) => ({
          ...prev,
          endGameImage: {
            ...prev.endGameImage,
            enabled: true,
            imageUrl: result,
            imageName: file.name,
          },
        }));
        showToast('Imagem de fim de jogo carregada e otimizada!');
      }
    } catch {
      showToast('Erro ao processar imagem de fim de jogo.');
    }
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
            {onForceSyncCloud && (
              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncing}
                className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded-lg transition"
                title="Recarregar dados mais recentes da nuvem"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Buscando...' : 'Recarregar Nuvem'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-white rounded-lg transition shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
              style={{
                backgroundColor: settingsDraft.branding.primaryColor,
                boxShadow: `0 0 15px ${settingsDraft.branding.primaryColor}55`,
              }}
            >
              <Save className="w-3.5 h-3.5 text-slate-950" />
              <span className="text-slate-950 font-bold">{isSaving ? 'Salvando...' : 'Salvar na Nuvem'}</span>
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
            <span>Imagens dos Alvos</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Primary Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor Primária (Botões, Destaques):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.primaryColor || '#00d2ff'}
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
                        value={settingsDraft.branding.primaryColor || '#00d2ff'}
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
                        value={settingsDraft.branding.secondaryColor || '#0284c7'}
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
                        value={settingsDraft.branding.secondaryColor || '#0284c7'}
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

                  {/* App Background Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor de Fundo da Aplicação:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.backgroundColor || '#070c18'}
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
                        value={settingsDraft.branding.backgroundColor || '#070c18'}
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

                  {/* Header Background Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor de Fundo do Cabeçalho:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.branding.headerBackgroundColor || '#060a14'}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              headerBackgroundColor: e.target.value,
                              themePreset: 'custom',
                            },
                          }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsDraft.branding.headerBackgroundColor || '#060a14'}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              headerBackgroundColor: e.target.value,
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

              {/* HEADER CUSTOMIZATION SECTION */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Personalização do Cabeçalho (Barra Superior / Topo)
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, headerStyle: 'glass' },
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      settingsDraft.branding.headerStyle === 'glass' || !settingsDraft.branding.headerStyle
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Translúcido com Desfoque</span>
                      {(settingsDraft.branding.headerStyle === 'glass' || !settingsDraft.branding.headerStyle) && (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Glassmorphism com efeito blur e transparência moderna.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, headerStyle: 'solid' },
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      settingsDraft.branding.headerStyle === 'solid'
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Cor Sólida Opaca</span>
                      {settingsDraft.branding.headerStyle === 'solid' && (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Fundo 100% preenchido pela cor selecionada.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, headerStyle: 'gradient' },
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      settingsDraft.branding.headerStyle === 'gradient'
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Gradiente Fluido Neon</span>
                      {settingsDraft.branding.headerStyle === 'gradient' && (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Mistura fluida com a cor primária de destaque.
                    </div>
                  </button>
                </div>

                {/* Live Header Preview */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">Pré-visualização do Cabeçalho:</div>
                  <div
                    className="p-3.5 rounded-xl border flex items-center justify-between transition-colors shadow-inner"
                    style={{
                      borderBottomColor: `${settingsDraft.branding.primaryColor}55`,
                      ...(settingsDraft.branding.headerStyle === 'solid'
                        ? { backgroundColor: settingsDraft.branding.headerBackgroundColor || '#060a14' }
                        : settingsDraft.branding.headerStyle === 'gradient'
                        ? {
                            background: `linear-gradient(to right, ${
                              settingsDraft.branding.headerBackgroundColor || '#060a14'
                            }, ${settingsDraft.branding.primaryColor}30, ${
                              settingsDraft.branding.headerBackgroundColor || '#060a14'
                            })`,
                          }
                        : {
                            backgroundColor: `${settingsDraft.branding.headerBackgroundColor || '#060a14'}e6`,
                            backdropFilter: 'blur(8px)',
                          }),
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {settingsDraft.logo.enabled && settingsDraft.logo.logoUrl ? (
                        <img
                          src={settingsDraft.logo.logoUrl}
                          alt="Logo"
                          className="h-8 max-w-[100px] object-contain rounded"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-slate-950 text-xs shadow"
                          style={{ backgroundColor: settingsDraft.branding.primaryColor }}
                        >
                          {settingsDraft.logo.companyName ? settingsDraft.logo.companyName.charAt(0) : 'A'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-display font-black text-white">
                          {settingsDraft.logo.companyName || 'AGIMUS'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono-code">
                          {settingsDraft.logo.subTitle || 'QUIOSQUE DE REAÇÃO RÁPIDA'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-bold text-slate-950"
                        style={{ backgroundColor: settingsDraft.branding.primaryColor }}
                      >
                        Jogar
                      </span>
                      <span className="px-2.5 py-1 rounded text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800">
                        Ranking
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* APPLICATION BACKGROUND SECTION */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Fundo do Aplicativo (Padrão Visual & Imagem de Fundo)
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, backgroundPattern: 'grid', backgroundImageUrl: '' },
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      settingsDraft.branding.backgroundPattern === 'grid' && !settingsDraft.branding.backgroundImageUrl
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-5 h-5 text-cyan-400" />
                    <span>Grelha Sci-Fi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, backgroundPattern: 'dots', backgroundImageUrl: '' },
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      settingsDraft.branding.backgroundPattern === 'dots' && !settingsDraft.branding.backgroundImageUrl
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CircleDot className="w-5 h-5 text-purple-400" />
                    <span>Pontos Tech</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, backgroundPattern: 'radial', backgroundImageUrl: '' },
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      settingsDraft.branding.backgroundPattern === 'radial' && !settingsDraft.branding.backgroundImageUrl
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Brilho Aurora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, backgroundPattern: 'plain', backgroundImageUrl: '' },
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      settingsDraft.branding.backgroundPattern === 'plain' && !settingsDraft.branding.backgroundImageUrl
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md border border-slate-700 bg-slate-950" />
                    <span>Sólido Limpo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, backgroundPattern: 'image' },
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      settingsDraft.branding.backgroundPattern === 'image' || Boolean(settingsDraft.branding.backgroundImageUrl)
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span>Foto / Imagem</span>
                  </button>
                </div>

                {/* Upload or URL for Custom Background Image */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Imagem de Fundo Personalizada</span>
                    </span>

                    {settingsDraft.branding.backgroundImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveBgImage}
                        className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Imagem de Fundo</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={bgFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload do Computador</span>
                    </button>

                    <div className="flex-1 flex gap-2 min-w-[200px]">
                      <input
                        type="text"
                        value={bgUrlInput}
                        onChange={(e) => setBgUrlInput(e.target.value)}
                        placeholder="Ou cole a URL da imagem (https://...)"
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBgUrl}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {settingsDraft.branding.backgroundImageUrl && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Opacidade da Imagem de Fundo:</span>
                        <span className="font-mono-code font-bold text-cyan-400">
                          {Math.round((settingsDraft.branding.backgroundImageOpacity ?? 0.25) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={settingsDraft.branding.backgroundImageOpacity ?? 0.25}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              backgroundImageOpacity: parseFloat(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  )}
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

          {/* TAB 4: Imagens dos Alvos a Acertar */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Imagens dos Alvos a Acertar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personalize as figuras e alvos que surgem na arena. Carregue fotos, logotipos ou use os modelos prontos. Se adicionar múltiplas imagens, os alvos podem alternar durante a partida!
                </p>
              </div>

              {/* Activation & Policy Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Enable custom target images */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Ativar Imagens Personalizadas</div>
                    <div className="text-[10px] text-slate-400">Exibe fotos nos alvos da arena</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.customTargetImage.enabled}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        customTargetImage: { ...prev.customTargetImage, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Mandatory Image */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Obrigatória no Quiosque</div>
                    <div className="text-[10px] text-slate-400">Força para todos os participantes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.customImageMandatory}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, customImageMandatory: e.target.checked }))
                    }
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Randomize / Rotate multiple images */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Alternar Múltiplas Imagens</div>
                    <div className="text-[10px] text-slate-400">Alvos variam entre a galeria</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.customTargetImage.randomizeImages ?? true}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        customTargetImage: { ...prev.customTargetImage, randomizeImages: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Target Format & Neon Border Settings */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Aparência & Formato dos Alvos
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shape Fit */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Modo de Ajuste da Imagem no Círculo:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            customTargetImage: { ...prev.customTargetImage, shapeFit: 'cover' },
                          }))
                        }
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                          settingsDraft.customTargetImage.shapeFit === 'cover'
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Preenchimento Total (Cover)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            customTargetImage: { ...prev.customTargetImage, shapeFit: 'contain' },
                          }))
                        }
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                          settingsDraft.customTargetImage.shapeFit === 'contain'
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Conter com Margem (Contain)
                      </button>
                    </div>
                  </div>

                  {/* Border Color */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Cor do Anel Neon do Alvo:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            customTargetImage: { ...prev.customTargetImage, customBorderColor: e.target.value },
                          }))
                        }
                        className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}
                        onChange={(e) =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            customTargetImage: { ...prev.customTargetImage, customBorderColor: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVE TARGET IMAGES GALLERY */}
              {(() => {
                const imagesPool = settingsDraft.customTargetImage.images && settingsDraft.customTargetImage.images.length > 0
                  ? settingsDraft.customTargetImage.images
                  : settingsDraft.customTargetImage.imageUrl
                  ? [settingsDraft.customTargetImage.imageUrl]
                  : [];

                return (
                  <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                          <span>Galeria de Imagens Ativas ({imagesPool.length})</span>
                          {imagesPool.length > 1 && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[9px] font-mono-code font-bold">
                              ROTAÇÃO ATIVA
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {imagesPool.length === 0
                            ? 'Nenhuma imagem cadastrada. Adicione imagens abaixo para começar.'
                            : `${imagesPool.length} imagem(ns) configurada(s) para os alvos da partida.`}
                        </p>
                      </div>

                      {imagesPool.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsDraft((prev) => ({
                              ...prev,
                              customTargetImage: {
                                ...prev.customTargetImage,
                                imageUrl: '',
                                images: [],
                                enabled: false,
                              },
                            }));
                            showToast('Todas as imagens de alvos foram removidas.');
                          }}
                          className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Limpar Todas</span>
                        </button>
                      )}
                    </div>

                    {imagesPool.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                        {imagesPool.map((imgUrl, idx) => {
                          const isPrimary = settingsDraft.customTargetImage.imageUrl === imgUrl;
                          return (
                            <div
                              key={idx}
                              className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                                isPrimary
                                  ? 'bg-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {/* Thumbnail preview */}
                              <div
                                className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-lg"
                                style={{
                                  borderColor: settingsDraft.customTargetImage.customBorderColor || '#00d2ff',
                                  boxShadow: `0 0 14px ${settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}66`,
                                  backgroundColor: '#050c18',
                                }}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Alvo ${idx + 1}`}
                                  className={`w-full h-full ${
                                    settingsDraft.customTargetImage.shapeFit === 'contain'
                                      ? 'object-contain p-1'
                                      : 'object-cover'
                                  }`}
                                />
                              </div>

                              {/* Badge */}
                              <div className="text-[10px] font-mono-code font-bold">
                                {isPrimary ? (
                                  <span className="text-amber-400 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Principal
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Alvo #{idx + 1}</span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 w-full pt-1 border-t border-slate-800/80">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryTargetImage(imgUrl)}
                                    className="flex-1 py-1 text-[10px] text-cyan-400 hover:text-white hover:bg-cyan-950/80 rounded transition text-center"
                                    title="Tornar imagem primária"
                                  >
                                    Definir Principal
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTargetImage(imgUrl)}
                                  className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/80 rounded transition"
                                  title="Remover este alvo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <div className="text-xs font-semibold text-slate-400">Nenhum alvo personalizado ativo</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Adicione imagens do computador, links ou use os modelos prontos abaixo.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ADD NEW TARGET IMAGES SECTION */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Adicionar Novas Imagens aos Alvos</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Upload from PC */}
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload de Arquivo Local</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Carregue PNG, JPG, SVG ou WebP do seu dispositivo.
                    </p>
                    <input
                      ref={targetImageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddTargetImageFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => targetImageFileInputRef.current?.click()}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition border border-cyan-400/40 shadow"
                    >
                      Selecionar Imagem do Computador
                    </button>
                  </div>

                  {/* Add by URL */}
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>Adicionar por Link (URL da Web)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Insira o endereço direto de uma imagem online.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={targetImageUrlInput}
                        onChange={(e) => setTargetImageUrlInput(e.target.value)}
                        placeholder="https://exemplo.com/alvo.png"
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddTargetImageUrl}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* PRESET TARGET ICONS (ONE-CLICK) */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modelos de Alvos Prontos (Clique para Ativar):</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {TARGET_PRESET_IMAGES.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleAddPresetTargetImage(preset.url, preset.name)}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-400 hover:bg-slate-850 rounded-xl cursor-pointer transition flex flex-col items-center gap-2 group shadow-sm active:scale-95"
                      >
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-cyan-400/60 shadow group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: '#050c18' }}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[85px]">
                            {preset.name}
                          </div>
                          <span className="text-[8px] font-mono-code text-cyan-400/80 font-bold uppercase">
                            {preset.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LIVE TARGET FIGURE SIZES PREVIEW */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                    Simulação dos Alvos na Arena (Tamanhos e Auras Reais)
                  </span>
                  <span className="text-[11px] font-mono-code text-slate-400">
                    Borda: {settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}
                  </span>
                </div>

                {(() => {
                  const sampleImg = settingsDraft.customTargetImage.imageUrl ||
                    (settingsDraft.customTargetImage.images && settingsDraft.customTargetImage.images[0]) ||
                    TARGET_PRESET_IMAGES[0].url;

                  return (
                    <div className="flex flex-wrap items-center justify-around gap-6 p-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
                      {/* Small Target (Level 5-6) */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="rounded-full overflow-hidden flex items-center justify-center border-2 transition-transform hover:scale-110 cursor-pointer shadow-lg animate-pulse"
                          style={{
                            width: '52px',
                            height: '52px',
                            borderColor: settingsDraft.customTargetImage.customBorderColor || '#00d2ff',
                            boxShadow: `0 0 16px ${settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}88`,
                            backgroundColor: '#050c18',
                          }}
                        >
                          <img
                            src={sampleImg}
                            alt="Alvo P"
                            className={`w-full h-full ${
                              settingsDraft.customTargetImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono-code text-slate-400">52px · Fases 5-6</span>
                      </div>

                      {/* Medium Target (Level 3-4) */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="rounded-full overflow-hidden flex items-center justify-center border-2 transition-transform hover:scale-110 cursor-pointer shadow-lg"
                          style={{
                            width: '74px',
                            height: '74px',
                            borderColor: settingsDraft.customTargetImage.customBorderColor || '#00d2ff',
                            boxShadow: `0 0 20px ${settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}99`,
                            backgroundColor: '#050c18',
                          }}
                        >
                          <img
                            src={sampleImg}
                            alt="Alvo M"
                            className={`w-full h-full ${
                              settingsDraft.customTargetImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono-code text-cyan-400 font-bold">74px · Fases 3-4</span>
                      </div>

                      {/* Large Target (Level 1-2) */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="rounded-full overflow-hidden flex items-center justify-center border-2 transition-transform hover:scale-110 cursor-pointer shadow-xl"
                          style={{
                            width: '92px',
                            height: '92px',
                            borderColor: settingsDraft.customTargetImage.customBorderColor || '#00d2ff',
                            boxShadow: `0 0 25px ${settingsDraft.customTargetImage.customBorderColor || '#00d2ff'}aa`,
                            backgroundColor: '#050c18',
                          }}
                        >
                          <img
                            src={sampleImg}
                            alt="Alvo G"
                            className={`w-full h-full ${
                              settingsDraft.customTargetImage.shapeFit === 'contain' ? 'object-contain p-1' : 'object-cover'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono-code text-slate-400">92px · Fases 1-2</span>
                      </div>
                    </div>
                  );
                })()}
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
