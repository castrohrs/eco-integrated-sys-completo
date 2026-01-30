
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { Demand, DemandStatus } from '../types';

// Tipos locais para o componente
type ServiceType = 'Transporte' | 'Documental' | 'Consultoria' | 'Armazenagem' | 'Outros';
type UrgencyLevel = 'Normal' | 'Alta' | 'Crítica';

interface ServiceStep {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

// Configuração Visual por Tipo de Serviço
const TYPE_CONFIG: Record<ServiceType, { icon: string, color: string, bg: string }> = {
    'Transporte': { icon: 'fa-truck-moving', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'Documental': { icon: 'fa-file-contract', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    'Armazenagem': { icon: 'fa-warehouse', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    'Consultoria': { icon: 'fa-user-tie', color: 'text-green-400', bg: 'bg-green-500/10' },
    'Outros': { icon: 'fa-cube', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const PRIORITY_COLORS: Record<UrgencyLevel, string> = {
    'Normal': 'bg-green-500',
    'Alta': 'bg-yellow-500',
    'Crítica': 'bg-red-600 animate-pulse'
};

const EcoServices: React.FC = () => {
    const { demands, setDemands, logAction } = useAppStore();
    const { currentUser } = useAuth();
    
    const [viewMode, setViewMode] = useState<'board' | 'wizard'>('board');
    const [filterType, setFilterType] = useState<ServiceType | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [newServiceData, setNewServiceData] = useState({
        client: '',
        contact: '',
        serviceType: 'Transporte' as ServiceType,
        description: '',
        urgency: 'Normal' as UrgencyLevel,
        deadline: '',
    });

    // --- COMPUTED DATA ---
    const stats = useMemo(() => {
        const total = demands.length;
        const critical = demands.filter(d => d.urgencia === 'Crítica').length;
        const pending = demands.filter(d => d.status !== 'concluido').length;
        return { total, critical, pending };
    }, [demands]);

    const filteredServices = useMemo(() => {
        let list = demands;
        if (filterType !== 'Todos') {
            list = list.filter(d => d.service.includes(filterType) || d.setor.includes(filterType));
        }
        if (searchTerm) {
            list = list.filter(d => 
                d.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                d.id.includes(searchTerm)
            );
        }
        return list;
    }, [demands, filterType, searchTerm]);

    // --- HANDLERS ---

    const handleGenerateLink = (serviceId: string) => {
        const mockLink = `${window.location.origin}/share/service/${serviceId}`;
        navigator.clipboard.writeText(mockLink);
        
        // Feedback para o usuário
        const openLink = confirm(`Link de acesso gerado e copiado para a área de transferência:\n\n${mockLink}\n\nDeseja abrir o link simulado em uma nova aba?`);
        
        if (openLink) {
            window.open(mockLink, '_blank');
        }
        
        logAction(`ECO.SERVICES: Link gerado para demanda ${serviceId}`);
    };

    const handleWizardNext = () => {
        if (wizardStep < 3) setWizardStep(prev => prev + 1);
        else handleSubmitService();
    };

    const handleWizardBack = () => {
        if (wizardStep > 1) setWizardStep(prev => prev - 1);
        else setViewMode('board');
    };

    const handleSubmitService = () => {
        const newDemand: Demand = {
            id: `SRV-${Math.floor(Math.random() * 10000)}`,
            client: newServiceData.client,
            contact: newServiceData.contact,
            service: `[${newServiceData.serviceType}] ${newServiceData.description}`,
            setor: 'Operacional',
            urgencia: newServiceData.urgency,
            prazo: newServiceData.deadline,
            status: 'demandas', 
            date: new Date().toLocaleDateString('pt-BR'),
            responsavel: currentUser?.name || 'Sistema',
            emailAviso: '',
            celAviso: '',
            photos: [],
            attachments: [],
            comments: []
        };

        setDemands(prev => [newDemand, ...prev]);
        logAction(`ECO.SERVICES: Novo serviço registrado para ${newServiceData.client}`);
        
        setNewServiceData({
            client: '', contact: '', serviceType: 'Transporte', 
            description: '', urgency: 'Normal', deadline: ''
        });
        setWizardStep(1);
        setViewMode('board');
    };

    const handleDelete = (id: string) => {
        if(confirm("Tem certeza que deseja remover este serviço?")) {
            setDemands(prev => prev.filter(d => d.id !== id));
        }
    };

    // --- RENDERERS ---

    const renderWizard = () => (
        <div className="max-w-2xl mx-auto py-10 animate-fade-in">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Assistente de Serviço</h2>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`h-2 w-12 rounded-full transition-all ${step <= wizardStep ? 'bg-primary' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
            </div>

            <div className="bg-bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {wizardStep === 1 && (
                    <div className="space-y-6 animate-slide-up">
                        <h3 className="text-xl font-bold text-light flex items-center gap-3"><span className="bg-primary text-black w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">1</span> Identificação</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quem é o Cliente?</label>
                            <input 
                                className="w-full bg-bg-main border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-all font-bold"
                                placeholder="Nome da Empresa ou Cliente"
                                value={newServiceData.client}
                                onChange={e => setNewServiceData({...newServiceData, client: e.target.value})}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo de Serviço</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {Object.keys(TYPE_CONFIG).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setNewServiceData({...newServiceData, serviceType: type as ServiceType})}
                                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${newServiceData.serviceType === type ? 'bg-primary/20 border-primary text-white' : 'bg-bg-main border-white/5 text-gray-400 hover:bg-white/5'}`}
                                    >
                                        <i className={`fas ${TYPE_CONFIG[type as ServiceType].icon}`}></i>
                                        <span className="text-xs font-bold uppercase">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 2 && (
                    <div className="space-y-6 animate-slide-up">
                         <h3 className="text-xl font-bold text-light flex items-center gap-3"><span className="bg-primary text-black w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">2</span> Detalhes da Operação</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">O que precisa ser feito?</label>
                            <textarea 
                                className="w-full bg-bg-main border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-all h-32 resize-none"
                                placeholder="Descreva a demanda, rota, tipo de carga ou necessidade..."
                                value={newServiceData.description}
                                onChange={e => setNewServiceData({...newServiceData, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contato (WhatsApp/Email)</label>
                            <input 
                                className="w-full bg-bg-main border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-all"
                                placeholder="(00) 00000-0000"
                                value={newServiceData.contact}
                                onChange={e => setNewServiceData({...newServiceData, contact: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {wizardStep === 3 && (
                    <div className="space-y-6 animate-slide-up">
                        <h3 className="text-xl font-bold text-light flex items-center gap-3"><span className="bg-primary text-black w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">3</span> Definições Finais</h3>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nível de Urgência</label>
                            <div className="flex gap-4 mt-2">
                                {(['Normal', 'Alta', 'Crítica'] as UrgencyLevel[]).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setNewServiceData({...newServiceData, urgency: level})}
                                        className={`flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-wider border transition-all ${newServiceData.urgency === level ? `border-white text-white ${PRIORITY_COLORS[level]}` : 'bg-bg-main border-white/5 text-gray-500'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Prazo Limite</label>
                            <input 
                                type="date"
                                className="w-full bg-bg-main border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-all"
                                value={newServiceData.deadline}
                                onChange={e => setNewServiceData({...newServiceData, deadline: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                    <button onClick={handleWizardBack} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-all uppercase text-xs tracking-widest">
                        {wizardStep === 1 ? 'Cancelar' : 'Voltar'}
                    </button>
                    <button 
                        onClick={handleWizardNext}
                        disabled={wizardStep === 1 && !newServiceData.client}
                        className="px-8 py-3 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 uppercase text-xs tracking-widest disabled:opacity-50 disabled:scale-100"
                    >
                        {wizardStep === 3 ? 'Finalizar Registro' : 'Próximo Passo'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBoard = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-card p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Serviços</span>
                    <span className="text-3xl font-black text-white mt-1">{stats.total}</span>
                </div>
                <div className="bg-bg-card p-5 rounded-2xl border-l-4 border-red-500 shadow-lg flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Alta Prioridade</span>
                    <span className="text-3xl font-black text-white mt-1">{stats.critical}</span>
                </div>
                <div className="bg-bg-card p-5 rounded-2xl border-l-4 border-yellow-500 shadow-lg flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Em Andamento</span>
                    <span className="text-3xl font-black text-white mt-1">{stats.pending}</span>
                </div>
                <button 
                    onClick={() => setViewMode('wizard')}
                    className="bg-primary hover:bg-primary/90 text-black p-5 rounded-2xl shadow-lg shadow-primary/20 flex flex-col items-center justify-center gap-2 group transition-all transform hover:-translate-y-1"
                >
                    <i className="fas fa-plus text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className="text-xs font-black uppercase tracking-widest">Novo Serviço</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-bg-card p-2 rounded-2xl border border-white/5">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto p-1">
                    {['Todos', ...Object.keys(TYPE_CONFIG)].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterType === type ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64 mr-2">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                    <input 
                        type="text" 
                        placeholder="BUSCAR SERVIÇO..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-main border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white uppercase outline-none focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {filteredServices.map(service => {
                    let typeKey: ServiceType = 'Outros';
                    for(const t of Object.keys(TYPE_CONFIG)) {
                        if (service.service.includes(t)) {
                            typeKey = t as ServiceType;
                            break;
                        }
                    }
                    const config = TYPE_CONFIG[typeKey];
                    const priorityColor = PRIORITY_COLORS[service.urgencia as UrgencyLevel] || 'bg-gray-600';

                    return (
                        <div key={service.id} className="bg-bg-card border border-white/5 rounded-[2rem] p-6 hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${config.bg.replace('/10', '')}`}></div>

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.bg} ${config.color}`}>
                                        <i className={`fas ${config.icon}`}></i>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleGenerateLink(service.id)} className="text-gray-600 hover:text-primary transition-colors" title="Gerar Link de Compartilhamento"><i className="fas fa-link"></i></button>
                                        <button onClick={() => handleDelete(service.id)} className="text-gray-600 hover:text-red-500 transition-colors"><i className="fas fa-trash"></i></button>
                                    </div>
                                </div>

                                <h4 className="text-lg font-black text-white leading-tight mb-1 line-clamp-2">{service.client}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">ID: {service.id}</p>
                                
                                <p className="text-xs text-gray-300 font-medium leading-relaxed line-clamp-3 mb-4">
                                    {service.service.replace(/\[.*?\]/g, '').trim()}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                    <i className="fas fa-calendar"></i> {service.prazo ? new Date(service.prazo).toLocaleDateString('pt-BR') : 'S/ Prazo'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${priorityColor}`}></span>
                                    <div className="bg-bg-main px-3 py-1 rounded-lg text-[9px] font-black uppercase text-primary border border-white/5">
                                        {service.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                <button 
                    onClick={() => setViewMode('wizard')}
                    className="border-2 border-dashed border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-white/5 transition-all group min-h-[240px]"
                >
                    <i className="fas fa-plus-circle text-4xl group-hover:scale-110 transition-transform"></i>
                    <span className="text-xs font-black uppercase tracking-widest">Adicionar Serviço</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-full pb-10">
            {viewMode === 'board' ? renderBoard() : renderWizard()}
        </div>
    );
};

export default EcoServices;
