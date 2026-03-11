# Setup Vercel - Variabili d'Ambiente

## Problema
L'applicazione su Vercel richiede la variabile d'ambiente `DATABASE_URL` per connettersi al database PostgreSQL su Supabase.

## Soluzione

### 1. Vai al Dashboard Vercel
1. Accedi a [vercel.com](https://vercel.com)
2. Seleziona il progetto `primanota`
3. Vai su **Settings** → **Environment Variables**

### 2. Aggiungi la variabile DATABASE_URL

**Nome variabile:**
```
DATABASE_URL
```

**Valore:**
```
postgresql://postgres.exmpgaocttxqzpvpxsgy:%21Buui849200@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Ambienti:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Alternative: Connection String Supabase

Se preferisci usare la connection string diretta dal dashboard Supabase:

1. Vai al [Dashboard Supabase](https://supabase.com/dashboard)
2. Seleziona il progetto
3. Vai su **Settings** → **Database**
4. Copia la **Connection String** (URI) dalla sezione "Connection string"
5. Assicurati di selezionare:
   - **Type**: URI
   - **Source**: Primary Database
   - **Method**: Session Pooler (consigliato) o Direct connection

### 4. Formato della Connection String

La connection string deve essere nel formato:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Per Supabase con Session Pooler:
```
postgresql://postgres.[project-ref]:[password]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### 5. Dopo aver aggiunto la variabile

1. **Redeploy** l'applicazione:
   - Vai su **Deployments**
   - Clicca sui tre puntini (...) dell'ultimo deployment
   - Seleziona **Redeploy**

2. Oppure fai un nuovo commit e push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### 6. Verifica

Dopo il redeploy, verifica che l'applicazione funzioni:
- Visita `https://primanota-omipq9gi8-ciboandres-projects.vercel.app/movimenti`
- Dovrebbe caricare i movimenti senza errori 500

## Note Importanti

⚠️ **Sicurezza:**
- Non committare mai la connection string nel codice
- Usa sempre le variabili d'ambiente su Vercel
- La password nella connection string è già URL-encoded (`%21` = `!`)

🔒 **Password Encoding:**
Se la password contiene caratteri speciali, devono essere URL-encoded:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `[` → `%5B`
- `]` → `%5D`

## Troubleshooting

### Errore: "Environment variable not found: DATABASE_URL"
- Verifica che la variabile sia stata aggiunta correttamente
- Assicurati che sia abilitata per l'ambiente corretto (Production/Preview/Development)
- Fai un redeploy dopo aver aggiunto la variabile

### Errore: "Authentication failed"
- Verifica che la password sia corretta
- Controlla che la password sia URL-encoded correttamente
- Verifica che stai usando il Session Pooler se necessario

### Errore: "Can't reach database server"
- Verifica che il progetto Supabase sia attivo
- Controlla che la connection string usi il pooler corretto
- Verifica le impostazioni di rete/firewall su Supabase
