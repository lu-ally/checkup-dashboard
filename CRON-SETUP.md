# ⏰ Automatische Tägliche Synchronisation

## Übersicht

Das Dashboard synchronisiert automatisch jeden Tag um **02:00 UTC** (03:00 MEZ / 04:00 MESZ) die Daten aus Google Sheets.

## Technische Details

### Vercel Cron Jobs

Die Synchronisation nutzt **Vercel Cron Jobs** - eine serverless Lösung für geplante Tasks.

**Konfiguration:** [vercel.json](vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Cron Schedule Syntax:**
- `0 2 * * *` = Täglich um 02:00 UTC
- `0 */6 * * *` = Alle 6 Stunden
- `0 0 * * 1` = Jeden Montag um Mitternacht
- [Crontab Generator](https://crontab.guru/)

### API Endpoint

**URL:** `/api/cron/sync`
**Methode:** `GET`
**Code:** [src/app/api/cron/sync/route.ts](src/app/api/cron/sync/route.ts)

### Ablauf

1. **Vercel Cron** ruft `/api/cron/sync` auf (täglich 02:00 UTC)
2. **Authorization Check** mit `CRON_SECRET`
3. **Daten abrufen** von Google Sheets (alle 3 Tabs)
4. **Alte Daten löschen** aus PostgreSQL
5. **Neue Daten einfügen** (Clients + Assessments)
6. **Response** mit Statistiken zurückgeben

## Setup in Vercel

### 1. Cron Secret generieren

```bash
openssl rand -base64 32
```

**Output Beispiel:**
```
zKb5COMk/jNnmBOAfAAi1I0hH5TczNYHeoMgW/qHmbc=
```

### 2. Environment Variable in Vercel setzen

1. Gehe zu **Vercel Dashboard** → Dein Projekt
2. Klicke auf **Settings** → **Environment Variables**
3. Füge hinzu:
   - **Key:** `CRON_SECRET`
   - **Value:** `zKb5COMk/jNnmBOAfAAi1I0hH5TczNYHeoMgW/qHmbc=` (dein generierter Wert)
   - **Environments:** Production ✅

4. **Redeploy** das Projekt (Vercel macht das automatisch bei neuem Commit)

### 3. Cron Job aktivieren

Nach dem Deployment:

1. Gehe zu **Vercel Dashboard** → Dein Projekt
2. Klicke auf **Cron Jobs** Tab
3. Du solltest sehen:
   ```
   /api/cron/sync
   Schedule: 0 2 * * *
   Status: Active ✅
   ```

## Manueller Test

### Option 1: Lokal testen (ohne Auth)

```bash
# Development (kein CRON_SECRET benötigt)
curl http://localhost:3000/api/cron/sync
```

### Option 2: Production testen

```bash
# Mit deinem CRON_SECRET
curl -H "Authorization: Bearer zKb5COMk/jNnmBOAfAAi1I0hH5TczNYHeoMgW/qHmbc=" \
  https://checkup-dashboard.vercel.app/api/cron/sync
```

**Erwartete Response:**
```json
{
  "success": true,
  "message": "Scheduled sync completed",
  "stats": {
    "clientsCreated": 42,
    "assessmentsCreated": 68,
    "totalClients": 42,
    "duration": "1234ms"
  },
  "timestamp": "2025-10-15T02:00:00.000Z"
}
```

## Monitoring

### Vercel Logs anschauen

1. Gehe zu **Vercel Dashboard** → Dein Projekt
2. Klicke auf **Logs** Tab
3. Filtere nach `/api/cron/sync`

**Erfolgreiche Ausführung:**
```
🕐 Starting scheduled sync job...
✅ Fetched 42 clients from Google Sheets
🗑️  Cleared existing data
✅ Sync completed in 1234ms
   Clients: 42
   Assessments: 68
```

**Fehlerhafte Ausführung:**
```
❌ Scheduled sync error: Failed to fetch from Google Sheets
```

### Monitoring Setup (Optional)

Für Production empfohlen:

1. **Vercel Monitoring** aktivieren (kostenpflichtig)
2. **External Monitoring:**
   - [UptimeRobot](https://uptimerobot.com/) - kostenlos
   - [Cronitor](https://cronitor.io/) - spezialisiert auf Cron Monitoring
   - [Better Stack](https://betterstack.com/) - umfassendes Monitoring

## Troubleshooting

### Cron Job läuft nicht

**Problem:** Keine Ausführung sichtbar in Logs

**Lösungen:**
1. ✅ Prüfe dass `vercel.json` committed und deployed ist
2. ✅ Prüfe dass Cron in Vercel Dashboard aktiv ist
3. ✅ Warte mindestens bis zur nächsten geplanten Zeit
4. ⚠️ **Wichtig:** Vercel Cron läuft nur auf **Production**, nicht auf Previews!

### 401 Unauthorized

**Problem:** Cron Job schlägt mit 401 fehl

**Lösungen:**
1. ✅ Prüfe dass `CRON_SECRET` in Vercel gesetzt ist
2. ✅ Prüfe dass Secret kein Leerzeichen am Anfang/Ende hat
3. ✅ Generiere ein neues Secret und setze es erneut

### 500 Internal Server Error

**Problem:** Sync schlägt fehl

**Mögliche Ursachen:**
1. ❌ Google Sheets API Fehler
   - Prüfe `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Prüfe `GOOGLE_PRIVATE_KEY`
   - Prüfe Sheet-Berechtigungen

2. ❌ Datenbank Fehler
   - Prüfe `DATABASE_URL`
   - Prüfe Supabase Connection Pool Limits

3. ❌ Timeout (Vercel Free: 10s Limit)
   - Reduziere Datenvolumen
   - Upgrade auf Pro Plan

### Rate Limiting

**Problem:** Zu viele Google API Anfragen

**Lösung:**
- Google Sheets API Free Tier: 100 requests/100 seconds
- Wenn mehr benötigt: Billing in Google Cloud Console aktivieren

## Schedule Anpassen

### Andere Zeiten

Bearbeite [vercel.json](vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 6 * * *"  // 06:00 UTC = 07:00 MEZ
    }
  ]
}
```

### Mehrmals täglich

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */6 * * *"  // Alle 6 Stunden
    }
  ]
}
```

### Nur Werktage

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 2 * * 1-5"  // Mo-Fr um 02:00 UTC
    }
  ]
}
```

Nach Änderungen:
1. Committe `vercel.json`
2. Push zu GitHub
3. Vercel deployed automatisch
4. Neuer Schedule aktiv nach Deployment

## Vercel Cron Limits

### Free Plan
- ✅ Cron Jobs erlaubt
- ⚠️ 10 Sekunden Timeout
- ⚠️ 100 Ausführungen pro Tag

### Pro Plan
- ✅ 60 Sekunden Timeout
- ✅ Unbegrenzte Ausführungen
- ✅ Erweiterte Monitoring-Features

## Alternative: Manueller Sync

Wenn Cron nicht funktioniert, können ADMINs manuell synchronisieren:

1. Login im Dashboard
2. Button "Daten synchronisieren" klicken
3. Wartet auf Bestätigung

**Endpoint:** `/api/sync-detailed-data` (POST, mit Authentication)

## Support & Logs

- **Vercel Logs:** Dashboard → Logs Tab
- **Vercel Status:** [vercel-status.com](https://www.vercel-status.com/)
- **Cron Documentation:** [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)

---

**Letzte Aktualisierung:** 2025-10-15
**Version:** 1.0.0
