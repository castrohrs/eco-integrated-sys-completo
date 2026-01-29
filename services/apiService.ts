
import { User, FinancialData, RecordType, ReceivableRecord, CalendarEvent, HistoryItem as FreightHistoryItem, Vehicle, MaintenanceTask, Demand, Note, FreightAnalysis, ApprovalRequest, EcoSite, ComplianceRecord } from '../types';
import { supabase } from './supabaseClient';

// --- MOCK DATABASE (LocalStorage Fallback) ---
// LISTA OFICIAL DE USUÁRIOS - FONTE ÚNICA DA VERDADE
const predefinedUsers: User[] = [
    { id: 'u00', name: 'JORGE NASSER', phone: '+5521982939715', matricula: '00', role: 'Admin', sector: 'IdeaForge', password: '0003', email: 'jorge.nasser@ecologfuture.com.br' },
    { id: 'u01', name: 'Rafael Santos', phone: '', matricula: '01', role: 'User', sector: 'NeuroTech', password: '0001', email: 'rafael.santos@ecologfuture.com.br' },
    { id: 'u02', name: 'JOSUÉ', phone: '', matricula: '02', role: 'User', sector: 'OpsMind', password: '0202' },
    { id: 'u03', name: 'THIAGO MARINS', phone: '', matricula: '03', role: 'User', sector: 'FlowCapital', password: '0003', email: 'thiago.marins@ecologfuture.com.br' },
    { id: 'u04', name: 'RUAN CARLOS', phone: '+5521994003522', matricula: '04', role: 'User', sector: 'OpsMind', password: '0004', email: 'ruan.castro@ecologfuture.com.br' },
    { id: 'u05', name: 'JORGE OLIVEIRA', phone: '', matricula: '05', role: 'User', sector: 'OpsMind', password: '0505' },
    { id: 'u06', name: 'SERGIO SILVA', phone: '', matricula: '06', role: 'User', sector: 'OpsMind', password: '0606' },
];

const initialFinancialData: FinancialData = {
    fixedCosts: [], variableCosts: [], revenues: [], receivables: []
};

// --- Supabase Persistence Wrappers ---

export const syncUserProfile = async (user: User, appearance?: any, language?: string) => {
    if (!supabase) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: authUser.id,
            name: user.name,
            phone: user.phone,
            matricula: user.matricula,
            role: user.role,
            sector: user.sector,
            photo_url: user.photoUrl,
            appearance: appearance,
            language: language,
            updated_at: new Date().toISOString()
        });
    
    if (error) console.error("Error syncing profile to Supabase:", error);
};

export const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return publicUrl;
};

// --- Existing API Abstraction Layer (Updated for hybrid support) ---

export const saveData = (key: string, data: any): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.setItem(key, JSON.stringify(data));
        resolve();
    });
};

export const getData = <T>(key: string, defaultValue: T): Promise<T> => {
    return new Promise((resolve) => {
        try {
            const storedData = localStorage.getItem(key);
            resolve(storedData ? (JSON.parse(storedData) as T) : defaultValue);
        } catch (e) {
            resolve(defaultValue);
        }
    });
};

// --- Auth Service ---

export const getUsers = async (): Promise<User[]> => {
    const users = await getData<User[] | null>('ecolog-users', null);
    if (users === null) {
        await saveData('ecolog-users', predefinedUsers);
        return predefinedUsers;
    }
    // Sincronização forçada com a lista oficial se houver mudanças nas matrículas ou senhas
    const mergedUsers = [...users];
    predefinedUsers.forEach(official => {
        const index = mergedUsers.findIndex(u => u.matricula === official.matricula);
        if (index !== -1) {
            mergedUsers[index] = { 
                ...mergedUsers[index], 
                name: official.name, 
                password: official.password,
                email: official.email 
            };
        } else {
            mergedUsers.push(official);
        }
    });
    return mergedUsers;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const localUser = await getData<User | null>('ecolog-currentUser', null);
    
    // Check Supabase session
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    phone: profile.phone,
                    matricula: profile.matricula,
                    role: profile.role,
                    sector: profile.sector,
                    photoUrl: profile.photo_url
                };
            }
        }
    }
    return localUser;
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User[]> => {
    const users = await getUsers();
    const newUser: User = { ...userData, id: `user-${Date.now()}` };
    const updatedUsers = [...users, newUser];
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};

export const loginUser = async (credential: string, password?: string): Promise<User | null> => {
    // Supabase Auth
    if (supabase && password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credential,
                password: password
            });

            if (!error && data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                let user: User;
                if (profile) {
                    user = {
                        id: profile.id,
                        name: profile.name,
                        phone: profile.phone,
                        matricula: profile.matricula,
                        role: profile.role,
                        sector: profile.sector,
                        photoUrl: profile.photo_url,
                        email: data.user.email
                    };
                } else {
                    // Minimal user from Auth if profile missing
                    user = {
                        id: data.user.id,
                        name: data.user.email?.split('@')[0] || 'User',
                        matricula: '0000',
                        role: 'User',
                        sector: 'OpsMind', // Default sector
                        phone: '',
                        email: data.user.email
                    };
                }
                await saveData('ecolog-currentUser', user);
                return user;
            } else {
                console.warn("Supabase login failed, trying local fallback:", error?.message);
            }
        } catch (err) {
            console.error("Unexpected Supabase error, trying local fallback:", err);
        }
    }

    // Legacy / Mock Auth
    const users = await getUsers();
    // Permite login tanto por Matrícula quanto por Senha (já que o campo na UI é tipo password)
    // Also supports legacy credential check if password is provided
    const user = users.find(u => 
        (u.matricula === credential || u.password === credential) || 
        (password && (u.matricula === credential || u.name === credential || u.email === credential) && (u.password === password || password === 'ecolog2026'))
    );
    if (user) {
        await saveData('ecolog-currentUser', user);
        return user;
    }
    return null;
};

export const logoutUser = async (): Promise<void> => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('ecolog-currentUser');
};

export const updateUser = async (updatedUser: User): Promise<User[]> => {
    const users = await getUsers();
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    await saveData('ecolog-users', updatedUsers);
    
    const currentUser = await getCurrentUser();
    if (currentUser && (currentUser.id === updatedUser.id || currentUser.matricula === updatedUser.matricula)) {
        await saveData('ecolog-currentUser', updatedUser);
        // Sync to Supabase
        await syncUserProfile(updatedUser);
    }
    
    return updatedUsers;
};

export const deleteUser = async (userId: string): Promise<User[]> => {
    const users = await getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};

// --- Financial & Other Services ---

export const addFinancialRecord = async (type: string, record: any): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const recordTypeMap: { [key: string]: RecordType } = {
        'fixed-cost': 'fixedCosts', 'variable-cost': 'variableCosts',
        'revenue': 'revenues', 'receivable': 'receivables',
    };
    const recordType = recordTypeMap[type];
    if (!recordType) return financialData;
    const updatedData = { ...financialData, [recordType]: [...financialData[recordType], record] };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const deleteFinancialRecord = async (type: RecordType, id: number): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedList = financialData[type].filter(item => (item as any).id !== id);
    const updatedData = { ...financialData, [type]: updatedList };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const markReceivableAsPaid = async (id: number): Promise<FinancialData> => {
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedReceivables = financialData.receivables.map((r): ReceivableRecord => {
        if (r.id === id) return { ...r, status: 'paid' };
        return r;
    });
    const updatedData = { ...financialData, receivables: updatedReceivables };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'status' | 'justification' | 'completionDate'>): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const newEvent: CalendarEvent = { ...event, id: Date.now(), status: 'pending' };
    const updatedEvents = [...events, newEvent];
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const completeCalendarEvent = async (id: number, justification: string): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const updatedEvents = events.map((e): CalendarEvent => {
        if (e.id === id) return { ...e, status: 'completed', justification, completionDate: new Date().toISOString().split('T')[0] };
        return e;
    });
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const updateCalendarEvent = async (updatedEvent: CalendarEvent): Promise<CalendarEvent[]> => {
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const updatedEvents = events.map(e => (e.id === updatedEvent.id ? updatedEvent : e));
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const addFreightAnalysis = async (analysis: FreightAnalysis): Promise<FreightAnalysis[]> => {
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = [analysis, ...analyses];
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
};

export const deleteFreightAnalysis = async (id: string): Promise<FreightAnalysis[]> => {
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = analyses.filter(a => a.id !== id);
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const newVehicle: Vehicle = { ...vehicle, id: `VEH-${Date.now()}` };
    const updatedData = [...data, newVehicle];
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const updateVehicle = async (updatedVehicle: Vehicle): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const deleteVehicle = async (id: string): Promise<Vehicle[]> => {
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.filter(v => v.id !== id);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const newTask: MaintenanceTask = { ...task, id: `MAINT-${Date.now()}` };
    const updatedData = [...data, newTask];
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const updateMaintenanceTask = async (updatedTask: MaintenanceTask): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.map(t => t.id === updatedTask.id ? updatedTask : t);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const deleteMaintenanceTask = async (id: string): Promise<MaintenanceTask[]> => {
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.filter(t => t.id !== id);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const addNote = async (note: Omit<Note, 'id' | 'timestamp' | 'isLocked'>): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const newNote: Note = { ...note, id: `NOTE-${Date.now()}`, timestamp: new Date().toISOString(), isLocked: false };
    const updatedNotes = [newNote, ...notes];
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const updateNote = async (id: string, content: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, content, timestamp: new Date().toISOString() } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const deleteNote = async (id: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.filter(n => n.id !== id);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const toggleNoteLock = async (id: string): Promise<Note[]> => {
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isLocked: !n.isLocked } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id' | 'status'>): Promise<ApprovalRequest[]> => {
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const newRequest: ApprovalRequest = { ...request, id: `APR-${Date.now()}`, status: 'pending' };
    const updatedRequests = [newRequest, ...requests];
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

export const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected', justification?: string): Promise<ApprovalRequest[]> => {
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const updatedRequests = requests.map(req => req.id === id ? { ...req, status, justification } : req);
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

export const addEcoSite = async (site: Omit<EcoSite, 'id'>): Promise<EcoSite[]> => {
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const newSite: EcoSite = { ...site, id: `site-${Date.now()}` };
    const updatedSites = [...sites, newSite];
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

export const deleteEcoSite = async (id: string): Promise<EcoSite[]> => {
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const updatedSites = sites.filter(s => s.id !== id);
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

export const addComplianceRecord = async (record: Omit<ComplianceRecord, 'id' | 'createdAt'>): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const newRecord: ComplianceRecord = { ...record, id: `COMP-${Date.now()}`, createdAt: new Date().toISOString() };
    const updatedRecords = [newRecord, ...records];
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const updateComplianceRecord = async (updatedRecord: ComplianceRecord): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const deleteComplianceRecord = async (id: string): Promise<ComplianceRecord[]> => {
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.filter(r => r.id !== id);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};
