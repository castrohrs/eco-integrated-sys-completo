
import { User, FinancialData, RecordType, ReceivableRecord, CalendarEvent, HistoryItem as FreightHistoryItem, Vehicle, MaintenanceTask, Demand, Note, FreightAnalysis, ApprovalRequest, EcoSite, ComplianceRecord, MobileMenuItem, CustomMobileMenu } from '../types';
import { supabase } from './supabaseClient';

const throwPersistenceError = () => {
    throw new Error("Local storage is disabled. Please check your network connection or Supabase configuration.");
};

const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

export const updateUserSession = async (userId: string, sessionId: string) => {
    if (!supabase) throwPersistenceError();
    try {
        await Promise.race([
            supabase!.from('profiles').update({ current_session_id: sessionId }).eq('id', userId),
            timeoutPromise(5000)
        ]);
    } catch (error) {
        console.error("Failed to update session:", error);
        throw error;
    }
};

// --- Supabase Persistence Wrappers ---

export const syncUserProfile = async (user: User, appearance?: any, language?: string) => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!
        .from('profiles')
        .upsert({
            id: user.id,
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
    
    if (error) {
        console.error("Error syncing profile to Supabase:", error);
        throw new Error(`Sync profile failed: ${error.message}`);
    }
};

export const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!supabase) throwPersistenceError();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase!.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase!.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return publicUrl;
};

// --- Auth Service ---

export const getUsers = async (): Promise<User[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('profiles').select('*');
    if (error) throw new Error(`Fetch users failed: ${error.message}`);
    
    return data.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        matricula: p.matricula,
        role: p.role as any,
        sector: p.sector as any,
        photoUrl: p.photo_url,
        email: p.email,
        password: ''
    }));
};

export const getCurrentUser = async (): Promise<User | null> => {
    if (!supabase) throwPersistenceError();
    const { data: { session } } = await supabase!.auth.getSession();
    if (session) {
        const { data: profile } = await supabase!
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
    return null;
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User[]> => {
    // Adding user via client-side is restricted in Supabase Auth usually.
    // We will just throw error as this operation requires Admin API or Invite flow.
    throw new Error("Adding users directly is not supported in Strict Mode without Admin API.");
};

export const loginUser = async (credential: string, password?: string): Promise<User | null> => {
    if (!supabase) throwPersistenceError();
    if (!password) throw new Error("Password required");

    const { data, error } = await supabase!.auth.signInWithPassword({
        email: credential,
        password: password
    });

    if (error) throw error;

    if (data?.user) {
        const { data: profile } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
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
                email: data.user.email
            };
        }
    }
    return null;
};

export const logoutUser = async (): Promise<void> => {
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem('ecolog_session_id');
};

export const updateUser = async (updatedUser: User): Promise<User[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!
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
    
    if (error) throw new Error(`Update user failed: ${error.message}`);
    return await getUsers();
};

export const deleteUser = async (userId: string): Promise<User[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('profiles').delete().eq('id', userId);
    if (error) throw new Error(`Delete user failed: ${error.message}`);
    return await getUsers();
};

// --- Financial & Other Services ---

export const fetchFinancialData = async (): Promise<FinancialData> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('financial_records').select('*');
    if (error) throw new Error(`Fetch financial data failed: ${error.message}`);

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
};

export const addFinancialRecord = async (type: string, record: any): Promise<FinancialData> => {
    if (!supabase) throwPersistenceError();
    const recordTypeMap: { [key: string]: RecordType } = {
        'fixed-cost': 'fixedCosts', 'variable-cost': 'variableCosts',
        'revenue': 'revenues', 'receivable': 'receivables',
    };
    const recordType = recordTypeMap[type];
    
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
    const { error } = await supabase!.from('financial_records').insert(dbRecord);
    if (error) throw new Error(`Add record failed: ${error.message}`);
    return fetchFinancialData();
};

export const deleteFinancialRecord = async (type: RecordType, id: number): Promise<FinancialData> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('financial_records').delete().eq('id', id);
    if (error) throw new Error(`Delete record failed: ${error.message}`);
    return fetchFinancialData();
};

export const markReceivableAsPaid = async (id: number): Promise<FinancialData> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('financial_records').update({ status: 'paid' }).eq('id', id);
    if (error) throw new Error(`Update status failed: ${error.message}`);
    return fetchFinancialData();
};

export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('calendar_events').select('*');
    if (error) throw new Error(`Fetch events failed: ${error.message}`);
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
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'status' | 'justification' | 'completionDate'>): Promise<CalendarEvent[]> => {
    if (!supabase) throwPersistenceError();
    const dbEvent = {
        description: event.description,
        value: event.value,
        due_date: event.dueDate,
        status: 'pending',
        reminder_minutes: event.reminderMinutes,
        color: event.color
    };
    const { error } = await supabase!.from('calendar_events').insert(dbEvent);
    if (error) throw new Error(`Add event failed: ${error.message}`);
    return fetchCalendarEvents();
};

export const completeCalendarEvent = async (id: number, justification: string): Promise<CalendarEvent[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('calendar_events').update({
        status: 'completed',
        justification: justification,
        completion_date: new Date().toISOString().split('T')[0]
    }).eq('id', id);
    if (error) throw new Error(`Complete event failed: ${error.message}`);
    return fetchCalendarEvents();
};

export const updateCalendarEvent = async (updatedEvent: CalendarEvent): Promise<CalendarEvent[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('calendar_events').update({
        description: updatedEvent.description,
        value: updatedEvent.value,
        due_date: updatedEvent.dueDate,
        status: updatedEvent.status,
        completion_date: updatedEvent.completionDate,
        reminder_minutes: updatedEvent.reminderMinutes,
        color: updatedEvent.color,
        justification: updatedEvent.justification
    }).eq('id', updatedEvent.id);
    if (error) throw new Error(`Update event failed: ${error.message}`);
    return fetchCalendarEvents();
};

export const fetchFreightAnalyses = async (): Promise<FreightAnalysis[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('freight_analyses').select('*');
    if (error) throw new Error(`Fetch analyses failed: ${error.message}`);
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
};

export const addFreightAnalysis = async (analysis: FreightAnalysis): Promise<FreightAnalysis[]> => {
    if (!supabase) throwPersistenceError();
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
    const { error } = await supabase!.from('freight_analyses').insert(dbAnalysis);
    if (error) throw new Error(`Add analysis failed: ${error.message}`);
    return fetchFreightAnalyses();
};

export const deleteFreightAnalysis = async (id: string): Promise<FreightAnalysis[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('freight_analyses').delete().eq('id', id);
    if (error) throw new Error(`Delete analysis failed: ${error.message}`);
    return fetchFreightAnalyses();
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('vehicles').select('*');
    if (error) throw new Error(`Fetch vehicles failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        plate: row.plate,
        model: row.model,
        year: row.year,
        driver: row.driver,
        status: row.status as any
    }));
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `VEH-${Date.now()}`;
    const dbVehicle = {
        id: newId,
        plate: vehicle.plate,
        model: vehicle.model,
        year: vehicle.year,
        driver: vehicle.driver,
        status: vehicle.status
    };
    const { error } = await supabase!.from('vehicles').insert(dbVehicle);
    if (error) throw new Error(`Add vehicle failed: ${error.message}`);
    return fetchVehicles();
};

export const updateVehicle = async (updatedVehicle: Vehicle): Promise<Vehicle[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('vehicles').update({
        plate: updatedVehicle.plate,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        driver: updatedVehicle.driver,
        status: updatedVehicle.status
    }).eq('id', updatedVehicle.id);
    if (error) throw new Error(`Update vehicle failed: ${error.message}`);
    return fetchVehicles();
};

export const deleteVehicle = async (id: string): Promise<Vehicle[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('vehicles').delete().eq('id', id);
    if (error) throw new Error(`Delete vehicle failed: ${error.message}`);
    return fetchVehicles();
};

export const fetchMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('maintenance_tasks').select('*');
    if (error) throw new Error(`Fetch maintenance tasks failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        vehicleId: row.vehicle_id,
        serviceType: row.service_type,
        date: row.date,
        cost: row.cost,
        notes: row.notes,
        status: row.status as any
    }));
};

export const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `MAINT-${Date.now()}`;
    const dbTask = {
        id: newId,
        vehicle_id: task.vehicleId,
        service_type: task.serviceType,
        date: task.date,
        cost: task.cost,
        notes: task.notes,
        status: task.status
    };
    const { error } = await supabase!.from('maintenance_tasks').insert(dbTask);
    if (error) throw new Error(`Add maintenance task failed: ${error.message}`);
    return fetchMaintenanceTasks();
};

export const updateMaintenanceTask = async (updatedTask: MaintenanceTask): Promise<MaintenanceTask[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('maintenance_tasks').update({
        vehicle_id: updatedTask.vehicleId,
        service_type: updatedTask.serviceType,
        date: updatedTask.date,
        cost: updatedTask.cost,
        notes: updatedTask.notes,
        status: updatedTask.status
    }).eq('id', updatedTask.id);
    if (error) throw new Error(`Update maintenance task failed: ${error.message}`);
    return fetchMaintenanceTasks();
};

export const deleteMaintenanceTask = async (id: string): Promise<MaintenanceTask[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('maintenance_tasks').delete().eq('id', id);
    if (error) throw new Error(`Delete maintenance task failed: ${error.message}`);
    return fetchMaintenanceTasks();
};

export const fetchNotes = async (): Promise<Note[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('notes').select('*');
    if (error) throw new Error(`Fetch notes failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        content: row.content,
        color: row.color as any,
        timestamp: row.timestamp,
        isLocked: row.is_locked
    }));
};

export const addNote = async (note: Omit<Note, 'id' | 'timestamp' | 'isLocked'>): Promise<Note[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `NOTE-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const dbNote = {
        id: newId,
        content: note.content,
        color: note.color,
        timestamp: timestamp,
        is_locked: false
    };
    const { error } = await supabase!.from('notes').insert(dbNote);
    if (error) throw new Error(`Add note failed: ${error.message}`);
    return fetchNotes();
};

export const updateNote = async (id: string, content: string): Promise<Note[]> => {
    if (!supabase) throwPersistenceError();
    const timestamp = new Date().toISOString();
    const { error } = await supabase!.from('notes').update({ content, timestamp }).eq('id', id);
    if (error) throw new Error(`Update note failed: ${error.message}`);
    return fetchNotes();
};

export const deleteNote = async (id: string): Promise<Note[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('notes').delete().eq('id', id);
    if (error) throw new Error(`Delete note failed: ${error.message}`);
    return fetchNotes();
};

export const toggleNoteLock = async (id: string): Promise<Note[]> => {
    if (!supabase) throwPersistenceError();
    const { data } = await supabase!.from('notes').select('is_locked').eq('id', id).single();
    if (data) {
        await supabase!.from('notes').update({ is_locked: !data.is_locked }).eq('id', id);
    }
    return fetchNotes();
};

export const fetchApprovalRequests = async (): Promise<ApprovalRequest[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('approval_requests').select('*');
    if (error) throw new Error(`Fetch approvals failed: ${error.message}`);
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
};

export const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id' | 'status'>): Promise<ApprovalRequest[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `APR-${Date.now()}`;
    const dbRequest = {
        id: newId,
        type: request.type,
        description: request.description,
        value: request.value,
        requester: request.requester,
        date: request.date,
        status: 'pending'
    };
    const { error } = await supabase!.from('approval_requests').insert(dbRequest);
    if (error) throw new Error(`Add approval failed: ${error.message}`);
    return fetchApprovalRequests();
};

export const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected', justification?: string): Promise<ApprovalRequest[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('approval_requests').update({ status, justification }).eq('id', id);
    if (error) throw new Error(`Update approval status failed: ${error.message}`);
    return fetchApprovalRequests();
};

export const fetchEcoSites = async (): Promise<EcoSite[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('eco_sites').select('*');
    if (error) throw new Error(`Fetch sites failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        title: row.title,
        url: row.url
    }));
};

export const addEcoSite = async (site: Omit<EcoSite, 'id'>): Promise<EcoSite[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `site-${Date.now()}`;
    const { error } = await supabase!.from('eco_sites').insert({ id: newId, title: site.title, url: site.url });
    if (error) throw new Error(`Add site failed: ${error.message}`);
    return fetchEcoSites();
};

export const deleteEcoSite = async (id: string): Promise<EcoSite[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('eco_sites').delete().eq('id', id);
    if (error) throw new Error(`Delete site failed: ${error.message}`);
    return fetchEcoSites();
};

export const fetchComplianceRecords = async (): Promise<ComplianceRecord[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('compliance_records').select('*');
    if (error) throw new Error(`Fetch compliance records failed: ${error.message}`);
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
};

export const addComplianceRecord = async (record: Omit<ComplianceRecord, 'id' | 'createdAt'>): Promise<ComplianceRecord[]> => {
    if (!supabase) throwPersistenceError();
    const newId = `COMP-${Date.now()}`;
    const createdAt = new Date().toISOString();
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
    const { error } = await supabase!.from('compliance_records').insert(dbRecord);
    if (error) throw new Error(`Add compliance record failed: ${error.message}`);
    return fetchComplianceRecords();
};

export const updateComplianceRecord = async (updatedRecord: ComplianceRecord): Promise<ComplianceRecord[]> => {
    if (!supabase) throwPersistenceError();
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
    const { error } = await supabase!.from('compliance_records').update(dbRecord).eq('id', updatedRecord.id);
    if (error) throw new Error(`Update compliance record failed: ${error.message}`);
    return fetchComplianceRecords();
};

export const deleteComplianceRecord = async (id: string): Promise<ComplianceRecord[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('compliance_records').delete().eq('id', id);
    if (error) throw new Error(`Delete compliance record failed: ${error.message}`);
    return fetchComplianceRecords();
};

export const fetchMobileMenus = async (): Promise<CustomMobileMenu[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('mobile_menus').select('*');
    if (error) throw new Error(`Fetch mobile menus failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        footerText: row.footer_text,
        items: row.items
    }));
};

export const saveMobileMenu = async (menu: CustomMobileMenu): Promise<CustomMobileMenu[]> => {
    if (!supabase) throwPersistenceError();
    const dbMenu = {
        id: menu.id,
        title: menu.title,
        subtitle: menu.subtitle,
        footer_text: menu.footerText,
        items: menu.items
    };
    const { error } = await supabase!.from('mobile_menus').upsert(dbMenu);
    if (error) throw new Error(`Save mobile menu failed: ${error.message}`);
    return fetchMobileMenus();
};

export const fetchDemands = async (): Promise<Demand[]> => {
    if (!supabase) throwPersistenceError();
    const { data, error } = await supabase!.from('demands').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Fetch demands failed: ${error.message}`);
    return data.map(row => ({
        id: row.id,
        client: row.client,
        service: row.service,
        status: row.status as any,
        date: row.date,
        contact: row.contact,
        setor: row.setor,
        urgencia: row.urgencia,
        prazo: row.prazo,
        responsavel: row.responsavel,
        emailAviso: row.email_aviso,
        celAviso: row.cel_aviso,
        photos: row.photos || [],
        attachments: row.attachments || [],
        comments: row.comments || []
    }));
};

export const addDemand = async (demand: Demand): Promise<Demand[]> => {
    if (!supabase) throwPersistenceError();
    const dbDemand = {
        id: demand.id,
        client: demand.client,
        service: demand.service,
        status: demand.status,
        date: demand.date,
        contact: demand.contact,
        setor: demand.setor,
        urgencia: demand.urgencia,
        prazo: demand.prazo,
        responsavel: demand.responsavel,
        email_aviso: demand.emailAviso,
        cel_aviso: demand.celAviso,
        photos: demand.photos,
        attachments: demand.attachments,
        comments: demand.comments,
        created_at: new Date().toISOString()
    };
    const { error } = await supabase!.from('demands').insert(dbDemand);
    if (error) throw new Error(`Add demand failed: ${error.message}`);
    return fetchDemands();
};

export const updateDemand = async (demand: Demand): Promise<Demand[]> => {
    if (!supabase) throwPersistenceError();
    const dbDemand = {
        client: demand.client,
        service: demand.service,
        status: demand.status,
        date: demand.date,
        contact: demand.contact,
        setor: demand.setor,
        urgencia: demand.urgencia,
        prazo: demand.prazo,
        responsavel: demand.responsavel,
        email_aviso: demand.emailAviso,
        cel_aviso: demand.celAviso,
        photos: demand.photos,
        attachments: demand.attachments,
        comments: demand.comments
    };
    const { error } = await supabase!.from('demands').update(dbDemand).eq('id', demand.id);
    if (error) throw new Error(`Update demand failed: ${error.message}`);
    return fetchDemands();
};

export const deleteDemand = async (id: string): Promise<Demand[]> => {
    if (!supabase) throwPersistenceError();
    const { error } = await supabase!.from('demands').delete().eq('id', id);
    if (error) throw new Error(`Delete demand failed: ${error.message}`);
    return fetchDemands();
};
