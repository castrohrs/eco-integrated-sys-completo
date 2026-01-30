-- =====================================================
-- EColog Enterprise - Schema Completo do Banco de Dados
-- =====================================================
-- Baseado em PostgreSQL com Supabase
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELAS PRINCIPAIS

-- Usuários e Autenticação
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    matricula VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'User')) DEFAULT 'User',
    sector VARCHAR(20) CHECK (sector IN ('OpsMind', 'FlowCapital', 'NeuroTech', 'IdeaForge')) DEFAULT 'OpsMind',
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes e Parceiros de Negócio
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    type VARCHAR(2) CHECK (type IN ('PJ', 'PF')) DEFAULT 'PJ',
    cnpj_cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(9),
    contact_name VARCHAR(255),
    status VARCHAR(10) CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos de Serviço
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) CHECK (order_type IN ('EXPRESS', 'COMUM', 'REFRIGERADO', 'PERIGOSO')) DEFAULT 'COMUM',
    service_description TEXT,
    weight_kg DECIMAL(10,2),
    volume_m3 DECIMAL(10,2),
    origin_address JSONB NOT NULL,
    destination_address JSONB NOT NULL,
    delivery_window_start TIMESTAMP WITH TIME ZONE,
    delivery_window_end TIMESTAMP WITH TIME ZONE,
    approved_tariff DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('RASCUNHO', 'EM_ANALISE', 'ORCADO', 'CONFIRMADO', 'ORDEM_COLETA_EMITIDA', 'AGENDADO', 'COLETADO', 'NO_TERMINAL', 'EM_TRANSITO', 'SAINDO_PARA_ENTREGA', 'ENTREGUE', 'FATURADO', 'FINALIZADO', 'CANCELADO')) DEFAULT 'RASCUNHO',
    priority VARCHAR(10) CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Urgente')) DEFAULT 'Média',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cotações
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    distance_km DECIMAL(10,2),
    base_price DECIMAL(10,2),
    additional_costs DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    validity_days INTEGER DEFAULT 7,
    status VARCHAR(20) CHECK (status IN ('Pendente', 'Aprovada', 'Rejeitada', 'Expirada')) DEFAULT 'Pendente',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(8) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    year INTEGER,
    type VARCHAR(20) CHECK (type IN ('Caminhão', 'Carreta', 'Van', 'Moto')) DEFAULT 'Caminhão',
    capacity_kg DECIMAL(10,2),
    capacity_m3 DECIMAL(10,2),
    driver_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('Operacional', 'Em Manutenção', 'Inativo')) DEFAULT 'Operacional',
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motoristas
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id),
    cnh_number VARCHAR(20) UNIQUE NOT NULL,
    cnh_category VARCHAR(10),
    cnh_expiration DATE,
    adr_license BOOLEAN DEFAULT false,
    adr_expiration DATE,
    status VARCHAR(20) CHECK (status IN ('Ativo', 'Inativo', 'Suspenso')) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coletas
CREATE TABLE pickups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    pickup_number VARCHAR(50) UNIQUE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    status VARCHAR(20) CHECK (status IN ('CRIADA', 'ATRIBUIDA', 'CARREGANDO', 'LIBERADA', 'EM_ROTA', 'CONCLUÍDA')) DEFAULT 'CRIADA',
    checkin_photos JSONB,
    checkin_signature TEXT,
    checkin_notes TEXT,
    checkin_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embarques/Remessas
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_id UUID NOT NULL REFERENCES pickups(id),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    tracking_code VARCHAR(50) UNIQUE,
    origin_terminal VARCHAR(100),
    destination_terminal VARCHAR(100),
    departure_at TIMESTAMP WITH TIME ZONE,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('PREPARANDO', 'EM_TRANSITO', 'ENTREGUE', 'PERDA_DANOS', 'RETIDO_FISCAL')) DEFAULT 'PREPARANDO',
    cte_number VARCHAR(50),
    cte_key VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos de Rastreamento
CREATE TABLE tracking_events (
    id BIGSERIAL PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed_kmh INTEGER,
    altitude_m INTEGER,
    event_type VARCHAR(20) CHECK (event_type IN ('GPS_FIX', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'SPEED_ALERT', 'STOP_START')) DEFAULT 'GPS_FIX',
    address TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prova de Entrega (POD)
CREATE TABLE proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) UNIQUE,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_document VARCHAR(20),
    signature_image_url TEXT,
    photos_urls JSONB,
    delivery_notes TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_by UUID REFERENCES drivers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELAS FINANCEIRAS

-- Registros Financeiros
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) CHECK (type IN ('fixedCosts', 'variableCosts', 'revenues', 'receivables')) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    value DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    client_id UUID REFERENCES customers(id),
    due_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
    attachment_url TEXT,
    observation TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faturas
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Emitida', 'Paga', 'Vencida', 'Cancelada')) DEFAULT 'Emitida',
    payment_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELAS OPERACIONAIS

-- Demandas e Serviços
CREATE TABLE demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('demandas', 'em_analise', 'aprovado', 'em_progresso', 'concluido', 'cancelado')) DEFAULT 'demandas',
    priority VARCHAR(10) CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Urgente')) DEFAULT 'Média',
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    sector VARCHAR(50),
    urgency VARCHAR(20),
    deadline DATE,
    assigned_to UUID REFERENCES users(id),
    date_start DATE,
    date_end DATE,
    time_start TIME,
    time_end TIME,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anexos das Demandas
CREATE TABLE demand_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_id UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários das Demandas
CREATE TABLE demand_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_id UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    mentions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas de Manutenção
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    cost DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('Agendada', 'Em Andamento', 'Concluída', 'Cancelada')) DEFAULT 'Agendada',
    mechanic VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELAS DE COMUNICAÇÃO E DOCUMENTOS

-- Notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'success', 'warning', 'danger')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Chat Interno
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Documentos do Sistema
CREATE TABLE system_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELAS DE CONFIGURAÇÃO E CONTROLE

-- Configurações da Empresa
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(9),
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_regime VARCHAR(50),
    default_tax_rate DECIMAL(5,2),
    system_currency VARCHAR(3) DEFAULT 'BRL',
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de Auditoria
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
CREATE INDEX idx_pickups_driver_status ON pickups(driver_id, status);
CREATE INDEX idx_pickups_scheduled_date ON pickups(scheduled_at);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_code);
CREATE INDEX idx_tracking_events_shipment_time ON tracking_events(shipment_id, recorded_at);
CREATE INDEX idx_financial_records_type_date ON financial_records(type, date);
CREATE INDEX idx_demands_status ON demands(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_chat_messages_users ON chat_messages(sender_id, receiver_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- 8. TRIGGERS E FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demands_updated_at BEFORE UPDATE ON demands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_documents_updated_at BEFORE UPDATE ON system_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ROW LEVEL SECURITY (RLS) PARA SUPABASE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar conforme necessidade)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');

CREATE POLICY "All authenticated users can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');

CREATE POLICY "All authenticated users can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');

-- 10. DADOS INICIAIS (Opcional)
INSERT INTO company_settings (company_name, system_currency) VALUES ('Ecolog Enterprise', 'BRL');

-- Criar usuário admin padrão (senha: admin123)
INSERT INTO users (name, email, phone, matricula, password_hash, role, sector) 
VALUES ('Administrador', 'admin@ecolog.com', '11999999999', 'ADMIN001', crypt('admin123', gen_salt('bf')), 'Admin', 'OpsMind');

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
