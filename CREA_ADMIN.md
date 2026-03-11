# Creazione Utente Admin

## Credenziali Admin Predefinite

- **Email**: `admin@primanota.it`
- **Password**: `!Buui8492`

## Come Creare l'Admin

### ⚠️ IMPORTANTE: Disabilita la Conferma Email

Prima di creare l'admin, disabilita la conferma email su Supabase:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto
3. Vai su **Authentication** → **Settings**
4. Disabilita **"Enable email confirmations"**
5. Salva le modifiche

Questo evita errori di rate limit e permette l'accesso immediato.

### Metodo 1: Via API (Consigliato)

1. **Avvia il server** (se non è già in esecuzione):
```bash
npm run dev
```

2. **In un altro terminale, esegui**:
```bash
curl -X POST http://localhost:3000/api/users/create-admin
```

Oppure usa lo script:
```bash
bash scripts/create-admin.sh
```

**Nota**: Se ricevi un errore "email rate limit exceeded":
- Aspetta 5-10 minuti e riprova
- Oppure disabilita la conferma email come indicato sopra

### Metodo 2: Manualmente

1. Vai su `/auth/register`
2. Registrati con:
   - Email: `admin@primanota.it`
   - Password: `!Buui8492`
   - Nome: `Administrator`
3. Modifica il database per impostare il ruolo admin:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'admin@primanota.it';
```

Oppure usa Prisma Studio:
```bash
npx prisma studio
```

## Verifica

Dopo aver creato l'admin, puoi:

1. Accedere con le credenziali admin su `/auth/login`
2. Andare su `/impostazioni/utenti` per vedere la lista utenti
3. Gestire gli utenti del sistema

## Note

- L'endpoint `/api/users/create-admin` può essere chiamato più volte in sicurezza
- Se l'utente esiste già, verrà aggiornato a admin
- L'utente admin può gestire tutti gli altri utenti
