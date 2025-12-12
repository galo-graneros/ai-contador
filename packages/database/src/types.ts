export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'user' | 'contador' | 'auditor' | 'admin'
                    cuit: string | null
                    phone: string | null
                    organization_id: string | null
                    notification_preferences: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'contador' | 'auditor' | 'admin'
                    cuit?: string | null
                    phone?: string | null
                    organization_id?: string | null
                    notification_preferences?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'contador' | 'auditor' | 'admin'
                    cuit?: string | null
                    phone?: string | null
                    organization_id?: string | null
                    notification_preferences?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            organizations: {
                Row: {
                    id: string
                    name: string
                    cuit: string | null
                    owner_id: string
                    plan: 'free' | 'starter' | 'professional' | 'enterprise'
                    settings: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    cuit?: string | null
                    owner_id: string
                    plan?: 'free' | 'starter' | 'professional' | 'enterprise'
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    cuit?: string | null
                    owner_id?: string
                    plan?: 'free' | 'starter' | 'professional' | 'enterprise'
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            connections: {
                Row: {
                    id: string
                    user_id: string
                    provider: 'mercadopago' | 'afip' | 'banco'
                    status: 'active' | 'inactive' | 'error' | 'pending'
                    credentials_encrypted: string | null
                    access_token_encrypted: string | null
                    refresh_token_encrypted: string | null
                    token_expires_at: string | null
                    metadata: Json
                    last_sync_at: string | null
                    error_message: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    provider: 'mercadopago' | 'afip' | 'banco'
                    status?: 'active' | 'inactive' | 'error' | 'pending'
                    credentials_encrypted?: string | null
                    access_token_encrypted?: string | null
                    refresh_token_encrypted?: string | null
                    token_expires_at?: string | null
                    metadata?: Json
                    last_sync_at?: string | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    provider?: 'mercadopago' | 'afip' | 'banco'
                    status?: 'active' | 'inactive' | 'error' | 'pending'
                    credentials_encrypted?: string | null
                    access_token_encrypted?: string | null
                    refresh_token_encrypted?: string | null
                    token_expires_at?: string | null
                    metadata?: Json
                    last_sync_at?: string | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    connection_id: string
                    external_id: string
                    type: 'income' | 'expense' | 'transfer' | 'tax' | 'other'
                    amount: number
                    currency: string
                    description: string
                    counterparty: string | null
                    date: string
                    raw_data: Json
                    status: 'pending' | 'classified' | 'invoiced' | 'reconciled'
                    invoice_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    connection_id: string
                    external_id: string
                    type?: 'income' | 'expense' | 'transfer' | 'tax' | 'other'
                    amount: number
                    currency?: string
                    description: string
                    counterparty?: string | null
                    date: string
                    raw_data?: Json
                    status?: 'pending' | 'classified' | 'invoiced' | 'reconciled'
                    invoice_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    connection_id?: string
                    external_id?: string
                    type?: 'income' | 'expense' | 'transfer' | 'tax' | 'other'
                    amount?: number
                    currency?: string
                    description?: string
                    counterparty?: string | null
                    date?: string
                    raw_data?: Json
                    status?: 'pending' | 'classified' | 'invoiced' | 'reconciled'
                    invoice_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            ai_classifications: {
                Row: {
                    id: string
                    transaction_id: string
                    categoria_afip: string
                    tipo: 'ingreso' | 'gasto' | 'transferencia' | 'impuesto'
                    proveedor_cliente: string | null
                    descripcion_limpia: string
                    probabilidad: number
                    sugerencia_factura: boolean
                    notas: string | null
                    model_used: string
                    is_override: boolean
                    override_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    categoria_afip: string
                    tipo: 'ingreso' | 'gasto' | 'transferencia' | 'impuesto'
                    proveedor_cliente?: string | null
                    descripcion_limpia: string
                    probabilidad: number
                    sugerencia_factura?: boolean
                    notas?: string | null
                    model_used?: string
                    is_override?: boolean
                    override_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    categoria_afip?: string
                    tipo?: 'ingreso' | 'gasto' | 'transferencia' | 'impuesto'
                    proveedor_cliente?: string | null
                    descripcion_limpia?: string
                    probabilidad?: number
                    sugerencia_factura?: boolean
                    notas?: string | null
                    model_used?: string
                    is_override?: boolean
                    override_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    user_id: string
                    invoice_number: number
                    punto_venta: number
                    tipo_comprobante: string
                    cae: string | null
                    cae_vencimiento: string | null
                    fecha_emision: string
                    receptor_cuit: string | null
                    receptor_nombre: string
                    receptor_condicion_iva: string
                    importe_neto: number
                    importe_iva: number
                    importe_total: number
                    moneda: string
                    cotizacion: number
                    concepto: string
                    observaciones: string | null
                    pdf_url: string | null
                    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
                    afip_response: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    invoice_number?: number
                    punto_venta?: number
                    tipo_comprobante?: string
                    cae?: string | null
                    cae_vencimiento?: string | null
                    fecha_emision?: string
                    receptor_cuit?: string | null
                    receptor_nombre: string
                    receptor_condicion_iva?: string
                    importe_neto: number
                    importe_iva?: number
                    importe_total: number
                    moneda?: string
                    cotizacion?: number
                    concepto: string
                    observaciones?: string | null
                    pdf_url?: string | null
                    status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
                    afip_response?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    invoice_number?: number
                    punto_venta?: number
                    tipo_comprobante?: string
                    cae?: string | null
                    cae_vencimiento?: string | null
                    fecha_emision?: string
                    receptor_cuit?: string | null
                    receptor_nombre?: string
                    receptor_condicion_iva?: string
                    importe_neto?: number
                    importe_iva?: number
                    importe_total?: number
                    moneda?: string
                    cotizacion?: number
                    concepto?: string
                    observaciones?: string | null
                    pdf_url?: string | null
                    status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
                    afip_response?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    descripcion: string
                    cantidad: number
                    precio_unitario: number
                    alicuota_iva: number
                    subtotal: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    descripcion: string
                    cantidad?: number
                    precio_unitario: number
                    alicuota_iva?: number
                    subtotal: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    descripcion?: string
                    cantidad?: number
                    precio_unitario?: number
                    alicuota_iva?: number
                    subtotal?: number
                    created_at?: string
                }
            }
            declaration_drafts: {
                Row: {
                    id: string
                    user_id: string
                    periodo: string
                    tipo: 'iva_ventas' | 'iva_compras' | 'monotributo' | 'iibb' | 'ganancias'
                    base_imponible: number
                    impuesto_determinado: number
                    deducciones: number
                    saldo_a_pagar: number
                    detalles: Json
                    status: 'draft' | 'reviewed' | 'submitted'
                    notas: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    periodo: string
                    tipo: 'iva_ventas' | 'iva_compras' | 'monotributo' | 'iibb' | 'ganancias'
                    base_imponible?: number
                    impuesto_determinado?: number
                    deducciones?: number
                    saldo_a_pagar?: number
                    detalles?: Json
                    status?: 'draft' | 'reviewed' | 'submitted'
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    periodo?: string
                    tipo?: 'iva_ventas' | 'iva_compras' | 'monotributo' | 'iibb' | 'ganancias'
                    base_imponible?: number
                    impuesto_determinado?: number
                    deducciones?: number
                    saldo_a_pagar?: number
                    detalles?: Json
                    status?: 'draft' | 'reviewed' | 'submitted'
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: 'invoice_pending' | 'afip_expiry' | 'balance_summary' | 'sync_error' | 'declaration_ready'
                    channel: 'email' | 'whatsapp' | 'push' | 'in_app'
                    title: string
                    message: string
                    data: Json | null
                    status: 'pending' | 'sent' | 'failed' | 'read'
                    scheduled_for: string | null
                    sent_at: string | null
                    error_message: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'invoice_pending' | 'afip_expiry' | 'balance_summary' | 'sync_error' | 'declaration_ready'
                    channel?: 'email' | 'whatsapp' | 'push' | 'in_app'
                    title: string
                    message: string
                    data?: Json | null
                    status?: 'pending' | 'sent' | 'failed' | 'read'
                    scheduled_for?: string | null
                    sent_at?: string | null
                    error_message?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'invoice_pending' | 'afip_expiry' | 'balance_summary' | 'sync_error' | 'declaration_ready'
                    channel?: 'email' | 'whatsapp' | 'push' | 'in_app'
                    title?: string
                    message?: string
                    data?: Json | null
                    status?: 'pending' | 'sent' | 'failed' | 'read'
                    scheduled_for?: string | null
                    sent_at?: string | null
                    error_message?: string | null
                    created_at?: string
                }
            }
            job_logs: {
                Row: {
                    id: string
                    job_name: string
                    status: 'running' | 'completed' | 'failed'
                    started_at: string
                    completed_at: string | null
                    duration_ms: number | null
                    records_processed: number
                    errors: Json | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    job_name: string
                    status?: 'running' | 'completed' | 'failed'
                    started_at?: string
                    completed_at?: string | null
                    duration_ms?: number | null
                    records_processed?: number
                    errors?: Json | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    job_name?: string
                    status?: 'running' | 'completed' | 'failed'
                    started_at?: string
                    completed_at?: string | null
                    duration_ms?: number | null
                    records_processed?: number
                    errors?: Json | null
                    metadata?: Json | null
                }
            }
        }
        Views: {}
        Functions: {}
        Enums: {
            user_role: 'user' | 'contador' | 'auditor' | 'admin'
            connection_provider: 'mercadopago' | 'afip' | 'banco'
            connection_status: 'active' | 'inactive' | 'error' | 'pending'
            transaction_type: 'income' | 'expense' | 'transfer' | 'tax' | 'other'
            transaction_status: 'pending' | 'classified' | 'invoiced' | 'reconciled'
            classification_type: 'ingreso' | 'gasto' | 'transferencia' | 'impuesto'
            invoice_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
            declaration_type: 'iva_ventas' | 'iva_compras' | 'monotributo' | 'iibb' | 'ganancias'
            declaration_status: 'draft' | 'reviewed' | 'submitted'
            notification_type: 'invoice_pending' | 'afip_expiry' | 'balance_summary' | 'sync_error' | 'declaration_ready'
            notification_channel: 'email' | 'whatsapp' | 'push' | 'in_app'
            notification_status: 'pending' | 'sent' | 'failed' | 'read'
            job_status: 'running' | 'completed' | 'failed'
            organization_plan: 'free' | 'starter' | 'professional' | 'enterprise'
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
