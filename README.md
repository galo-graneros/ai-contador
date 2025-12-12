# AI Contador Autónomo

> 🤖 Tu asistente contable inteligente para pymes y monotributistas en Argentina

![AI Contador](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange?style=for-the-badge&logo=supabase)

## 🚀 Features

- **📊 Dashboard Inteligente**: Visualiza ingresos, gastos y balance en tiempo real
- **💳 Sincronización MercadoPago**: Conecta tu cuenta y sincroniza movimientos automáticamente
- **🏛️ Facturación AFIP**: Emite Facturas C electrónicas con CAE al instante
- **🤖 Clasificación con IA**: GPT-4 clasifica tus movimientos según categorías AFIP
- **📋 Declaraciones Automáticas**: Borradores de IVA, Monotributo e IIBB
- **🔔 Notificaciones**: Alertas por email y WhatsApp

## 📁 Estructura del Proyecto

```
ai-contador/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/
│   │   │   └── lib/      # Utilities
│   │   └── package.json
│   └── api/              # Express backend
│       ├── src/
│       │   ├── routes/   # API endpoints
│       │   ├── services/ # Business logic
│       │   └── lib/      # Utilities
│       └── package.json
├── packages/
│   ├── database/         # Supabase types & migrations
│   └── shared/           # Shared utilities
├── .github/workflows/    # GitHub Actions
├── turbo.json           # Turborepo config
└── package.json         # Root package
```

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Cuenta de Supabase
- Credenciales de MercadoPago (opcional)
- Certificados AFIP (opcional)
- API Key de OpenAI

### Installation

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ai-contador
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

4. **Configurar Supabase**
   - Crear proyecto en [Supabase](https://supabase.com)
   - Ejecutar el SQL de `packages/database/migrations/001_initial_schema.sql`
   - Copiar las credenciales al `.env`

5. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 🔧 Configuración de Servicios

### MercadoPago

1. Crear app en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Configurar OAuth Redirect URI: `http://localhost:3001/api/webhooks/mercadopago/callback`
3. Agregar credenciales al `.env`

### AFIP

1. Obtener certificado de homologación en [AFIP](https://www.afip.gob.ar) 
2. Generar par de claves y CSR
3. Descargar certificado firmado
4. Subir certificado y clave privada en la app

### OpenAI

1. Obtener API Key en [OpenAI](https://platform.openai.com)
2. Agregar al `.env`

## 📝 Scripts

```bash
# Desarrollo
npm run dev          # Inicia frontend y backend
npm run dev:web      # Solo frontend
npm run dev:api      # Solo backend

# Build
npm run build        # Build de producción

# Base de datos
npm run db:generate  # Genera tipos TypeScript
```

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Express API    │
│   (Vercel)      │     │  (Railway)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────────┤
         │    │                  │
         ▼    ▼                  ▼
    ┌─────────────┐    ┌─────────────────┐
    │  Supabase   │    │  External APIs  │
    │  - Auth     │    │  - MercadoPago  │
    │  - Database │    │  - AFIP WSFE    │
    │  - Storage  │    │  - OpenAI       │
    └─────────────┘    └─────────────────┘
```

## 📄 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard data |
| `/api/connections` | GET/POST | Manage connections |
| `/api/transactions` | GET | List transactions |
| `/api/ai/classify/:id` | POST | Classify transaction |
| `/api/invoices` | GET/POST | Manage invoices |
| `/api/declarations` | GET/POST | Tax declarations |

## 🔐 Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Credenciales encriptadas con AES-256
- HTTPS obligatorio en producción

## 📦 Deployment

### Frontend (Vercel)

```bash
# Conectar repo a Vercel
vercel link

# Deploy
vercel --prod
```

### Backend (Railway/Render)

1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🤝 Contributing

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📜 License

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

Built with ❤️ for Argentine entrepreneurs
