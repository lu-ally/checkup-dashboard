# 🚀 Production Deployment Guide

Dieses Dokument beschreibt den Deployment-Prozess für das Checkup Dashboard.

## 📋 Vorbereitung

### 1. Environment Variables
Kopiere `.env.example` zu `.env.production` und setze sichere Produktionswerte:

```bash
cp .env.example .env.production
```

**Kritische Werte (MUSS geändert werden):**
- `NEXTAUTH_SECRET`: Generiere einen sicheren Schlüssel
- `NEXTAUTH_URL`: Deine Produktions-Domain
- `DATABASE_URL`: Produktions-Datenbank URL

### 2. Build testen
```bash
npm run build
npm run lint
```

## 🌐 Deployment-Optionen

### Option 1: Vercel (Empfohlen für Next.js)

#### Voraussetzungen:
- Vercel Account
- PostgreSQL Datenbank (Vercel Postgres, Supabase, PlanetScale)

#### Schritte:
1. **Vercel CLI installieren:**
   ```bash
   npm install -g vercel
   ```

2. **Deployment starten:**
   ```bash
   npm run deploy:vercel
   ```

3. **Environment Variables in Vercel Dashboard setzen:**
   - `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - `NEXTAUTH_URL`: https://your-app.vercel.app
   - `DATABASE_URL`: PostgreSQL Connection String
   - Google Sheets API Credentials

4. **Datenbank Migration (bei PostgreSQL):**
   ```bash
   # Lokal: Migration von SQLite zu PostgreSQL
   DATABASE_URL="your-postgres-url" npm run migrate:postgres

   # Oder: Prisma Migration auf Vercel
   vercel env pull .env.vercel
   npx prisma migrate deploy
   ```

### Option 2: Railway/Render

#### Schritte:
1. **Repository zu Railway/Render verbinden**
2. **Environment Variables setzen** (siehe `.env.example`)
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`

### Option 3: Docker (VPS/Cloud)

#### Build Docker Image:
```bash
docker build -t checkup-dashboard .
```

#### Run Container:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  checkup-dashboard
```

## 🔒 Security Checklist

### Environment Variables
- [ ] `NEXTAUTH_SECRET` ist mindestens 32 Zeichen lang
- [ ] `NEXTAUTH_URL` zeigt auf korrekte Produktions-Domain
- [ ] Keine Development URLs in Production
- [ ] Google Sheets API Keys sind korrekt

### Database
- [ ] Produktions-Datenbank ist gesichert
- [ ] Backup-Strategie implementiert
- [ ] Connection Limits konfiguriert

### Application
- [ ] HTTPS ist erzwungen
- [ ] Error Monitoring aktiv (z.B. Sentry)
- [ ] Logging konfiguriert

## 🔄 Post-Deployment

### 1. Initiale Daten
```bash
# Admin-User erstellen
npm run seed
```

### 2. Funktions-Tests
- [ ] Login funktioniert
- [ ] User-Management (nur als Admin)
- [ ] Google Sheets Sync
- [ ] Chat-Link Funktionalität

### 3. Performance Monitoring
- [ ] Ladezeiten prüfen
- [ ] Database Performance
- [ ] API Response Times

## 🆘 Troubleshooting

### Build Errors
- Prüfe Node.js Version (empfohlen: 18+)
- Prüfe alle Environment Variables
- Checke Prisma Schema Syntax

### Database Connection Issues
- Vergewissere dich, dass DATABASE_URL korrekt ist
- Prüfe Netzwerk-Connectivität
- Teste Connection String lokal

### Authentication Problems
- `NEXTAUTH_SECRET` muss identisch in allen Instanzen sein
- `NEXTAUTH_URL` muss exakte Produktions-URL sein
- Prüfe NextAuth.js Konfiguration

## 📞 Support

Bei Problemen:
1. Prüfe Logs in der Deployment-Platform
2. Teste Build lokal mit `npm run build`
3. Vergleiche Environment Variables mit `.env.example`