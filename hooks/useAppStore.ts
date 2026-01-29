
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as apiService from '../services/apiService';
import { 
    User, FinancialData, CalendarEvent, Demand, Vehicle, MaintenanceTask, Note, Contact, 
    FreightAnalysis, Frete, ClientNote, BusinessPartner, Layouts, AppNotification, ApprovalRequest, 
    EcoSite, ComplianceRecord, EcoCriatiRecord, ServiceOrder, HistoryLog, TabId, RecordType,
    AppearanceSettings, Shortcut, ThemeMode, SidebarMode,
    Container, ContainerRecord, ContainerSchedule, GateLog, ContainerStatus, Collaborator,
    DriveFile, BuildingItem, ItemMessage, ItemAttachment, CompanySettings, ServiceRecord,
    CustomMobileMenu
} from '../types';

export const THEMES = {
    light: { name: 'Light', colors: {} },
    dark: { name: 'Dark', colors: {} },
    matrix: { name: 'Matrix', colors: {} },
};

// Adicionada propriedade 'themeColor' para definir a cor do menu por setor
export const SIDEBAR_SECTORS = [
    { 
        id: 'OpsMind', 
        label: 'Gestão & Controle', 
        description: 'Coordenação operacional e administrativa', 
        themeColor: 'bg-[#1e293b]', // Slate Dark (Padrão)
        items: [ { id: 'dashboard', textKey: 'dashboard', icon: 'fa-chart-line' }, { id: 'operational-manual', textKey: 'Manual Operacional', icon: 'fa-book' }, { id: 'system-docs', textKey: 'System Specs', icon: 'fa-microchip' }, { id: 'manifesto', textKey: 'Manifesto', icon: 'fa-scroll' } ] 
    },
    { 
        id: 'FlowCapital', 
        label: 'Financeiro', 
        description: 'Fluxo de caixa e contabilidade', 
        themeColor: 'bg-[#064e3b]', // Emerald Dark (Verde Fechado)
        items: [ { id: 'eco-finance', textKey: 'Gestão Financeira', icon: 'fa-money-check-alt' }, { id: 'advnc-contabil', textKey: 'Contabilidade', icon: 'fa-calculator' }, { id: 'general-approvals', textKey: 'Aprovações', icon: 'fa-check-double' }, { id: 'analytical-dashboard', textKey: 'BI Analítico', icon: 'fa-chart-bar' }, { id: 'futuro-debitos', textKey: 'Futuro x Débitos', icon: 'fa-balance-scale' }, { id: 'operational-report', textKey: 'Relatórios', icon: 'fa-file-alt' }, { id: 'operational-calendar', textKey: 'Calendário', icon: 'fa-calendar-alt' }, { id: 'faturamento-receita', textKey: 'Faturamento', icon: 'fa-file-invoice-dollar' }, { id: 'transactions', textKey: 'Transações', icon: 'fa-exchange-alt' }, { id: 'financial-entries', textKey: 'Lançamentos', icon: 'fa-plus-circle' } ] 
    },
    { 
        id: 'NeuroTech', 
        label: 'Operacional & Oficina', 
        description: 'Logística, Frota e Manutenção', 
        themeColor: 'bg-[#450a0a]', // Red Dark (Vermelho Fechado - Oficina)
        items: [ { id: 'eco-services', textKey: 'ECO.SERVICES (Novo)', icon: 'fa-rocket' }, { id: 'eco-mec', textKey: 'Eco.Mec (Oficina)', icon: 'fa-tools' }, { id: 'fleet-control', textKey: 'fleetControl', icon: 'fa-truck' }, { id: 'eco-maps', textKey: 'Radar Tático GPS', icon: 'fa-satellite' }, { id: 'tracking-scheduling', textKey: 'Eco.Container', icon: 'fa-cubes' }, { id: 'freight-quotation', textKey: 'Cotação & Cadastro', icon: 'fa-search-dollar' }, { id: 'freight-sheet', textKey: 'Planilha Fretes', icon: 'fa-table' }, { id: 'briefing', textKey: 'Demandas (Antigo)', icon: 'fa-tasks' }, { id: 'briefing-feedback', textKey: 'Feedback Cliente', icon: 'fa-comments' }, { id: 'port-checklist', textKey: 'Checklist', icon: 'fa-clipboard-check' }, { id: 'cte-reader', textKey: 'CT-e Manager', icon: 'fa-barcode' }, { id: 'eco-doc', textKey: 'Eco.Docs', icon: 'fa-file-signature' }, { id: 'container-receipt', textKey: 'Container Legacy', icon: 'fa-box' }, { id: 'gestao-predial', textKey: 'Predial', icon: 'fa-city' }, { id: 'registration-control', textKey: 'Cadastros', icon: 'fa-address-book' } ] 
    },
    { 
        id: 'IdeaForge', 
        label: 'Inovação & Labs', 
        description: 'Ferramentas experimentais', 
        themeColor: 'bg-[#312e81]', // Indigo Dark (Roxo Fechado)
        items: [ { id: 'eco-ia', textKey: 'Eco.IA', icon: 'fa-brain' }, { id: 'eco-game', textKey: 'Eco.Game', icon: 'fa-gamepad' }, { id: 'mobile-builder', textKey: 'Mobile Builder', icon: 'fa-mobile-alt' }, { id: 'eco-files', textKey: 'Eco.Files', icon: 'fa-folder-open' }, { id: 'eco-drive', textKey: 'Eco.Drive', icon: 'fa-mouse-pointer' }, { id: 'ocr-reader', textKey: 'Leitor OCR', icon: 'fa-eye' }, { id: 'eco-sites', textKey: 'Eco.Sites', icon: 'fa-globe' }, { id: 'compliance', textKey: 'Compliance', icon: 'fa-shield-alt' }, { id: 'eco-agenda', textKey: 'Agenda', icon: 'fa-address-book' }, { id: 'eco-note', textKey: 'ecoNote', icon: 'fa-sticky-note' }, { id: 'dados-gerais-pg', textKey: 'Dados Empresa', icon: 'fa-database' } ] 
    }
];

interface AppState {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    sidebarMode: SidebarMode;
    setSidebarMode: (mode: SidebarMode) => void;
    activeSector: string | null;
    toggleSector: (sectorId: string) => void;
    checkPermission: (user: User | null, tab: TabId) => boolean;
    appearance: AppearanceSettings;
    updateAppearance: (settings: Partial<AppearanceSettings>) => void;
    isMusicPlayerOpen: boolean;
    setIsMusicPlayerOpen: (isOpen: boolean) => void;
    isMusicPlayerMinimized: boolean;
    setIsMusicPlayerMinimized: (isMinimized: boolean) => void;
    headerBehavior: 'scroll' | 'sticky';
    setHeaderBehavior: (behavior: 'scroll' | 'sticky') => void;
    theme: string;
    setTheme: (theme: string) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    fontFamily: string;
    setFontFamily: (font: string) => void;
    isLayoutMode: boolean;
    setIsLayoutMode: (isMode: boolean) => void;
    isSidebarPinned: boolean;
    setIsSidebarPinned: (isPinned: boolean) => void;
    layouts: Layouts;
    setLayouts: React.Dispatch<React.SetStateAction<Layouts>>;
    resetLayout: (pageId: string) => void;
    isAutoStartEnabled: boolean;
    toggleAutoStart: () => void;
    financialData: FinancialData;
    addRecord: (type: string, record: any) => void;
    deleteRecord: (type: RecordType, id: number) => void;
    markAsPaid: (id: number) => void;
    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: any) => void;
    updateCalendarEvent: (event: CalendarEvent) => void;
    completeCalendarEvent: (id: number, justification: string) => void;
    demands: Demand[];
    setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
    columnTitles: Record<string, string>;
    setColumnTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    addKanbanColumn: (title: string) => void;
    removeKanbanColumn: (key: string) => void;
    freightSheetData: Frete[];
    addFreightSheetItem: (frete: Frete) => void;
    updateFreightSheetItem: (frete: Frete) => void;
    deleteFreightSheetItem: (id: string) => void;
    clientNotes: ClientNote[];
    addClientNote: (note: ClientNote) => void;
    fleetData: Vehicle[];
    addVehicle: (vehicle: any) => void;
    updateVehicle: (vehicle: any) => void;
    deleteVehicle: (id: string) => void;
    maintenanceTasks: MaintenanceTask[];
    addMaintenanceTask: (task: any) => void;
    updateMaintenanceTask: (task: any) => void;
    deleteMaintenanceTask: (id: string) => void;
    notes: Note[];
    addNote: (note: any) => void;
    updateNote: (id: string, content: string) => void;
    deleteNote: (id: string) => void;
    toggleNoteLock: (id: string) => void;
    contacts: Contact[];
    addContact: (contact: any) => void;
    updateContact: (contact: any) => void;
    deleteContact: (id: string) => void;
    buildingItems: BuildingItem[];
    addBuildingItem: (item: any) => void;
    updateBuildingItem: (item: any) => void;
    deleteBuildingItem: (id: string) => void;
    itemMessages: ItemMessage[];
    addItemMessage: (msg: any) => void;
    itemAttachments: ItemAttachment[];
    addItemAttachment: (att: any) => void;
    deleteItemAttachment: (id: string) => void;
    driveFiles: DriveFile[];
    uploadFile: (file: File, folder?: string) => void;
    deleteFile: (id: string) => void;
    companySettings: CompanySettings;
    updateCompanySettings: (settings: CompanySettings) => void;
    freightAnalyses: FreightAnalysis[];
    addFreightAnalysis: (analysis: FreightAnalysis) => void;
    deleteFreightAnalysis: (id: string) => void;
    partners: BusinessPartner[];
    addPartner: (partner: any) => void;
    updatePartner: (partner: any) => void;
    deletePartner: (id: string) => void;
    notifications: AppNotification[];
    addNotification: (notification: Omit<AppNotification, 'id'>) => void;
    dismissNotification: (id: string) => void;
    approvalRequests: ApprovalRequest[];
    addApprovalRequest: (req: any) => void;
    approveRequest: (id: string) => void;
    rejectRequest: (id: string, justification: string) => void;
    ecoSites: EcoSite[];
    addEcoSite: (site: any) => void;
    deleteEcoSite: (id: string) => void;
    complianceRecords: ComplianceRecord[];
    addComplianceRecord: (record: any) => void;
    updateComplianceRecord: (record: any) => void;
    deleteComplianceRecord: (id: string) => void;
    ecoCriatiRecords: EcoCriatiRecord[];
    addEcoCriatiRecord: (record: any) => void;
    deleteEcoCriatiRecord: (id: string) => void;
    serviceOrders: ServiceOrder[];
    setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
    addServiceRecord: (record: any) => void;
    updateServiceRecord: (record: any) => void;
    deleteServiceRecord: (id: string) => void;
    serviceRecords: ServiceRecord[];
    history: HistoryLog[];
    logAction: (content: string) => void;
    clearHistory: () => void;
    containers: Container[];
    processContainerEvent: (id: string, event: string, user: string) => void;
    ecoContainerRecords: ContainerRecord[];
    addContainerRecord: (record: any) => void;
    updateContainerRecord: (record: any) => void;
    deleteContainerRecord: (id: string) => void;
    ecoContainerSchedules: ContainerSchedule[];
    addContainerSchedule: (schedule: any) => void;
    updateContainerSchedule: (schedule: any) => void;
    ecoGateLogs: GateLog[];
    registerGateMovement: (log: any) => void;
    shortcuts: Shortcut[];
    toggleShortcut: (tabId: TabId) => void;
    activeFloatingTool: 'chat' | 'notes' | null;
    setActiveFloatingTool: (tool: 'chat' | 'notes' | null) => void;
    mechanics: any[];
    setMechanics: any;
    mechanicParts: any[];
    setMechanicParts: any;
    // Mobile Builder State
    customMobileMenus: CustomMobileMenu[];
    saveMobileMenu: (menu: CustomMobileMenu) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>('collapsed');
    const [activeSector, setActiveSector] = useState<string | null>(null);
    const [appearance, setAppearance] = useState<AppearanceSettings>({ themeMode: 'dark', backgroundId: 'MINIMAL_DARK_GRADIENT' });
    const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
    const [isMusicPlayerMinimized, setIsMusicPlayerMinimized] = useState(false);
    const [headerBehavior, setHeaderBehavior] = useState<'scroll'|'sticky'>('sticky');
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('100%');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [isLayoutMode, setIsLayoutMode] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [layouts, setLayouts] = useState<Layouts>({});
    const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(true);
    const [activeFloatingTool, setActiveFloatingTool] = useState<'chat'|'notes'|null>(null);

    const [financialData, setFinancialData] = useState<FinancialData>({ fixedCosts: [], variableCosts: [], revenues: [], receivables: [] });
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [demands, setDemands] = useState<Demand[]>([]);
    const [columnTitles, setColumnTitles] = useState<Record<string, string>>({
        'demandas': 'Novas Demandas',
        'em_analise': 'Em Análise',
        'aprovado': 'Aprovadas',
        'em_progresso': 'Em Progresso',
        'concluido': 'Concluído'
    });
    const [freightSheetData, setFreightSheetData] = useState<Frete[]>([]);
    const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
    const [fleetData, setFleetData] = useState<Vehicle[]>([]);
    const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [buildingItems, setBuildingItems] = useState<BuildingItem[]>([]);
    const [itemMessages, setItemMessages] = useState<ItemMessage[]>([]);
    const [itemAttachments, setItemAttachments] = useState<ItemAttachment[]>([]);
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>({
        companyName: 'Império Eco Log', cnpj: '00.000.000/0001-00', address: '', city: 'Rio de Janeiro', state: 'RJ', taxRegime: 'Simples Nacional', defaultTaxRate: 6, systemCurrency: 'BRL'
    });
    const [freightAnalyses, setFreightAnalyses] = useState<FreightAnalysis[]>([]);
    const [partners, setPartners] = useState<BusinessPartner[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
    const [ecoSites, setEcoSites] = useState<EcoSite[]>([]);
    const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
    const [ecoCriatiRecords, setEcoCriatiRecords] = useState<EcoCriatiRecord[]>([]);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [history, setHistory] = useState<HistoryLog[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [ecoContainerRecords, setEcoContainerRecords] = useState<ContainerRecord[]>([]);
    const [ecoContainerSchedules, setEcoContainerSchedules] = useState<ContainerSchedule[]>([]);
    const [ecoGateLogs, setEcoGateLogs] = useState<GateLog[]>([]);
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [mechanics, setMechanics] = useState<any[]>([]);
    const [mechanicParts, setMechanicParts] = useState<any[]>([]);
    const [customMobileMenus, setCustomMobileMenus] = useState<CustomMobileMenu[]>([]);

    const toggleSector = (id: string) => setActiveSector(activeSector === id ? null : id);
    const checkPermission = (user: User | null, tab: TabId) => true;
    const updateAppearance = (settings: Partial<AppearanceSettings>) => setAppearance(prev => ({...prev, ...settings}));
    const toggleAutoStart = () => setIsAutoStartEnabled(!isAutoStartEnabled);
    const resetLayout = (pageId: string) => { setLayouts(prev => { const next = { ...prev }; delete next[pageId]; return next; }); };

    const addRecord = (type: string, record: any) => apiService.addFinancialRecord(type, record).then(setFinancialData);
    const deleteRecord = (type: RecordType, id: number) => apiService.deleteFinancialRecord(type, id).then(setFinancialData);
    const markAsPaid = (id: number) => apiService.markReceivableAsPaid(id).then(setFinancialData);
    const addCalendarEvent = (event: any) => apiService.addCalendarEvent(event).then(setCalendarEvents);
    const updateCalendarEvent = (event: CalendarEvent) => apiService.updateCalendarEvent(event).then(setCalendarEvents);
    const completeCalendarEvent = (id: number, justification: string) => apiService.completeCalendarEvent(id, justification).then(setCalendarEvents);
    const logAction = (content: string) => setHistory(prev => [{ id: Date.now().toString(), content, timestamp: new Date().toISOString() }, ...prev]);
    const clearHistory = () => setHistory([]);
    const addKanbanColumn = (title: string) => setColumnTitles(prev => ({ ...prev, [title.toLowerCase().replace(/\s+/g, '_')]: title }));
    const removeKanbanColumn = (key: string) => setColumnTitles(prev => { const next = { ...prev }; delete next[key]; return next; });
    const addFreightSheetItem = (frete: Frete) => setFreightSheetData(prev => [...prev, frete]);
    const updateFreightSheetItem = (frete: Frete) => setFreightSheetData(prev => prev.map(f => f.id === frete.id ? frete : f));
    const deleteFreightSheetItem = (id: string) => setFreightSheetData(prev => prev.filter(f => f.id !== id));
    const addClientNote = (note: ClientNote) => setClientNotes(prev => [...prev, note]);
    const addVehicle = (v: any) => apiService.addVehicle(v).then(setFleetData);
    const updateVehicle = (v: any) => apiService.updateVehicle(v).then(setFleetData);
    const deleteVehicle = (id: string) => apiService.deleteVehicle(id).then(setFleetData);
    const addMaintenanceTask = (t: any) => apiService.addMaintenanceTask(t).then(setMaintenanceTasks);
    const updateMaintenanceTask = (t: any) => apiService.updateMaintenanceTask(t).then(setMaintenanceTasks);
    const deleteMaintenanceTask = (id: string) => apiService.deleteMaintenanceTask(id).then(setMaintenanceTasks);
    const addNote = (n: any) => apiService.addNote(n).then(setNotes);
    const updateNote = (id: string, c: string) => apiService.updateNote(id, c).then(setNotes);
    const deleteNote = (id: string) => apiService.deleteNote(id).then(setNotes);
    const toggleNoteLock = (id: string) => apiService.toggleNoteLock(id).then(setNotes);
    const addContact = (c: any) => setContacts(prev => [...prev, { ...c, id: Date.now().toString() }]);
    const updateContact = (c: any) => setContacts(prev => prev.map(x => x.id === c.id ? c : x));
    const deleteContact = (id: string) => setContacts(prev => prev.filter(x => x.id !== id));
    const addBuildingItem = (i: any) => setBuildingItems(prev => [...prev, { ...i, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    const updateBuildingItem = (i: any) => setBuildingItems(prev => prev.map(x => x.id === i.id ? i : x));
    const deleteBuildingItem = (id: string) => setBuildingItems(prev => prev.filter(x => x.id !== id));
    const addItemMessage = (m: any) => setItemMessages(prev => [...prev, { ...m, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    const addItemAttachment = (a: any) => setItemAttachments(prev => [...prev, { ...a, id: Date.now().toString() }]);
    const deleteItemAttachment = (id: string) => setItemAttachments(prev => prev.filter(a => a.id !== id));
    const uploadFile = (file: File, folder?: string) => setDriveFiles(prev => [...prev, { id: Date.now().toString(), name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString(), folder }]);
    const deleteFile = (id: string) => setDriveFiles(prev => prev.filter(f => f.id !== id));
    const updateCompanySettings = (s: CompanySettings) => setCompanySettings(s);
    const addFreightAnalysis = (a: FreightAnalysis) => apiService.addFreightAnalysis(a).then(setFreightAnalyses);
    const deleteFreightAnalysis = (id: string) => apiService.deleteFreightAnalysis(id).then(setFreightAnalyses);
    const addPartner = (p: any) => setPartners(prev => [...prev, { ...p, id: Date.now().toString() }]);
    const updatePartner = (p: any) => setPartners(prev => prev.map(x => x.id === p.id ? p : x));
    const deletePartner = (id: string) => setPartners(prev => prev.filter(x => x.id !== id));
    const addNotification = (n: Omit<AppNotification, 'id'>) => setNotifications(prev => [...prev, { ...n, id: Date.now().toString() }]);
    const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
    const addApprovalRequest = (r: any) => apiService.addApprovalRequest(r).then(setApprovalRequests);
    const approveRequest = (id: string) => apiService.updateApprovalStatus(id, 'approved').then(setApprovalRequests);
    const rejectRequest = (id: string, j: string) => apiService.updateApprovalStatus(id, 'rejected', j).then(setApprovalRequests);
    const addEcoSite = (s: any) => apiService.addEcoSite(s).then(setEcoSites);
    const deleteEcoSite = (id: string) => apiService.deleteEcoSite(id).then(setEcoSites);
    const addComplianceRecord = (r: any) => apiService.addComplianceRecord(r).then(setComplianceRecords);
    const updateComplianceRecord = (r: any) => apiService.updateComplianceRecord(r).then(setComplianceRecords);
    const deleteComplianceRecord = (id: string) => apiService.deleteComplianceRecord(id).then(setComplianceRecords);
    const addEcoCriatiRecord = (r: any) => setEcoCriatiRecords(prev => [...prev, { ...r, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    const deleteEcoCriatiRecord = (id: string) => setEcoCriatiRecords(prev => prev.filter(r => r.id !== id));
    const addServiceRecord = (r: any) => setServiceRecords(prev => [...prev, { ...r, id: Date.now().toString() }]);
    const updateServiceRecord = (r: any) => setServiceRecords(prev => prev.map(x => x.id === r.id ? r : x));
    const deleteServiceRecord = (id: string) => setServiceRecords(prev => prev.filter(x => x.id !== id));
    const processContainerEvent = (id: string, event: string, user: string) => { setContainers(prev => prev.map(c => c.internalId === id ? { ...c, history: [...c.history, { timestamp: new Date().toISOString(), event }] } : c)); };
    const addContainerRecord = (r: any) => setEcoContainerRecords(prev => [...prev, { ...r, id: Date.now().toString() }]);
    const updateContainerRecord = (r: any) => setEcoContainerRecords(prev => prev.map(x => x.id === r.id ? r : x));
    const deleteContainerRecord = (id: string) => setEcoContainerRecords(prev => prev.filter(x => x.id !== id));
    const addContainerSchedule = (s: any) => setEcoContainerSchedules(prev => [...prev, { ...s, id: Date.now().toString() }]);
    const updateContainerSchedule = (s: any) => setEcoContainerSchedules(prev => prev.map(x => x.id === s.id ? s : x));
    const registerGateMovement = (l: any) => setEcoGateLogs(prev => [...prev, { ...l, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    const toggleShortcut = (tabId: TabId) => setShortcuts(prev => prev.some(s => s.tabId === tabId) ? prev.filter(s => s.tabId !== tabId) : [...prev, { id: Date.now().toString(), tabId, label: tabId, icon: 'fa-star' }]);
    
    const saveMobileMenu = (menu: CustomMobileMenu) => {
        setCustomMobileMenus(prev => {
            const index = prev.findIndex(m => m.id === menu.id);
            const newList = index >= 0 ? prev.map(m => m.id === menu.id ? menu : m) : [...prev, menu];
            localStorage.setItem('ecolog-mobile-menus', JSON.stringify(newList));
            return newList;
        });
    };

    useEffect(() => {
        apiService.getData('portFinancialData', { fixedCosts: [], variableCosts: [], revenues: [], receivables: [] }).then(setFinancialData);
        apiService.getData('portCalendarEvents', []).then(setCalendarEvents);
        apiService.getData('portFleetData', []).then(setFleetData);
        apiService.getData('portMaintenanceTasks', []).then(setMaintenanceTasks);
        apiService.getData('portNotes', []).then(setNotes);
        apiService.getData('ecolog-freight-analyses', []).then(setFreightAnalyses);
        apiService.getData('ecolog-approvals', []).then(setApprovalRequests);
        apiService.getData('ecolog-eco-sites', []).then(setEcoSites);
        apiService.getData('ecolog-compliance', []).then(setComplianceRecords);
        apiService.getData('ecolog-mobile-menus', []).then(setCustomMobileMenus);
    }, []);

    const value = {
        activeTab, setActiveTab, sidebarMode, setSidebarMode, activeSector, toggleSector, checkPermission,
        appearance, updateAppearance, isMusicPlayerOpen, setIsMusicPlayerOpen, isMusicPlayerMinimized, setIsMusicPlayerMinimized,
        headerBehavior, setHeaderBehavior, theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily,
        isLayoutMode, setIsLayoutMode, isSidebarPinned, setIsSidebarPinned, layouts, setLayouts, resetLayout,
        isAutoStartEnabled, toggleAutoStart,
        financialData, addRecord, deleteRecord, markAsPaid,
        calendarEvents, addCalendarEvent, updateCalendarEvent, completeCalendarEvent,
        demands, setDemands, columnTitles, setColumnTitles, addKanbanColumn, removeKanbanColumn,
        freightSheetData, addFreightSheetItem, updateFreightSheetItem, deleteFreightSheetItem,
        clientNotes, addClientNote,
        fleetData, addVehicle, updateVehicle, deleteVehicle,
        maintenanceTasks, addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask,
        notes, addNote, updateNote, deleteNote, toggleNoteLock,
        contacts, addContact, updateContact, deleteContact,
        buildingItems, addBuildingItem, updateBuildingItem, deleteBuildingItem,
        itemMessages, addItemMessage,
        itemAttachments, addItemAttachment, deleteItemAttachment,
        driveFiles, uploadFile, deleteFile,
        companySettings, updateCompanySettings,
        freightAnalyses, addFreightAnalysis, deleteFreightAnalysis,
        partners, addPartner, updatePartner, deletePartner,
        notifications, addNotification, dismissNotification,
        approvalRequests, addApprovalRequest, approveRequest, rejectRequest,
        ecoSites, addEcoSite, deleteEcoSite,
        complianceRecords, addComplianceRecord, updateComplianceRecord, deleteComplianceRecord,
        ecoCriatiRecords, addEcoCriatiRecord, deleteEcoCriatiRecord,
        serviceOrders, setServiceOrders, serviceRecords, addServiceRecord, updateServiceRecord, deleteServiceRecord,
        history, logAction, clearHistory,
        containers, processContainerEvent,
        ecoContainerRecords, addContainerRecord, updateContainerRecord, deleteContainerRecord,
        ecoContainerSchedules, addContainerSchedule, updateContainerSchedule,
        ecoGateLogs, registerGateMovement,
        shortcuts, toggleShortcut,
        activeFloatingTool, setActiveFloatingTool,
        mechanics, setMechanics, mechanicParts, setMechanicParts,
        customMobileMenus, saveMobileMenu
    };

    return React.createElement(AppContext.Provider, { value }, children);
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppStore must be used within AppProvider");
    return context;
};
