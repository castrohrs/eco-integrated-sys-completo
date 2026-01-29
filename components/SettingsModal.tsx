
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Sector, Role } from '../types';
import { useAppStore, THEMES } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';
import { generateLogisticsBackgroundVideo } from '../services/geminiService';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useAuth();
    const { t } = useLanguage();
    const { 
      isLayoutMode, setIsLayoutMode, 
      isSidebarPinned, setIsSidebarPinned,
      headerBehavior, setHeaderBehavior,
      theme, setTheme,
      activeTab, resetLayout,
      isAutoStartEnabled, toggleAutoStart
    } = useAppStore();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    
    // Video Gen State
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

    // User Management State
    const [userFormMode, setUserFormMode] = useState<'list' | 'add' | 'edit'>('list');
    const [userFormData, setUserFormData] = useState<Partial<User>>({});

    // General Settings Local State (Buffer)
    const [localGeneralSettings, setLocalGeneralSettings] = useState({
        autoStart: isAutoStartEnabled,
        pinned: isSidebarPinned,
        header: headerBehavior,
        layoutMode: isLayoutMode,
        theme: theme
    });
    
    const sectors: Sector[] = ['OpsMind', 'FlowCapital', 'NeuroTech', 'IdeaForge'];
    const roles: Role[] = ['Admin', 'User'];
    const canResetLayout = activeTab === 'dashboard' || activeTab === 'transactions';

    // Reset auth and local state when panel is closed or opened
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsAuthenticated(false);
                setPassword('');
                setError('');
                setUserFormMode('list');
                setUserFormData({});
                setShowHelp(false);
                setIsGeneratingVideo(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // Sync local state with global state when opening
            setLocalGeneralSettings({
                autoStart: isAutoStartEnabled,
                pinned: isSidebarPinned,
                header: headerBehavior,
                layoutMode: isLayoutMode,
                theme: theme
            });
        }
    }, [isOpen, isAutoStartEnabled, isSidebarPinned, headerBehavior, isLayoutMode, theme]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0003') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Senha incorreta.');
            setPassword('');
        }
    };
    
    const handleGenerateVideo = async () => {
        setIsGeneratingVideo(true);
        try {
            const videoUrl = await generateLogisticsBackgroundVideo();
            
            // Auto download
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = 'ecoia-bg.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            alert('Vídeo gerado com sucesso! O download iniciará em breve.\n\nSalve o arquivo como "ecoia-bg.mp4" na pasta "public/" do projeto para ativar o background animado.');
        } catch (error: any) {
            alert(`Erro ao gerar vídeo: ${error.message}`);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    // General Settings Handlers
    const updateLocalSetting = (key: keyof typeof localGeneralSettings, value: any) => {
        setLocalGeneralSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveGeneralSettings = () => {
        // Only call toggleAutoStart if changed, as it communicates with Electron
        if (localGeneralSettings.autoStart !== isAutoStartEnabled) {
            toggleAutoStart(); 
        }
        setIsSidebarPinned(localGeneralSettings.pinned);
        setHeaderBehavior(localGeneralSettings.header);
        setIsLayoutMode(localGeneralSettings.layoutMode);
        setTheme(localGeneralSettings.theme);
        alert('Configurações gerais salvas com sucesso.');
    };

    // User Form Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const startAddUser = () => {
        setUserFormData({
            role: 'User',
            sector: 'OpsMind',
            password: ''
        });
        setUserFormMode('add');
    };

    const startEditUser = (user: User) => {
        setUserFormData({ ...user, password: '' }); 
        setUserFormMode('edit');
    };

    const cancelUserForm = () => {
        setUserFormMode('list');
        setUserFormData({});
    };

    const submitUserForm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userFormData.name || !userFormData.matricula || !userFormData.phone) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }

        if (userFormMode === 'add') {
            if (!userFormData.password) {
                alert("Senha é obrigatória para novos usuários.");
                return;
            }
            addUser({
                name: userFormData.name,
                matricula: userFormData.matricula,
                phone: userFormData.phone,
                role: userFormData.role as Role || 'User',
                sector: userFormData.sector as Sector || 'OpsMind',
                password: userFormData.password
            });
        } else if (userFormMode === 'edit' && userFormData.id) {
            const fullUser: User = {
                id: userFormData.id,
                name: userFormData.name,
                matricula: userFormData.matricula,
                phone: userFormData.phone,
                role: userFormData.role as Role,
                sector: userFormData.sector as Sector,
                password: userFormData.password || undefined
            };
            updateUser(fullUser);
        }

        setUserFormMode('list');
        setUserFormData({});
    };

    const handleDeleteUser = (userId: string) => {
        if (currentUser?.id === userId) {
            alert("Você não pode excluir a si mesmo.");
            return;
        }
        if (window.confirm("Tem certeza que deseja excluir este usuário? Essa ação é irreversível.")) {
            deleteUser(userId);
        }
    };

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2501] transition-opacity duration-300" onClick={onClose}>
                <div className="bg-bg-card p-8 rounded-lg shadow-xl w-full max-w-sm text-light border border-border-color" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handlePasswordSubmit}>
                        <h2 className="text-xl font-bold mb-4 text-light">Acesso Restrito</h2>
                        <p className="text-gray-text mb-4 text-sm">Insira a senha de administrador (0003) para gerenciar configurações sensíveis.</p>
                        <div className="form-group">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-bg-main border border-border-color rounded p-3 text-light focus:outline-none focus:border-primary text-center tracking-widest"
                                autoFocus
                                placeholder="Senha"
                            />
                        </div>
                        {error && <p className="text-danger text-sm mt-2 text-center">{error}</p>}
                        <div className="mt-6 flex justify-end">
                            <button type="submit" className="w-full px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-opacity-90">Acessar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`fixed top-0 right-0 h-full w-[450px] bg-bg-card shadow-2xl z-[2501] transform transition-transform duration-300 border-l border-border-color ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="h-full flex flex-col relative">
                <header className="flex-shrink-0 flex items-center justify-between p-5 border-b border-border-color bg-bg-card">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-light"><i className="fas fa-cogs mr-2"></i> Configurações</h2>
                        <button 
                            onClick={() => setShowHelp(!showHelp)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showHelp ? 'bg-secondary text-white' : 'bg-bg-main text-gray-500 hover:text-primary border border-border-color'}`}
                            title="Ajuda Contextual"
                        >
                            <i className="fas fa-question text-xs"></i>
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-text hover:text-light text-2xl">&times;</button>
                </header>
                
                {/* HELP VIEW OVERLAY */}
                {showHelp && (
                    <div className="absolute inset-0 top-[73px] bg-bg-card z-50 p-6 overflow-y-auto custom-scrollbar animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-primary uppercase tracking-widest">Guia de Customização</h3>
                            <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-light flex items-center gap-2 text-xs font-bold uppercase">
                                <i className="fas fa-arrow-left"></i> Voltar
                            </button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="bg-bg-main/50 p-4 rounded-xl border border-border-color/50">
                                <h4 className="font-bold text-light mb-2 flex items-center gap-2">
                                    <i className="fas fa-th-large text-secondary"></i> Layout Dinâmico
                                </h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    O <strong>Modo de Edição</strong> permite reorganizar as funcionalidades principais. Ao ativar o interruptor, ícones de movimentação aparecerão nos painéis. Clique e arraste para posicionar os módulos conforme sua necessidade operacional.
                                </p>
                            </div>

                            <div className="bg-bg-main/50 p-4 rounded-xl border border-border-color/50">
                                <h4 className="font-bold text-light mb-2 flex items-center gap-2">
                                    <i className="fas fa-columns text-secondary"></i> Barra Lateral (Sidebar)
                                </h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    <strong>Fixar Barra:</strong> Mantém o menu sempre visível. Ideal para telas grandes onde a agilidade na navegação entre setores é prioridade.<br/>
                                    <strong>Modo Retraído:</strong> Oculta os nomes dos itens, deixando apenas os ícones, maximizando a área de trabalho para tabelas e mapas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-grow p-5 overflow-y-auto custom-scrollbar space-y-8">
                    
                     {/* System Assets Gen */}
                     <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i className="fas fa-magic text-purple-400"></i> Assets & IA
                        </h3>
                        <p className="text-xs text-gray-300 mb-4">Gere recursos visuais do sistema usando IA Generativa (Veo).</p>
                        
                        <button 
                            onClick={handleGenerateVideo}
                            disabled={isGeneratingVideo}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isGeneratingVideo ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Gerando Vídeo (Isso pode demorar)...</>
                            ) : (
                                <><i className="fas fa-video"></i> Gerar Background Vivo (Veo)</>
                            )}
                        </button>
                     </section>

                    {/* AUTO START SYSTEM SECTION */}
                    <section className="bg-bg-main/30 p-4 rounded-lg border border-border-color">
                        <h3 className="text-lg font-bold text-light mb-3 border-b border-border-color pb-2 flex items-center gap-2">
                            <i className="fas fa-power-off text-primary"></i> Sistema & Inicialização
                        </h3>
                        <label htmlFor="autostart-toggle" className="flex items-center justify-between bg-bg-card p-3 rounded-lg cursor-pointer border border-transparent hover:border-border-color transition-all group">
                            <div>
                                <span className="text-sm font-black text-light uppercase tracking-wider block mb-1">INICIAR COM O SISTEMA</span>
                                <p className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400">O aplicativo será iniciado em segundo plano, minimizado na bandeja.</p>
                            </div>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="autostart-toggle" 
                                    className="sr-only" 
                                    checked={localGeneralSettings.autoStart}
                                    onChange={() => updateLocalSetting('autoStart', !localGeneralSettings.autoStart)} 
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${localGeneralSettings.autoStart ? 'bg-primary' : 'bg-bg-main border border-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localGeneralSettings.autoStart ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </section>

                    {/* USER MANAGEMENT SECTION */}
                    <section className="bg-bg-main/30 p-4 rounded-lg border border-border-color">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-light flex items-center gap-2">
                                <i className="fas fa-users-cog text-secondary"></i> Usuários e Acesso
                            </h3>
                            {userFormMode === 'list' && (
                                <button onClick={startAddUser} className="text-xs bg-primary text-white px-3 py-1.5 rounded-md font-bold hover:bg-opacity-90 transition-colors">
                                    <i className="fas fa-plus mr-1"></i> Novo
                                </button>
                            )}
                        </div>

                        {userFormMode === 'list' ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {users.map(user => (
                                    <div key={user.id} className="bg-bg-card p-3 rounded-md flex justify-between items-center border border-border-color hover:border-secondary transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-light text-sm">{user.name}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-text mt-0.5">{user.matricula} • {user.sector}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditUser(user)} className="w-7 h-7 flex items-center justify-center rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
                                                <i className="fas fa-pencil-alt text-xs"></i>
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={submitUserForm} className="space-y-3 animate-fade-in">
                                <div>
                                    <label className="text-xs text-gray-text font-semibold block mb-1">Nome Completo</label>
                                    <input type="text" name="name" value={userFormData.name || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Matrícula (ID)</label>
                                        <input type="text" name="matricula" value={userFormData.matricula || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Celular</label>
                                        <input type="text" name="phone" value={userFormData.phone || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Nível de Acesso</label>
                                        <select name="role" value={userFormData.role || 'User'} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none">
                                            {roles.map(r => <option key={r} value={r}>{r === 'Admin' ? 'Administrador' : 'Usuário Padrão'}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-text font-semibold block mb-1">Setor</label>
                                        <select name="sector" value={userFormData.sector || 'OpsMind'} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none">
                                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-text font-semibold block mb-1">Senha {userFormMode === 'edit' && '(Deixe em branco para manter)'}</label>
                                    <input type="password" name="password" value={userFormData.password || ''} onChange={handleInputChange} className="w-full bg-bg-main border border-border-color rounded p-2 text-sm text-light focus:border-secondary focus:outline-none" placeholder="******" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={cancelUserForm} className="px-3 py-1.5 text-sm bg-transparent text-gray-400 hover:text-light transition-colors">Cancelar</button>
                                    <button type="submit" className="px-3 py-1.5 text-sm bg-success text-white font-bold rounded hover:bg-green-600 transition-colors">
                                        {userFormMode === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                    
                     {/* Layout & Theme Settings */}
                     <section>
                         <h3 className="text-lg font-semibold text-light mb-3 border-b border-border-color pb-2">Visualização e Layout</h3>
                         
                         {/* Sidebar Pin */}
                         <div className="mb-4">
                            <label htmlFor="sidebar-pin-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer border border-transparent hover:border-border-color transition-all">
                              <span className="text-sm text-light">{t('pinSidebar')}</span>
                              <div className="relative">
                                <input 
                                  type="checkbox" 
                                  id="sidebar-pin-toggle" 
                                  className="sr-only" 
                                  checked={localGeneralSettings.pinned}
                                  onChange={() => updateLocalSetting('pinned', !localGeneralSettings.pinned)} 
                                />
                                <div className="block bg-bg-card border border-border-color w-10 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-gray-400 w-4 h-4 rounded-full transition-transform ${localGeneralSettings.pinned ? 'transform translate-x-4 bg-secondary' : ''}`}></div>
                              </div>
                            </label>
                         </div>
                         
                         {/* Header Behavior */}
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-text mb-2 uppercase">{t('headerBehavior')}</h4>
                            <div className="flex gap-2 bg-bg-main p-1 rounded-md border border-border-color">
                              <button onClick={() => updateLocalSetting('header', 'scroll')} className={`flex-1 p-2 rounded text-center text-xs font-bold transition-all ${localGeneralSettings.header === 'scroll' ? 'bg-secondary text-white shadow-sm' : 'text-gray-500 hover:text-light'}`}>
                                  {t('scrollHeader')}
                              </button>
                              <button onClick={() => updateLocalSetting('header', 'sticky')} className={`flex-1 p-2 rounded text-center text-xs font-bold transition-all ${localGeneralSettings.header === 'sticky' ? 'bg-secondary text-white shadow-sm' : 'text-gray-500 hover:text-light'}`}>
                                  {t('stickyHeader')}
                              </button>
                            </div>
                          </div>
                          
                          {/* Layout Mode */}
                           <div className="mb-4">
                            <label htmlFor="layout-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer border border-transparent hover:border-border-color transition-all">
                              <span className="text-sm text-light">Modo de Edição (Arrastar e Soltar)</span>
                              <div className="relative">
                                <input 
                                  type="checkbox" 
                                  id="layout-toggle" 
                                  className="sr-only" 
                                  checked={localGeneralSettings.layoutMode}
                                  onChange={() => updateLocalSetting('layoutMode', !localGeneralSettings.layoutMode)} 
                                />
                                <div className="block bg-bg-card border border-border-color w-10 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-gray-400 w-4 h-4 rounded-full transition-transform ${localGeneralSettings.layoutMode ? 'transform translate-x-4 bg-primary' : ''}`}></div>
                              </div>
                            </label>
                             <button
                                onClick={() => canResetLayout && resetLayout(activeTab)}
                                disabled={!canResetLayout}
                                className="w-full mt-2 px-4 py-2 bg-border-color/50 text-gray-400 text-xs font-semibold rounded hover:bg-border-color hover:text-light flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <i className="fas fa-undo"></i> Restaurar Layout Padrão
                            </button>
                          </div>
                     </section>

                     {/* Theme Selection */}
                     <section>
                        <h3 className="text-lg font-semibold text-light mb-3 border-b border-border-color pb-2">Tema</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(THEMES).map(([key, val]) => (
                                <button
                                    key={key}
                                    onClick={() => updateLocalSetting('theme', key)}
                                    className={`p-2 rounded border text-xs font-bold text-left transition-all ${localGeneralSettings.theme === key ? 'border-primary bg-primary/10 text-primary' : 'border-border-color text-gray-500 hover:border-gray-400'}`}
                                >
                                    {(val as any).name}
                                </button>
                            ))}
                        </div>
                     </section>

                     {/* Save Button for General Settings */}
                     <button 
                         onClick={saveGeneralSettings}
                         className="w-full py-3 mt-4 bg-primary hover:bg-primary/90 text-white font-black uppercase rounded-lg shadow-lg transition-all transform active:scale-95"
                     >
                         Salvar Configurações Gerais
                     </button>
                </div>
            </div>
        </div>
    );
};
