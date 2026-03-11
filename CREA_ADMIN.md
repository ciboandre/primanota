# Creazione Utente Admin

## Credenziali Admin Predefinite

- **Email**: `admin@primanota.it`
- **Password**: `!Buui8492`

## Come Creare l'Admin

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
