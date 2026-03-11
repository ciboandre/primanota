# Setup Supabase CLI

## Prerequisiti

1. Supabase CLI installato (già fatto con `brew install supabase/tap/supabase`)
2. Account Supabase con progetto creato

## Passi per collegare il progetto

### 1. Login a Supabase

Esegui il login (richiede browser interattivo):
```bash
supabase login
```

Oppure usa un token:
```bash
export SUPABASE_ACCESS_TOKEN="your-access-token"
```

### 2. Collegare il progetto

```bash
supabase link --project-ref exmpgaocttxqzpvpxsgy
```

### 3. Creare una nuova migrazione

```bash
supabase migration new new-migration
```

Questo creerà un file in `supabase/migrations/` con timestamp.

### 4. Applicare le migrazioni

```bash
supabase db push
```

Questo applicherà tutte le migrazioni presenti in `supabase/migrations/` al database remoto.

## Struttura Migrazioni

Le migrazioni Supabase sono file SQL nella cartella `supabase/migrations/` con formato:
```
YYYYMMDDHHMMSS_migration_name.sql
```

## Note

- Le migrazioni Prisma sono in `prisma/migrations/`
- Le migrazioni Supabase sono in `supabase/migrations/`
- Entrambe possono coesistere, ma è consigliato usare uno dei due sistemi

## Comandi Utili

```bash
# Vedere lo stato delle migrazioni
supabase migration list

# Ripristinare il database locale
supabase db reset

# Generare types TypeScript dal database
supabase gen types typescript --local > types/supabase.ts
```
