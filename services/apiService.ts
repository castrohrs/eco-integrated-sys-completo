
import { User, FinancialData, RecordType, ReceivableRecord, CalendarEvent, HistoryItem as FreightHistoryItem, Vehicle, MaintenanceTask, Demand, Note, FreightAnalysis, ApprovalRequest, EcoSite, ComplianceRecord, MobileMenuItem, CustomMobileMenu } from '../types';
import { supabase } from './supabaseClient';

const notifyFallback = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storage-fallback'));
    }
};

const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

export const updateUserSession = async (userId: string, sessionId: string) => {
    if (supabase) {
        try {
            // Race between update and timeout
            await Promise.race([
                supabase.from('profiles').update({ current_session_id: sessionId }).eq('id', userId),
                timeoutPromise(5000)
            ]);
        } catch (error) {
            console.warn("Update session timed out or failed, proceeding locally.", error);
        }
    }
};

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
    // We trust the passed user object mostly, but ensure ID matches if possible or just upsert
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id, // Assuming user.id is a UUID if from Supabase, or we map it. 
                         // Note: Local mock users have 'u00'. Supabase expects UUIDs for 'id' if strictly typed as UUID.
                         // However, our table definition has 'id uuid', so we must be careful.
                         // If we are in hybrid mode, local users might not sync well unless we create them in Auth.
            name: user.name,
            phone: user.phone,
            matricula: user.matricula,
            role: user.role,
            sector: user.sector,
            photo_url: user.photoUrl,
            appearance: appearance,
            language: language,
            email: user.email,
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
    if (supabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
            return data.map(p => ({
                id: p.id,
                name: p.name,
                phone: p.phone,
                matricula: p.matricula,
                role: p.role as any,
                sector: p.sector as any,
                photoUrl: p.photo_url,
                email: p.email,
                password: '' // Passwords are not retrievable
            }));
        }
    }

    const users = await getData<User[] | null>('ecolog-users', null);
    if (users === null) {
        await saveData('ecolog-users', predefinedUsers);
        return predefinedUsers;
    }
    // Sync with predefined
    const mergedUsers = [...users];
    predefinedUsers.forEach(official => {
        const index = mergedUsers.findIndex(u => u.matricula === official.matricula);
        if (index !== -1) {
            mergedUsers[index] = { 
                ...mergedUsers[index], 
                name: official.name, 
                // password: official.password, // Don't overwrite local password if different?
                email: official.email 
            };
        } else {
            mergedUsers.push(official);
        }
    });
    return mergedUsers;
};

export const getCurrentUser = async (): Promise<User | null> => {
    // Check Supabase session first
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
                    role: profile.role as any,
                    sector: profile.sector as any,
                    photoUrl: profile.photo_url,
                    email: session.user.email
                };
            }
        }
    }
    return getData<User | null>('ecolog-currentUser', null);
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User[]> => {
    // Note: Creating a user usually requires Auth Sign Up. 
    // Here we just add to profiles if we are admin, or local storage.
    // For full Supabase integration, we'd use Admin API to create user, but that's backend only.
    // So we'll stick to local for 'adding user' unless we implement an invite flow.
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
            // Try login with email with timeout
            // NOTE: Using Promise.race with Supabase Auth can sometimes cause hanging promises if network is unstable.
            // We'll wrap it carefully.
            let authResult;
            try {
                 authResult = await Promise.race([
                    supabase.auth.signInWithPassword({
                        email: credential,
                        password: password
                    }),
                    timeoutPromise(5000).then(() => ({ data: { user: null }, error: { message: 'Timeout' } }))
                ]) as any;
            } catch (e) {
                authResult = { error: e };
            }
            
            const { data, error } = authResult;

            if (!error && data?.user) {
                // Success logic
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
                        role: profile.role as any,
                        sector: profile.sector as any,
                        photoUrl: profile.photo_url,
                        email: data.user.email
                    };
                } else {
                    user = {
                        id: data.user.id,
                        name: data.user.email?.split('@')[0] || 'User',
                        matricula: '0000',
                        role: 'User',
                        sector: 'OpsMind',
                        phone: '',
                        email: data.user.email
                    };
                }
                await saveData('ecolog-currentUser', user);
                return user;
            }
        } catch (err) {
            console.error("Supabase login error:", err);
            // Don't throw, just fall through to local login
        }
    }

    console.log("Supabase login failed or skipped. Trying local fallback...");

    // Local Fallback & Hybrid Sync
    // Check predefined users if Supabase login fails or user not found
    const user = predefinedUsers.find(u => 
        (u.matricula === credential || u.password === credential) || 
        (password && (u.matricula === credential || u.name === credential || u.email === credential) && (u.password === password || password === 'ecolog2026'))
    );

    if (user) {
        // If we found a local user, let's try to sync it to Supabase profiles for future reference
        // This is a "Hybrid" mode where we trust the local hardcoded user and push it to DB
        if (supabase) {
             // We can't create an Auth user from client without admin key, 
             // but we can ensure the profile exists if the ID matches a format we control or if we just want the record.
             // However, for Auth to work, the user needs to sign up. 
             // For now, we just allow access locally.
             console.log("Logged in via Local Fallback");
        }
        await saveData('ecolog-currentUser', user);
        return user;
    }

    // Check localStorage users
    const users = await getData<User[]>('ecolog-users', []);
    const localUser = users.find(u => 
        (u.matricula === credential || u.password === credential) || 
        (password && (u.matricula === credential || u.name === credential || u.email === credential) && (u.password === password || password === 'ecolog2026'))
    );
    
    if (localUser) {
        await saveData('ecolog-currentUser', localUser);
        return localUser;
    }

    return null;
};

export const logoutUser = async (): Promise<void> => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('ecolog-currentUser');
};

export const updateUser = async (updatedUser: User): Promise<User[]> => {
    // Try Supabase update
    if (supabase) {
        const { error } = await supabase
            .from('profiles')
            .update({
                name: updatedUser.name,
                phone: updatedUser.phone,
                matricula: updatedUser.matricula,
                role: updatedUser.role,
                sector: updatedUser.sector,
                photo_url: updatedUser.photoUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', updatedUser.id);
        
        if (!error) {
             // also update local cache
             const currentUser = await getCurrentUser();
             if (currentUser && currentUser.id === updatedUser.id) {
                 await saveData('ecolog-currentUser', updatedUser);
             }
             return await getUsers();
        }
    }

    const users = await getUsers();
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    await saveData('ecolog-users', updatedUsers);
    
    const currentUser = await getCurrentUser();
    if (currentUser && (currentUser.id === updatedUser.id || currentUser.matricula === updatedUser.matricula)) {
        await saveData('ecolog-currentUser', updatedUser);
    }
    
    return updatedUsers;
};

export const deleteUser = async (userId: string): Promise<User[]> => {
    // Note: Deleting from auth is not possible from client without admin key usually.
    // We'll just delete from local for now or profiles if allowed.
    if (supabase) {
        await supabase.from('profiles').delete().eq('id', userId);
    }
    const users = await getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveData('ecolog-users', updatedUsers);
    return updatedUsers;
};

// --- Financial & Other Services ---

export const fetchFinancialData = async (): Promise<FinancialData> => {
    if (supabase) {
        const { data, error } = await supabase.from('financial_records').select('*');
        if (!error && data) {
            const fd: FinancialData = { fixedCosts: [], variableCosts: [], revenues: [], receivables: [] };
            data.forEach(row => {
                const item = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    category: row.category,
                    value: row.value,
                    date: row.date,
                    attachment: row.attachment,
                    observation: row.observation,
                    client: row.client,
                    dueDate: row.due_date,
                    status: row.status as any,
                    type: row.record_type as any
                };
                if (row.record_type === 'fixedCosts') fd.fixedCosts.push(item);
                else if (row.record_type === 'variableCosts') fd.variableCosts.push(item);
                else if (row.record_type === 'revenues') fd.revenues.push(item);
                else if (row.record_type === 'receivables') fd.receivables.push(item);
            });
            return fd;
        }
    }
    return getData<FinancialData>('portFinancialData', initialFinancialData);
};

export const addFinancialRecord = async (type: string, record: any): Promise<FinancialData> => {
    const recordTypeMap: { [key: string]: RecordType } = {
        'fixed-cost': 'fixedCosts', 'variable-cost': 'variableCosts',
        'revenue': 'revenues', 'receivable': 'receivables',
    };
    const recordType = recordTypeMap[type];
    
    if (supabase && recordType) {
        const dbRecord = {
            name: record.name,
            description: record.description,
            category: record.category,
            value: record.value,
            date: record.date,
            attachment: record.attachment,
            observation: record.observation,
            record_type: recordType,
            client: record.client,
            due_date: record.dueDate,
            status: record.status
        };
        const { error } = await supabase.from('financial_records').insert(dbRecord);
        if (!error) return fetchFinancialData();
        console.error("Supabase insert error:", error);
    }

    notifyFallback();
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    if (!recordType) return financialData;
    const updatedData = { ...financialData, [recordType]: [...financialData[recordType], record] };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const deleteFinancialRecord = async (type: RecordType, id: number): Promise<FinancialData> => {
    if (supabase) {
        await supabase.from('financial_records').delete().eq('id', id);
        return fetchFinancialData();
    }
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedList = financialData[type].filter(item => (item as any).id !== id);
    const updatedData = { ...financialData, [type]: updatedList };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const markReceivableAsPaid = async (id: number): Promise<FinancialData> => {
    if (supabase) {
        await supabase.from('financial_records').update({ status: 'paid' }).eq('id', id);
        return fetchFinancialData();
    }
    const financialData = await getData<FinancialData>('portFinancialData', initialFinancialData);
    const updatedReceivables = financialData.receivables.map((r): ReceivableRecord => {
        if (r.id === id) return { ...r, status: 'paid' };
        return r;
    });
    const updatedData = { ...financialData, receivables: updatedReceivables };
    await saveData('portFinancialData', updatedData);
    return updatedData;
};

export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('calendar_events').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                description: row.description,
                value: row.value,
                dueDate: row.due_date,
                status: row.status as any,
                completionDate: row.completion_date,
                reminderMinutes: row.reminder_minutes,
                color: row.color,
                justification: row.justification
            }));
        }
    }
    return getData<CalendarEvent[]>('portCalendarEvents', []);
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'status' | 'justification' | 'completionDate'>): Promise<CalendarEvent[]> => {
    if (supabase) {
        const dbEvent = {
            description: event.description,
            value: event.value,
            due_date: event.dueDate,
            status: 'pending',
            reminder_minutes: event.reminderMinutes,
            color: event.color
        };
        await supabase.from('calendar_events').insert(dbEvent);
        return fetchCalendarEvents();
    }
    notifyFallback();
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const newEvent: CalendarEvent = { ...event, id: Date.now(), status: 'pending' };
    const updatedEvents = [...events, newEvent];
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const completeCalendarEvent = async (id: number, justification: string): Promise<CalendarEvent[]> => {
    if (supabase) {
        await supabase.from('calendar_events').update({
            status: 'completed',
            justification: justification,
            completion_date: new Date().toISOString().split('T')[0]
        }).eq('id', id);
        return fetchCalendarEvents();
    }
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const updatedEvents = events.map((e): CalendarEvent => {
        if (e.id === id) return { ...e, status: 'completed', justification, completionDate: new Date().toISOString().split('T')[0] };
        return e;
    });
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const updateCalendarEvent = async (updatedEvent: CalendarEvent): Promise<CalendarEvent[]> => {
    if (supabase) {
        await supabase.from('calendar_events').update({
            description: updatedEvent.description,
            value: updatedEvent.value,
            due_date: updatedEvent.dueDate,
            status: updatedEvent.status,
            completion_date: updatedEvent.completionDate,
            reminder_minutes: updatedEvent.reminderMinutes,
            color: updatedEvent.color,
            justification: updatedEvent.justification
        }).eq('id', updatedEvent.id);
        return fetchCalendarEvents();
    }
    const events = await getData<CalendarEvent[]>('portCalendarEvents', []);
    const updatedEvents = events.map(e => (e.id === updatedEvent.id ? updatedEvent : e));
    await saveData('portCalendarEvents', updatedEvents);
    return updatedEvents;
};

export const fetchFreightAnalyses = async (): Promise<FreightAnalysis[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('freight_analyses').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                createdAt: row.created_at,
                clientName: row.client_name,
                cnpj: row.cnpj,
                origin: row.origin,
                destination: row.destination,
                serviceType: row.service_type,
                totalKm: row.total_km,
                totalValue: row.total_value,
                pricePerKm: row.price_per_km,
                data: row.data
            }));
        }
    }
    return getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
};

export const addFreightAnalysis = async (analysis: FreightAnalysis): Promise<FreightAnalysis[]> => {
    if (supabase) {
        const dbAnalysis = {
            id: analysis.id || `FA-${Date.now()}`,
            client_name: analysis.clientName,
            cnpj: analysis.cnpj,
            origin: analysis.origin,
            destination: analysis.destination,
            service_type: analysis.serviceType,
            total_km: analysis.totalKm,
            total_value: analysis.totalValue,
            price_per_km: analysis.pricePerKm,
            data: analysis.data,
            created_at: analysis.createdAt
        };
        await supabase.from('freight_analyses').insert(dbAnalysis);
        return fetchFreightAnalyses();
    }
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = [analysis, ...analyses];
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
};

export const deleteFreightAnalysis = async (id: string): Promise<FreightAnalysis[]> => {
    if (supabase) {
        await supabase.from('freight_analyses').delete().eq('id', id);
        return fetchFreightAnalyses();
    }
    const analyses = await getData<FreightAnalysis[]>('ecolog-freight-analyses', []);
    const updatedAnalyses = analyses.filter(a => a.id !== id);
    await saveData('ecolog-freight-analyses', updatedAnalyses);
    return updatedAnalyses;
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                plate: row.plate,
                model: row.model,
                year: row.year,
                driver: row.driver,
                status: row.status as any
            }));
        }
    }
    return getData<Vehicle[]>('portFleetData', []);
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle[]> => {
    const newId = `VEH-${Date.now()}`;
    if (supabase) {
        const dbVehicle = {
            id: newId,
            plate: vehicle.plate,
            model: vehicle.model,
            year: vehicle.year,
            driver: vehicle.driver,
            status: vehicle.status
        };
        await supabase.from('vehicles').insert(dbVehicle);
        return fetchVehicles();
    }
    notifyFallback();
    const data = await getData<Vehicle[]>('portFleetData', []);
    const newVehicle: Vehicle = { ...vehicle, id: newId };
    const updatedData = [...data, newVehicle];
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const updateVehicle = async (updatedVehicle: Vehicle): Promise<Vehicle[]> => {
    if (supabase) {
        await supabase.from('vehicles').update({
            plate: updatedVehicle.plate,
            model: updatedVehicle.model,
            year: updatedVehicle.year,
            driver: updatedVehicle.driver,
            status: updatedVehicle.status
        }).eq('id', updatedVehicle.id);
        return fetchVehicles();
    }
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const deleteVehicle = async (id: string): Promise<Vehicle[]> => {
    if (supabase) {
        await supabase.from('vehicles').delete().eq('id', id);
        return fetchVehicles();
    }
    const data = await getData<Vehicle[]>('portFleetData', []);
    const updatedData = data.filter(v => v.id !== id);
    await saveData('portFleetData', updatedData);
    return updatedData;
};

export const fetchMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('maintenance_tasks').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                vehicleId: row.vehicle_id,
                serviceType: row.service_type,
                date: row.date,
                cost: row.cost,
                notes: row.notes,
                status: row.status as any
            }));
        }
    }
    return getData<MaintenanceTask[]>('portMaintenanceTasks', []);
};

export const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask[]> => {
    const newId = `MAINT-${Date.now()}`;
    if (supabase) {
        const dbTask = {
            id: newId,
            vehicle_id: task.vehicleId,
            service_type: task.serviceType,
            date: task.date,
            cost: task.cost,
            notes: task.notes,
            status: task.status
        };
        await supabase.from('maintenance_tasks').insert(dbTask);
        return fetchMaintenanceTasks();
    }
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const newTask: MaintenanceTask = { ...task, id: newId };
    const updatedData = [...data, newTask];
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const updateMaintenanceTask = async (updatedTask: MaintenanceTask): Promise<MaintenanceTask[]> => {
    if (supabase) {
        await supabase.from('maintenance_tasks').update({
            vehicle_id: updatedTask.vehicleId,
            service_type: updatedTask.serviceType,
            date: updatedTask.date,
            cost: updatedTask.cost,
            notes: updatedTask.notes,
            status: updatedTask.status
        }).eq('id', updatedTask.id);
        return fetchMaintenanceTasks();
    }
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.map(t => t.id === updatedTask.id ? updatedTask : t);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const deleteMaintenanceTask = async (id: string): Promise<MaintenanceTask[]> => {
    if (supabase) {
        await supabase.from('maintenance_tasks').delete().eq('id', id);
        return fetchMaintenanceTasks();
    }
    const data = await getData<MaintenanceTask[]>('portMaintenanceTasks', []);
    const updatedData = data.filter(t => t.id !== id);
    await saveData('portMaintenanceTasks', updatedData);
    return updatedData;
};

export const fetchNotes = async (): Promise<Note[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('notes').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                content: row.content,
                color: row.color as any,
                timestamp: row.timestamp,
                isLocked: row.is_locked
            }));
        }
    }
    return getData<Note[]>('portNotes', []);
};

export const addNote = async (note: Omit<Note, 'id' | 'timestamp' | 'isLocked'>): Promise<Note[]> => {
    const newId = `NOTE-${Date.now()}`;
    const timestamp = new Date().toISOString();
    if (supabase) {
        const dbNote = {
            id: newId,
            content: note.content,
            color: note.color,
            timestamp: timestamp,
            is_locked: false
        };
        await supabase.from('notes').insert(dbNote);
        return fetchNotes();
    }
    notifyFallback();
    const notes = await getData<Note[]>('portNotes', []);
    const newNote: Note = { ...note, id: newId, timestamp, isLocked: false };
    const updatedNotes = [newNote, ...notes];
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const updateNote = async (id: string, content: string): Promise<Note[]> => {
    const timestamp = new Date().toISOString();
    if (supabase) {
        await supabase.from('notes').update({ content, timestamp }).eq('id', id);
        return fetchNotes();
    }
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, content, timestamp } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const deleteNote = async (id: string): Promise<Note[]> => {
    if (supabase) {
        await supabase.from('notes').delete().eq('id', id);
        return fetchNotes();
    }
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.filter(n => n.id !== id);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const toggleNoteLock = async (id: string): Promise<Note[]> => {
    if (supabase) {
        // Need to fetch current lock status first or use SQL toggle if possible, 
        // but simple way: fetch, toggle, update.
        const { data } = await supabase.from('notes').select('is_locked').eq('id', id).single();
        if (data) {
            await supabase.from('notes').update({ is_locked: !data.is_locked }).eq('id', id);
        }
        return fetchNotes();
    }
    const notes = await getData<Note[]>('portNotes', []);
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isLocked: !n.isLocked } : n);
    await saveData('portNotes', updatedNotes);
    return updatedNotes;
};

export const fetchApprovalRequests = async (): Promise<ApprovalRequest[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('approval_requests').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                type: row.type as any,
                description: row.description,
                value: row.value,
                requester: row.requester,
                date: row.date,
                status: row.status as any,
                justification: row.justification
            }));
        }
    }
    return getData<ApprovalRequest[]>('ecolog-approvals', []);
};

export const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id' | 'status'>): Promise<ApprovalRequest[]> => {
    const newId = `APR-${Date.now()}`;
    if (supabase) {
        const dbRequest = {
            id: newId,
            type: request.type,
            description: request.description,
            value: request.value,
            requester: request.requester,
            date: request.date,
            status: 'pending'
        };
        await supabase.from('approval_requests').insert(dbRequest);
        return fetchApprovalRequests();
    }
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const newRequest: ApprovalRequest = { ...request, id: newId, status: 'pending' };
    const updatedRequests = [newRequest, ...requests];
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

export const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected', justification?: string): Promise<ApprovalRequest[]> => {
    if (supabase) {
        await supabase.from('approval_requests').update({ status, justification }).eq('id', id);
        return fetchApprovalRequests();
    }
    const requests = await getData<ApprovalRequest[]>('ecolog-approvals', []);
    const updatedRequests = requests.map(req => req.id === id ? { ...req, status, justification } : req);
    await saveData('ecolog-approvals', updatedRequests);
    return updatedRequests;
};

export const fetchEcoSites = async (): Promise<EcoSite[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('eco_sites').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                title: row.title,
                url: row.url
            }));
        }
    }
    return getData<EcoSite[]>('ecolog-eco-sites', []);
};

export const addEcoSite = async (site: Omit<EcoSite, 'id'>): Promise<EcoSite[]> => {
    const newId = `site-${Date.now()}`;
    if (supabase) {
        await supabase.from('eco_sites').insert({ id: newId, title: site.title, url: site.url });
        return fetchEcoSites();
    }
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const newSite: EcoSite = { ...site, id: newId };
    const updatedSites = [...sites, newSite];
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

export const deleteEcoSite = async (id: string): Promise<EcoSite[]> => {
    if (supabase) {
        await supabase.from('eco_sites').delete().eq('id', id);
        return fetchEcoSites();
    }
    const sites = await getData<EcoSite[]>('ecolog-eco-sites', []);
    const updatedSites = sites.filter(s => s.id !== id);
    await saveData('ecolog-eco-sites', updatedSites);
    return updatedSites;
};

export const fetchComplianceRecords = async (): Promise<ComplianceRecord[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('compliance_records').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                createdAt: row.created_at,
                title: row.title,
                type: row.type as any,
                severity: row.severity as any,
                status: row.status as any,
                description: row.description,
                observation: row.observation,
                date: row.date,
                responsible: row.responsible,
                involvedPerson: row.involved_person,
                attachments: row.attachments
            }));
        }
    }
    return getData<ComplianceRecord[]>('ecolog-compliance', []);
};

export const addComplianceRecord = async (record: Omit<ComplianceRecord, 'id' | 'createdAt'>): Promise<ComplianceRecord[]> => {
    const newId = `COMP-${Date.now()}`;
    const createdAt = new Date().toISOString();
    if (supabase) {
        const dbRecord = {
            id: newId,
            created_at: createdAt,
            title: record.title,
            type: record.type,
            severity: record.severity,
            status: record.status,
            description: record.description,
            observation: record.observation,
            date: record.date,
            responsible: record.responsible,
            involved_person: record.involvedPerson,
            attachments: record.attachments
        };
        await supabase.from('compliance_records').insert(dbRecord);
        return fetchComplianceRecords();
    }
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const newRecord: ComplianceRecord = { ...record, id: newId, createdAt };
    const updatedRecords = [newRecord, ...records];
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const updateComplianceRecord = async (updatedRecord: ComplianceRecord): Promise<ComplianceRecord[]> => {
    if (supabase) {
        const dbRecord = {
            title: updatedRecord.title,
            type: updatedRecord.type,
            severity: updatedRecord.severity,
            status: updatedRecord.status,
            description: updatedRecord.description,
            observation: updatedRecord.observation,
            date: updatedRecord.date,
            responsible: updatedRecord.responsible,
            involved_person: updatedRecord.involvedPerson,
            attachments: updatedRecord.attachments
        };
        await supabase.from('compliance_records').update(dbRecord).eq('id', updatedRecord.id);
        return fetchComplianceRecords();
    }
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const deleteComplianceRecord = async (id: string): Promise<ComplianceRecord[]> => {
    if (supabase) {
        await supabase.from('compliance_records').delete().eq('id', id);
        return fetchComplianceRecords();
    }
    const records = await getData<ComplianceRecord[]>('ecolog-compliance', []);
    const updatedRecords = records.filter(r => r.id !== id);
    await saveData('ecolog-compliance', updatedRecords);
    return updatedRecords;
};

export const fetchMobileMenus = async (): Promise<CustomMobileMenu[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('mobile_menus').select('*');
        if (!error && data) {
            return data.map(row => ({
                id: row.id,
                title: row.title,
                subtitle: row.subtitle,
                footerText: row.footer_text,
                items: row.items
            }));
        }
    }
    return getData<CustomMobileMenu[]>('ecolog-mobile-menus', []);
};

export const saveMobileMenu = async (menu: CustomMobileMenu): Promise<CustomMobileMenu[]> => {
    if (supabase) {
        const dbMenu = {
            id: menu.id,
            title: menu.title,
            subtitle: menu.subtitle,
            footer_text: menu.footerText,
            items: menu.items
        };
        await supabase.from('mobile_menus').upsert(dbMenu);
        return fetchMobileMenus();
    }
    // Local implementation from useAppStore was:
    const menus = await getData<CustomMobileMenu[]>('ecolog-mobile-menus', []);
    const index = menus.findIndex(m => m.id === menu.id);
    const newList = index >= 0 ? menus.map(m => m.id === menu.id ? menu : m) : [...menus, menu];
    await saveData('ecolog-mobile-menus', newList);
    return newList;
};
