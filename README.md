# Checkup Dashboard

Dashboard für psychologische Beratung mit Google Sheets Integration und rollenbasierter Zugriffskontrolle.

## Technologie-Stack

- **Next.js 15** mit App Router
- **TypeScript** für Type Safety
- **Prisma ORM** mit PostgreSQL/SQLite
- **NextAuth.js** für Authentifizierung
- **Tailwind CSS** für Styling
- **Chart.js** für Visualisierungen
- **Google Sheets API** für Daten-Synchronisation

## Sicherheit

⚠️ **Wichtig**: Dieses Projekt verarbeitet sensible Gesundheitsdaten. Bitte lies die [Sicherheitsdokumentation](SECURITY.md) sorgfältig durch.

Implementierte Sicherheitsmaßnahmen:
- ✅ JWT-basierte Authentifizierung mit NextAuth
- ✅ Rollenbasierte Zugriffskontrolle (ADMIN/COACH)
- ✅ Rate Limiting für Login und API-Endpunkte
- ✅ Input-Validierung mit Zod
- ✅ Security Headers (CSP, HSTS, etc.)
- ✅ Bcrypt Password Hashing
- ✅ Secure Session Cookies

Details: [SECURITY.md](SECURITY.md)

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Umgebungsvariablen einrichten

```bash
cp .env.example .env
```

Fülle die `.env` Datei mit deinen Werten. **Wichtig**: Generiere einen sicheren `NEXTAUTH_SECRET`:

```bash
npm run generate:secret
```

### 3. Datenbank einrichten

```bash
# Prisma Client generieren
npm run db:generate

# Datenbank Schema anwenden
npm run db:push

# Test-Daten einfügen (optional)
npm run seed
```

### 4. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

### 5. Login (nach Seeding)

**Admin-Account:**
- E-Mail: `admin@example.com`
- Passwort: `admin123`

**Coach-Account:**
- E-Mail: `coach1@example.com`
- Passwort: `coach123`

⚠️ **Wichtig**: Ändere diese Passwörter sofort in Production!

## Verfügbare Scripts

```bash
npm run dev           # Development Server
npm run build         # Production Build
npm start             # Production Server starten
npm run lint          # Code linting
npm run seed          # Test-Daten einfügen
npm run db:generate   # Prisma Client generieren
npm run db:push       # Schema zu Datenbank pushen
npm run generate:secret # NEXTAUTH_SECRET generieren
```

## Projekt-Struktur

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth Endpoints
│   │   ├── users/        # User Management
│   │   ├── client-data/  # Client Data API
│   │   └── sync-*/       # Google Sheets Sync
│   ├── dashboard/        # Dashboard Pages
│   │   ├── users/        # User Management UI
│   │   └── components/   # Dashboard Components
│   └── login/            # Login Page
├── lib/
│   ├── auth.ts           # NextAuth Konfiguration
│   ├── prisma.ts         # Prisma Client
│   ├── googleSheets.ts   # Google Sheets Service
│   ├── validation.ts     # Zod Schemas
│   ├── rate-limit.ts     # Rate Limiting
│   └── logger.ts         # Sicherer Logger
└── middleware.ts         # Route Protection

prisma/
└── schema.prisma         # Datenbank Schema
```

## Features

### Rollenbasierte Zugriffskontrolle

**ADMIN:**
- Voller Zugriff auf alle Funktionen
- User-Management (Erstellen, Bearbeiten, Löschen)
- Daten-Synchronisation mit Google Sheets
- Alle Client-Daten sehen

**COACH:**
- Nur eigene Client-Daten sehen
- Dashboard-Zugriff
- Keine Admin-Funktionen

### Google Sheets Integration

Das Dashboard synchronisiert Daten aus Google Sheets:
- **Auswertung Tab**: Client-Übersicht
- **T0 Tab**: Initiale Assessments
- **T4 Tab**: Follow-up Assessments

Siehe: [VERCEL-SUPABASE-SETUP.md](VERCEL-SUPABASE-SETUP.md) für Details.

## Deployment

### Vercel (Empfohlen)

1. Pushe Code zu GitHub
2. Importiere Projekt in Vercel
3. Setze Umgebungsvariablen
4. Deploy

Siehe: [DEPLOYMENT.md](DEPLOYMENT.md)

### Docker

```bash
docker build -t checkup-dashboard .
docker run -p 3000:3000 checkup-dashboard
```

## Weitere Dokumentation

- [SECURITY.md](SECURITY.md) - Sicherheitsrichtlinien
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment-Anleitung
- [VERCEL-SUPABASE-SETUP.md](VERCEL-SUPABASE-SETUP.md) - Vercel & Supabase Setup

## Lizenz

Proprietär - Alle Rechte vorbehalten

## Support

Bei Fragen oder Problemen, bitte erstelle ein Issue im Repository oder kontaktiere das Team direkt.
