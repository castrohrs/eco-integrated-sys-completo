
export type Role = 'Admin' | 'User';
export type Sector = 'OpsMind' | 'FlowCapital' | 'NeuroTech' | 'IdeaForge';
export type SidebarMode = 'collapsed' | 'floating' | 'expanded';

export type TabId = 
    | 'eco-future' | 'eco-core' | 'eco-car' | 'eco-vrun' | 'eco-depot' | 'eco-atlas' | 'eco-ops' | 'eco-monitor' | 'eco-play' | 'eco-business'
    | 'dashboard' | 'transactions' | 'receipts' | 'operational-calendar' | 'operational-report' | 'history' | 'freight-quotation' 
    | 'demand-dashboard' | 'briefing' | 'briefing-feedback' | 'fleet-control' | 'user-management' | 'eco-ia' | 'eco-note' 
    | 'cte-reader' | 'container-receipt' | 'port-checklist' | 'eco-agenda' | 'financial-entries' | 'gestao-predial' | 'eco-drive' 
    | 'dados-gerais-pg' | 'faturamento-receita' | 'custos-fixos' | 'custos-variaveis' | 'advnc-contabil' | 'freight-sheet' 
    | 'collaborator-registration' | 'ocr-reader' | 'registration-control' | 'eco-sites' | 'eco-files' | 'general-approvals' 
    | 'compliance' | 'analytical-dashboard' | 'eco-criati' | 'futuro-debitos' | 'eco-chat' | 'cost-radar' | 'account-delays' 
    | 'interest-reports' | 'reimbursement' | 'conexao' | 'eco-clientes' | 'eco-doc' | 'manifesto' | 'eco-mec' | 'operational-manual' 
    | 'system-docs' | 'eco-maps' | 'eir-digital' | 'tracking-scheduling' | 'eco-finance' | 'eco-game' | 'mobile-builder' | 'eco-services'
    | 'eco-sis' | 'eco-day' | 'eco-bolt' | 'url-shortener';

export interface User {
    id: string;
    name: string;
    phone: string;
    matricula: string;
    email?: string;
    role: Role;
    sector: Sector;
    password?: string;
    photoUrl?: string;
}

export interface CustomMobileMenu {
    id: string;
    title: string;
    subtitle: string;
    footerText: string;
    items: MobileMenuItem[];
}

export interface MobileMenuItem {
    id: string;
    label: string;
    icon: string;
    color: string;
    link?: string;
}

export type RecordType = 'fixedCosts' | 'variableCosts' | 'revenues' | 'receivables';
export interface FinancialRecord { id: number; name: string; description?: string; category: string; value: number; date: string; attachment?: string; observation?: string; type?: RecordType; }
export interface RevenueRecord extends FinancialRecord { client?: string; }
export interface ReceivableRecord extends FinancialRecord { client?: string; dueDate: string; status: 'pending' | 'paid'; }
export interface FinancialData { fixedCosts: FinancialRecord[]; variableCosts: FinancialRecord[]; revenues: RevenueRecord[]; receivables: ReceivableRecord[]; }
export interface CalendarEvent { id: number; description: string; value: number; dueDate: string; status: 'pending' | 'completed'; completionDate?: string; reminderMinutes?: number; color?: string; justification?: string; }
export type DemandStatus = 'demandas' | 'em_analise' | 'aprovado' | 'em_progresso' | 'concluido' | 'cancelado' | string;
export const DEMANDA_STATUSES: DemandStatus[] = ['demandas', 'em_analise', 'aprovado', 'em_progresso', 'concluido'];

export const STATUS_ICON_MAP: Record<string, string> = {
    'demandas': 'fa-list-ul',
    'em_analise': 'fa-microscope',
    'aprovado': 'fa-check',
    'em_progresso': 'fa-spinner',
    'concluido': 'fa-check-double'
};

export const STATUS_COLOR_MAP: Record<string, string> = {
    'demandas': 'border-gray-500',
    'em_analise': 'border-blue-500',
    'aprovado': 'border-purple-500',
    'em_progresso': 'border-yellow-500',
    'concluido': 'border-green-500'
};

export interface Photo { id: string; src: string; name: string; }
export interface Attachment { id: string; name: string; size: number; type: string; url: string; }
export interface Comment { id: string; text: string; author: string; date: string; mentions?: string[]; }
export interface Demand { id: string; client: string; service: string; status: DemandStatus; date: string; contact: string; setor: string; urgencia: string; prazo: string; responsavel: string; emailAviso: string; celAviso: string; photos: Photo[]; attachments: Attachment[]; dateStart?: string; dateEnd?: string; timeStart?: string; timeEnd?: string; comments: Comment[]; }
export type VehicleStatus = 'Operacional' | 'Em Manutenção' | 'Inativo';
export interface Vehicle { id: string; plate: string; model: string; year: number; driver: string; status: VehicleStatus; }
export type MaintenanceStatus = 'Agendada' | 'Concluída';
export interface MaintenanceTask { id: string; vehicleId: string; serviceType: string; date: string; cost: number; notes: string; status: MaintenanceStatus; }
export interface Note { id: string; content: string; color: 'yellow' | 'pink' | 'blue' | 'green'; timestamp: string; isLocked: boolean; }
export type ContactCategory = 'Red' | 'Black' | 'Blue' | 'Green';
export interface Contact { id: string; name: string; phone: string; email: string; category: ContactCategory; nextAppointment?: string; }
export interface BuildingItem { id: string; description: string; location: string; createdAt: string; }
export interface ItemMessage { id: string; itemId: string; message: string; createdAt: string; }
export interface ItemAttachment { id: string; itemId: string; fileName: string; fileType: 'foto' | 'video' | 'documento'; fileContent: string; mimeType: string; }
export interface DriveFile { id: string; name: string; size: number; type: string; url: string; uploadedAt: string; folder?: string; }
export interface CompanySettings { companyName: string; cnpj: string; address: string; city: string; state: string; taxRegime: string; defaultTaxRate: number; systemCurrency: string; }
export interface FreightAnalysis { id: string; createdAt: string; clientName: string; cnpj: string; origin: string; destination: string; serviceType: string; totalKm: number; totalValue: number; pricePerKm: number; data: any; }
export interface Frete { id: string; operador: string; cliente: string; data: string; horario: string; di_br: string; referencia: string; container: string; free_time: string; peso: number; cargoType?: string; cargoVolume?: number; terminal: string; tipo: string; destino: string; motorista: string; cavalo: string; carreta: string; cte: string; vrFrete: number; obs: string; status: string; cardColor?: string; lastStatusChange?: number; attachments?: Attachment[]; comments?: Comment[]; }
export interface ClientNote { id: string; clientName: string; text: string; date: string; }
export interface BusinessPartner { id: string; type: 'Cliente' | 'Oficina' | 'Fornecedor' | 'Prestador'; name: string; document: string; contactName: string; phone: string; email: string; address: string; city: string; state: string; notes: string; status: 'Ativo' | 'Inativo'; customFields?: CustomField[]; }
export interface Layouts { [key: string]: string[]; }
export interface AppNotification { id: string; message: string; type: 'info' | 'success' | 'warning' | 'danger'; }
export type ApprovalType = 'Serviço' | 'Peças' | 'Roupas' | 'Pagamento' | 'Outros';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export interface ApprovalRequest { id: string; type: ApprovalType; description: string; value: number; requester: string; date: string; status: ApprovalStatus; justification?: string; }
export interface EcoSite { id: string; title: string; url: string; }
export type ComplianceType = 'Segurança' | 'Meio Ambiente' | 'Ética' | 'Procedimental' | 'Legal';
export type ComplianceSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type ComplianceStatus = 'Pendente' | 'Em Análise' | 'Resolvido' | 'Arquivado';
export interface ComplianceRecord { id: string; createdAt: string; title: string; type: ComplianceType; severity: ComplianceSeverity; status: ComplianceStatus; description: string; observation: string; date: string; responsible: string; involvedPerson: string; attachments?: Attachment[]; }
export interface CustomField { id: string; label: string; value: string; }
export interface EcoCriatiRecord { id: string; title: string; description: string; icon: string; color: string; customFields: CustomField[]; createdAt: string; }
export interface Product {}
export interface Order {}
export interface CommerceCustomer {}
export interface Mechanic {}
export interface MecPart {}
export type OsStatus = 'aberta' | 'em_execucao' | 'finalizada';
export type OsType = 'preventiva' | 'corretiva';
export interface OsStep { status: 'pending' | 'in_progress' | 'completed'; startedAt?: string; completedAt?: string; rating?: number; }
export interface ServiceOrder { id: string; vehicleId: string; vehiclePlate: string; openingDate: string; status: OsStatus; type: OsType; description: string; mileage: number; parts: any[]; services: any[]; totalParts: number; totalServices: number; totalCost: number; photosBefore: any[]; photosAfter: any[]; notes: string; steps: { entrance: OsStep; checklist: OsStep; quote: OsStep; bodywork: OsStep; painting: OsStep; mechanics: OsStep; electrical: OsStep; parts: OsStep; wash: OsStep; exit: OsStep; }; updatedAt?: string; }
export interface HistoryLog { id: string; content: string; timestamp: string; }
export type StatusOperacional = string;
export interface FreightColumn { id: string; title: string; color: string; }
export type ThemeMode = 'light' | 'dark' | 'auto';
export interface AppearanceSettings { themeMode: ThemeMode; backgroundId: string; primaryColorHex?: string; accentColorHex?: string; fontFamily?: string; }
export interface Shortcut { id: string; tabId: TabId; label: string; icon: string; }
export type ContainerFsmState = 'CREATED' | 'GATE_IN' | 'INSPECTION' | 'READY' | 'IN_YARD' | 'EMPTY_ALERT' | 'FULL' | 'BILLED' | 'CLOSED';
export interface ContainerHistory { timestamp: string; event: string; }
export interface Container { id: string; internalId: string; client: string; shippingLine: string; destination: string; fsmState: ContainerFsmState; billed: boolean; history: ContainerHistory[]; type?: string; status?: string; situation?: string; booking?: string; bl?: string; armador?: string; }
export interface ServiceRecord { id: string; serviceNumber: string; customerName: string; description: string; date: string; valueCharged: number; valueReceived: number; status: 'Pendente' | 'Parcial' | 'Pago'; notes: string; linkedDemandId: string; attachments: Attachment[]; }
export type ContainerStatus = 'VAZIO' | 'CHEIO';
export interface ContainerRecord { id: string; containerNumber: string; booking?: string; bl?: string; terminal: string; status: ContainerStatus; situation: string; type: string; armador?: string; }
export interface ContainerSchedule { id: string; containerNumber: string; type: string; status: 'PENDENTE' | 'CONFIRMADO'; date: string; time: string; terminal: string; armador?: string; }
export type GateMovementType = 'ENTRADA' | 'SAÍDA';
export interface GateLog { id: string; movement: GateMovementType; containerNumber: string; status: ContainerStatus; motorista: string; placa: string; timestamp: string; conferente: string; }
export type Terminal = string;
export enum VehicleModel { Truck = 'Caminhão', PickupTruck = 'Utilitário', Van = 'Van', }
export enum Urgency { Baixa = 'Baixa', Media = 'Média', Alta = 'Alta', Critica = 'Crítica', }
export interface ChatMessage { id: string; text: string; mediaUrl?: string; mediaType?: string; senderId: string; senderName: string; timestamp: string; targetId?: string; }
export interface GenericRecord { tipo: string; titulo: string; conteudo: string; }
export interface HistoryItem { id: string; description: string; date: string; }
export interface LogisticsCarrier { id: string; name: string; cnpj?: string; operationType: string; lat: number; lng: number; distanceToPortKm: string | number; city: string; contact?: string; }
export interface PortTerminal { name: string; url: string; type: 'CHEIO' | 'VAZIO' | 'AMBOS'; }
export interface Port { id: string; name: string; city: string; state: string; address: string; lat: number; lng: number; type: string; terminals?: PortTerminal[]; carriers?: LogisticsCarrier[]; }
export type CollaboratorStatus = 'Ativo' | 'Férias' | 'Afastado' | 'Desligado';
export interface Collaborator { id: string; fullName: string; cpf: string; rg: string; birthDate: string; gender: string; maritalStatus: string; email: string; phone: string; address: string; city: string; state: string; zipCode: string; admissionDate: string; position: string; sector: string; salary: number; contractType: string; status: CollaboratorStatus; bankName: string; agency: string; accountNumber: string; pixKey: string; photoUrl?: string; }
export interface MecServiceItem { id: string; description: string; price: number; }
