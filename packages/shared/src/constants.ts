// AFIP Constants
export const AFIP_TIPOS_COMPROBANTE = {
    FACTURA_A: '1',
    NOTA_DEBITO_A: '2',
    NOTA_CREDITO_A: '3',
    FACTURA_B: '6',
    NOTA_DEBITO_B: '7',
    NOTA_CREDITO_B: '8',
    FACTURA_C: '11',
    NOTA_DEBITO_C: '12',
    NOTA_CREDITO_C: '13'
} as const

export const AFIP_TIPOS_DOCUMENTO = {
    CUIT: '80',
    CUIL: '86',
    CDI: '87',
    LE: '89',
    LC: '90',
    CI_EXTRANJERA: '91',
    EN_TRAMITE: '92',
    ACTA_NACIMIENTO: '93',
    PASAPORTE: '94',
    DNI: '96',
    SIN_IDENTIFICAR: '99'
} as const

export const AFIP_CONDICIONES_IVA = {
    RESPONSABLE_INSCRIPTO: 1,
    MONOTRIBUTO: 6,
    EXENTO: 4,
    CONSUMIDOR_FINAL: 5
} as const

export const AFIP_ALICUOTAS_IVA = {
    NO_GRAVADO: 0,
    EXENTO: 0,
    IVA_0: 0,
    IVA_10_5: 10.5,
    IVA_21: 21,
    IVA_27: 27
} as const

export const AFIP_CONCEPTOS = {
    PRODUCTOS: 1,
    SERVICIOS: 2,
    PRODUCTOS_Y_SERVICIOS: 3
} as const

export const AFIP_MONEDAS = {
    PESOS: 'PES',
    DOLARES: 'DOL',
    EUROS: 'EUR',
    REALES: 'BRL'
} as const

// Argentine tax categories for AI classification
export const CATEGORIAS_AFIP = [
    'Ventas de bienes',
    'Prestación de servicios',
    'Honorarios profesionales',
    'Alquileres',
    'Intereses cobrados',
    'Dividendos',
    'Regalías',
    'Comisiones cobradas',
    'Compras de mercaderías',
    'Servicios contratados',
    'Gastos de oficina',
    'Gastos de publicidad',
    'Gastos de transporte',
    'Gastos de comunicación',
    'Gastos bancarios',
    'Impuestos y tasas',
    'Seguros',
    'Sueldos y cargas sociales',
    'Servicios públicos',
    'Mantenimiento y reparaciones',
    'Amortizaciones',
    'Otros ingresos',
    'Otros gastos',
    'Transferencias entre cuentas',
    'Retiros personales',
    'Aportes de capital'
] as const

// Monotributo categories (2024)
export const MONOTRIBUTO_CATEGORIAS = [
    { categoria: 'A', ingresosBrutosAnuales: 2108288.01, cuotaMensual: 6450 },
    { categoria: 'B', ingresosBrutosAnuales: 3133941.63, cuotaMensual: 7150 },
    { categoria: 'C', ingresosBrutosAnuales: 4387656.17, cuotaMensual: 8150 },
    { categoria: 'D', ingresosBrutosAnuales: 5449094.55, cuotaMensual: 10150 },
    { categoria: 'E', ingresosBrutosAnuales: 6416528.72, cuotaMensual: 14050 },
    { categoria: 'F', ingresosBrutosAnuales: 8020660.90, cuotaMensual: 17400 },
    { categoria: 'G', ingresosBrutosAnuales: 9624793.08, cuotaMensual: 22050 },
    { categoria: 'H', ingresosBrutosAnuales: 11916410.45, cuotaMensual: 38400 },
    { categoria: 'I', ingresosBrutosAnuales: 13337213.52, cuotaMensual: 53700 },
    { categoria: 'J', ingresosBrutosAnuales: 15285088.04, cuotaMensual: 67700 },
    { categoria: 'K', ingresosBrutosAnuales: 16957968.71, cuotaMensual: 77100 }
] as const

// IIBB Alicuotas by province (simplified)
export const IIBB_ALICUOTAS = {
    CABA: 3.0,
    BUENOS_AIRES: 3.5,
    CORDOBA: 3.0,
    SANTA_FE: 3.6,
    MENDOZA: 3.0,
    DEFAULT: 3.0
} as const

// MercadoPago operation types mapping
export const MP_OPERATION_TYPES = {
    regular_payment: 'income',
    money_transfer: 'transfer',
    recurring_payment: 'income',
    account_fund: 'transfer',
    payment_addition: 'income',
    cellphone_recharge: 'expense',
    pos_payment: 'income',
    money_express: 'transfer'
} as const

// Notification templates
export const NOTIFICATION_TEMPLATES = {
    invoice_pending: {
        title: 'Facturas pendientes',
        message: 'Tenés {count} facturas sin emitir por un total de {amount}'
    },
    afip_expiry: {
        title: 'Vencimiento AFIP',
        message: 'Tu certificado de AFIP vence en {days} días. Renovalo para evitar interrupciones.'
    },
    balance_summary: {
        title: 'Resumen del mes',
        message: 'Tu balance de {month}: Ingresos {income}, Gastos {expenses}, Resultado {balance}'
    },
    sync_error: {
        title: 'Error de sincronización',
        message: 'Hubo un error sincronizando tu cuenta de {provider}. Por favor verificá la conexión.'
    },
    declaration_ready: {
        title: 'Declaración lista',
        message: 'Tu borrador de {type} para {period} está listo para revisar.'
    }
} as const
