-- AI Contador Autónomo - Database Schema
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('user', 'contador', 'auditor', 'admin');
CREATE TYPE connection_provider AS ENUM ('mercadopago', 'afip', 'banco');
CREATE TYPE connection_status AS ENUM ('active', 'inactive', 'error', 'pending');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'tax', 'other');
CREATE TYPE transaction_status AS ENUM ('pending', 'classified', 'invoiced', 'reconciled');
CREATE TYPE classification_type AS ENUM ('ingreso', 'gasto', 'transferencia', 'impuesto');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE declaration_type AS ENUM ('iva_ventas', 'iva_compras', 'monotributo', 'iibb', 'ganancias');
CREATE TYPE declaration_status AS ENUM ('draft', 'reviewed', 'submitted');
CREATE TYPE notification_type AS ENUM ('invoice_pending', 'afip_expiry', 'balance_summary', 'sync_error', 'declaration_ready');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE job_status AS ENUM ('running', 'completed', 'failed');
CREATE TYPE organization_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cuit VARCHAR(13),
    owner_id UUID NOT NULL,
    plan organization_plan DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    cuit VARCHAR(13),
    phone VARCHAR(20),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false, "push": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for organizations.owner_id after users table exists
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_owner 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Connections table (MercadoPago, AFIP credentials)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider connection_provider NOT NULL,
    status connection_status DEFAULT 'pending',
    credentials_encrypted TEXT, -- For AFIP certificates
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}', -- Store CUIT, punto_venta, etc.
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Transactions table (MercadoPago movements)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL, -- MercadoPago transaction ID
    type transaction_type DEFAULT 'other',
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    description TEXT NOT NULL,
    counterparty VARCHAR(255),
    date TIMESTAMPTZ NOT NULL,
    raw_data JSONB DEFAULT '{}',
    status transaction_status DEFAULT 'pending',
    invoice_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(connection_id, external_id)
);

-- AI Classifications table
CREATE TABLE ai_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE UNIQUE,
    categoria_afip VARCHAR(100) NOT NULL,
    tipo classification_type NOT NULL,
    proveedor_cliente VARCHAR(255),
    descripcion_limpia TEXT NOT NULL,
    probabilidad DECIMAL(3, 2) NOT NULL CHECK (probabilidad >= 0 AND probabilidad <= 1),
    sugerencia_factura BOOLEAN DEFAULT false,
    notas TEXT,
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    is_override BOOLEAN DEFAULT false,
    override_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table (AFIP facturas)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number INTEGER NOT NULL,
    punto_venta INTEGER DEFAULT 1,
    tipo_comprobante VARCHAR(10) DEFAULT '11', -- 11 = Factura C
    cae VARCHAR(20),
    cae_vencimiento DATE,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    receptor_cuit VARCHAR(13),
    receptor_nombre VARCHAR(255) NOT NULL,
    receptor_condicion_iva VARCHAR(50) DEFAULT 'Consumidor Final',
    importe_neto DECIMAL(15, 2) NOT NULL,
    importe_iva DECIMAL(15, 2) DEFAULT 0,
    importe_total DECIMAL(15, 2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PES',
    cotizacion DECIMAL(10, 4) DEFAULT 1,
    concepto TEXT NOT NULL,
    observaciones TEXT,
    pdf_url TEXT,
    status invoice_status DEFAULT 'draft',
    afip_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, punto_venta, invoice_number)
);

-- Invoice Items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1,
    precio_unitario DECIMAL(15, 2) NOT NULL,
    alicuota_iva DECIMAL(5, 2) DEFAULT 0, -- 0 for Factura C
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for transactions.invoice_id
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_invoice 
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Declaration Drafts table
CREATE TABLE declaration_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    periodo VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    tipo declaration_type NOT NULL,
    base_imponible DECIMAL(15, 2) DEFAULT 0,
    impuesto_determinado DECIMAL(15, 2) DEFAULT 0,
    deducciones DECIMAL(15, 2) DEFAULT 0,
    saldo_a_pagar DECIMAL(15, 2) DEFAULT 0,
    detalles JSONB DEFAULT '{}',
    status declaration_status DEFAULT 'draft',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, periodo, tipo)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    channel notification_channel DEFAULT 'in_app',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    status notification_status DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Logs table
CREATE TABLE job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name VARCHAR(100) NOT NULL,
    status job_status DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    records_processed INTEGER DEFAULT 0,
    errors JSONB,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_provider ON connections(provider);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_classifications_transaction ON ai_classifications(transaction_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_fecha ON invoices(fecha_emision);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_declarations_user_periodo ON declaration_drafts(user_id, periodo);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_job_logs_name ON job_logs(job_name);
CREATE INDEX idx_job_logs_started ON job_logs(started_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classifications_updated_at BEFORE UPDATE ON ai_classifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_declarations_updated_at BEFORE UPDATE ON declaration_drafts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaration_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own connections
CREATE POLICY "Users can manage own connections" ON connections FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Users can view classifications of their transactions
CREATE POLICY "Users can view own classifications" ON ai_classifications FOR SELECT 
    USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND t.user_id = auth.uid()));

-- Users can manage their own invoices
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- Users can view items of their invoices
CREATE POLICY "Users can view own invoice items" ON invoice_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND i.user_id = auth.uid()));

-- Users can manage their own declarations
CREATE POLICY "Users can manage own declarations" ON declaration_drafts FOR ALL USING (auth.uid() = user_id);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
