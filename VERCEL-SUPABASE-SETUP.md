# 🚀 Vercel + Supabase Deployment Guide

## 📋 Schritt-für-Schritt Anleitung

### 1. Supabase Database Connection String holen

1. **Gehe zu deinem Supabase Dashboard**
2. **Klicke auf "Settings" → "Database"**
3. **Kopiere die Connection String für "Transaction Mode":**
   ```
   postgres://postgres.[project-id]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

   ⚠️ **Wichtig**: Transaction Mode (Port 6543) für Vercel verwenden!

### 2. Vercel Environment Variables setzen

**Gehe zu deinem Vercel Dashboard → Settings → Environment Variables:**

| Variable | Wert | Notizen |
|----------|------|---------|
| `DATABASE_URL` | `postgres://postgres.[project-id]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres` | ⚠️ Aus Supabase Dashboard |
| `NEXTAUTH_SECRET` | `Ed0RcGZaIPsu4JWVcfYhp0mSk23CKESxFirciGX8K98=` | ✅ Bereits generiert |
| `NEXTAUTH_URL` | `https://checkup-dashboard.vercel.app` | ✅ Deine Vercel Domain |
| `GOOGLE_SHEETS_API_KEY` | (leer lassen für jetzt) | ❓ Optional später setzen |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `12_voZ1g70UpnneW4ecJvu1T0glC3z1eOdnwxI00s7PY` | ✅ Aus .env.production |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `checkup-dashboard-api-konto@checkup-dashboard.iam.gserviceaccount.com` | ✅ Aus .env.production |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n[KEY]` | ✅ Aus .env.production |

### 3. Database Setup auf Supabase

**Option A: Direkt in Supabase SQL Editor**
```sql
-- User Tabelle erstellen
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'COACH',
    "coachId" TEXT,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now()
);

-- Role Enum Type
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COACH');
ALTER TABLE "User" ALTER COLUMN role TYPE "Role" USING role::"Role";

-- Client Tabelle erstellen
CREATE TABLE "Client" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "clientId" TEXT UNIQUE NOT NULL,
    "clientName" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,
    status TEXT NOT NULL,
    "registrationDate" TIMESTAMP NOT NULL,
    weeks DECIMAL NOT NULL,
    "chatLink" TEXT NOT NULL,
    "wellbeingT0Basic" INTEGER,
    "wellbeingT4Basic" INTEGER,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now()
);

-- Assessment Tabelle erstellen
CREATE TABLE "Assessment" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "clientId" TEXT NOT NULL,
    timepoint TEXT NOT NULL,
    "submittedAt" TIMESTAMP NOT NULL,
    wellbeing INTEGER,
    stress TEXT,
    exhaustion TEXT,
    anxiety TEXT,
    depression TEXT,
    "selfDoubt" TEXT,
    "sleepProblems" TEXT,
    tension TEXT,
    irritability TEXT,
    "socialWithdrawal" TEXT,
    other TEXT,
    "workArea" INTEGER,
    "privateArea" INTEGER,
    "adequateSleep" TEXT,
    "healthyEating" TEXT,
    "sufficientRest" TEXT,
    exercise TEXT,
    "setBoundaries" TEXT,
    "timeForBeauty" TEXT,
    "shareEmotions" TEXT,
    "liveValues" TEXT,
    trust TEXT,
    "genuineInterest" TEXT,
    "mutualUnderstanding" TEXT,
    "goalAlignment" TEXT,
    "learningExperience" INTEGER,
    "progressAchievement" INTEGER,
    "generalSatisfaction" INTEGER,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now(),
    FOREIGN KEY ("clientId") REFERENCES "Client"("clientId")
);

-- Indexes erstellen
CREATE INDEX "Client_clientId_idx" ON "Client"("clientId");
CREATE INDEX "Client_coachName_idx" ON "Client"("coachName");
CREATE INDEX "Client_status_idx" ON "Client"("status");
CREATE INDEX "Assessment_clientId_idx" ON "Assessment"("clientId");
CREATE INDEX "Assessment_timepoint_idx" ON "Assessment"("timepoint");
CREATE INDEX "Assessment_submittedAt_idx" ON "Assessment"("submittedAt");
```

**Option B: Prisma Migration (Alternative)**
```bash
# Nach dem Deployment
npx prisma db push
```

### 4. Admin User erstellen

**In Supabase SQL Editor:**
```sql
-- Admin User einfügen (Passwort: admin123)
INSERT INTO "User" (email, password, name, role) VALUES (
    'admin@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrator',
    'ADMIN'
);

-- Coach User einfügen (Passwort: coach123)
INSERT INTO "User" (email, password, name, role) VALUES (
    'coach1@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Dr. Sarah Müller',
    'COACH'
);
```

### 5. Deployment

1. **Git Commit und Push:**
   ```bash
   git add .
   git commit -m "Configure for Vercel + Supabase deployment"
   git push
   ```

2. **Vercel deployt automatisch!**

### 6. Testen

1. **Gehe zu deiner Vercel URL**: https://checkup-dashboard.vercel.app
2. **Login testen**:
   - Email: `admin@example.com`
   - Passwort: `admin123`
3. **User Management testen** (als Admin)
4. **Google Sheets Sync testen** (später)

## 🔧 Troubleshooting

### Database Connection Fehler
- Prüfe dass `DATABASE_URL` korrekt in Vercel gesetzt ist
- Verwende Transaction Mode (Port 6543) für Vercel
- Stelle sicher, dass das Passwort kein Sonderzeichen-Escaping benötigt

### Build Fehler
- Prüfe alle Environment Variables in Vercel
- Stelle sicher, dass `NEXTAUTH_URL` auf deine Vercel Domain zeigt

### Authentication Probleme
- `NEXTAUTH_SECRET` muss identisch in allen Deployments sein
- `NEXTAUTH_URL` muss exakte Produktions-URL sein

## ✅ Fertig!

Nach erfolgreichem Deployment hast du:
- ✅ Funktionsfähiges Dashboard auf Vercel
- ✅ PostgreSQL Datenbank auf Supabase
- ✅ User Management System
- ✅ Sichere Authentifizierung
- ✅ Chat-Link Funktionalität