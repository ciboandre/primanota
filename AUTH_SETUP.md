# Setup Autenticazione con Supabase Auth

## Prerequisiti

1. Progetto Supabase configurato
2. Database PostgreSQL su Supabase

## Configurazione

### 1. Abilita Authentication su Supabase

1. Vai al [Dashboard Supabase](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Authentication** → **Providers**
4. Abilita **Email** provider (già abilitato di default)

### 2. Configura le variabili d'ambiente

Aggiungi queste variabili nel file `.env` locale e su Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://exmpgaocttxqzpvpxsgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Come ottenere le chiavi:**

1. Vai su Supabase Dashboard → **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Applica le migrazioni del database

```bash
# Genera il client Prisma con il nuovo modello User
npx prisma generate

# Crea e applica la migrazione
npx prisma migrate dev --name add_user_model

# Oppure su Supabase
supabase db push
```

### 4. Configura le email (opzionale)

Per inviare email di conferma:

1. Vai su **Authentication** → **Email Templates**
2. Personalizza i template se necessario
3. Per sviluppo locale, usa Inbucket (già configurato in `supabase/config.toml`)

## Funzionalità Implementate

### Pagine di Autenticazione

- `/auth/login` - Pagina di login
- `/auth/register` - Pagina di registrazione

### API Endpoints

- `GET /api/users` - Lista utenti (solo admin)
- `POST /api/users` - Crea nuovo utente

### Middleware

- Protezione automatica delle route
- Redirect a `/auth/login` se non autenticato
- Redirect a `/dashboard` se già autenticato

## Utilizzo

### Registrazione

1. Vai su `/auth/register`
2. Compila il form con nome, email e password
3. Clicca su "Registrati"
4. Verrai reindirizzato al login

### Login

1. Vai su `/auth/login`
2. Inserisci email e password
3. Clicca su "Accedi"
4. Verrai reindirizzato alla dashboard

### Logout

Il logout può essere implementato aggiungendo un pulsante che chiama:

```typescript
const supabase = createClient()
await supabase.auth.signOut()
router.push('/auth/login')
```

## Gestione Utenti

### Creare un Admin

Per creare il primo utente admin, puoi:

1. Registrarti normalmente
2. Modificare manualmente il database:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'tuo@email.com';
```

Oppure creare un endpoint API per promuovere utenti (solo per admin esistenti).

## Sicurezza

- Le password sono hashate da Supabase Auth
- Le sessioni sono gestite tramite cookie HTTP-only
- Il middleware protegge automaticamente tutte le route
- Solo gli admin possono vedere la lista utenti

## Note

- Le email di conferma sono opzionali (configurabili su Supabase)
- Per sviluppo locale, le email vanno in Inbucket su `http://localhost:54324`
- Il modello User è collegato alle Transaction per multi-utente futuro
