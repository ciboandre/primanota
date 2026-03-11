# Prima Nota - Sistema di Gestione Contabilità

Applicazione web per la gestione della prima nota e del conto economico.

## Caratteristiche

- 📊 **Dashboard** - Panoramica generale della situazione finanziaria
- 💰 **Movimenti** - Gestione e monitoraggio delle transazioni finanziarie
- 📈 **Conto Economico** - Analisi dettagliata della performance finanziaria
- 📋 **Bilancio** - Visualizzazione del bilancio patrimoniale (in sviluppo)
- ⚙️ **Impostazioni** - Configurazione dell'applicazione

## Tecnologie Utilizzate

- **Next.js 14** - Framework React per applicazioni web
- **TypeScript** - Tipizzazione statica
- **Prisma** - ORM per la gestione del database
- **PostgreSQL** - Database (Supabase)
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Libreria per grafici
- **Lucide React** - Icone moderne
- **date-fns** - Gestione date
- **Vercel Edge Config** - Configurazione edge

## Installazione

1. Installa le dipendenze:
```bash
npm install
```

2. Configura il database PostgreSQL:
```bash
# Crea il database (se non esiste)
createdb primanota

# Configura la variabile d'ambiente nel file .env
# DATABASE_URL="postgresql://user:password@localhost:5432/primanota?schema=public"

# Genera il client Prisma
npm run prisma:generate

# Crea le migrazioni e inizializza il database
npx prisma migrate dev --name init
```

3. Configura Vercel Edge Config (opzionale):
```bash
# Pull delle variabili d'ambiente da Vercel
vercel env pull

# Installa il pacchetto (già incluso)
npm install @vercel/edge-config
```

4. Popola il database con dati di esempio (opzionale):
```bash
# Avvia il server prima
npm run dev

# In un altro terminale, popola il database
curl -X POST http://localhost:3000/api/seed
```

5. Avvia il server di sviluppo:
```bash
npm run dev
```

6. Apri [http://localhost:3000](http://localhost:3000) nel browser

## Database

L'applicazione utilizza **PostgreSQL** come database.

### Configurazione Database

1. Crea un database PostgreSQL:
```bash
createdb primanota
```

2. Configura la variabile d'ambiente nel file `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/primanota?schema=public"
```

3. Esegui le migrazioni:
```bash
npx prisma migrate dev --name init
```

### Struttura Database

- **Transaction** - Transazioni finanziarie (entrate/uscite)
- **Category** - Categorie per le transazioni
- **Account** - Conti bancari e contanti

### Comandi Database

- `npm run prisma:generate` - Genera il client Prisma
- `npm run prisma:migrate` - Crea una nuova migrazione
- `npm run prisma:studio` - Apre Prisma Studio per visualizzare/modificare i dati
- `npx prisma migrate deploy` - Applica le migrazioni in produzione

## Vercel Edge Config

L'applicazione supporta Vercel Edge Config per configurazioni dinamiche.

### Setup

1. Crea un Edge Config Store su Vercel
2. Aggiungi le variabili d'ambiente:
   - `EDGE_CONFIG` - Token di accesso
3. Pull delle variabili:
```bash
vercel env pull
```

### Utilizzo

Il middleware è configurato per rispondere a `/welcome` con il valore di `greeting` da Edge Config.

Esempio di utilizzo nel codice:
```typescript
import { getEdgeConfig } from '@/lib/edgeConfig'

const greeting = await getEdgeConfig('greeting')
```

## Struttura del Progetto

```
progetto/
├── app/                    # Pagine Next.js
│   ├── api/                # API Routes
│   │   ├── transactions/   # CRUD transazioni
│   │   ├── categories/     # Gestione categorie
│   │   ├── accounts/       # Gestione conti
│   │   ├── stats/          # Statistiche finanziarie
│   │   ├── dashboard/      # Statistiche dashboard
│   │   ├── export/         # Esportazione dati
│   │   └── seed/           # Popolamento database
│   ├── dashboard/          # Dashboard principale
│   ├── movimenti/          # Gestione movimenti
│   ├── conto-economico/    # Conto economico
│   ├── bilancio/           # Bilancio
│   └── impostazioni/        # Impostazioni
├── components/             # Componenti riutilizzabili
│   ├── Layout.tsx          # Layout principale con navigazione
│   ├── MetricCard.tsx      # Card per metriche
│   ├── ProgressBar.tsx     # Barra di progresso
│   ├── TransactionForm.tsx # Form per transazioni
│   ├── AdvancedFilters.tsx # Filtri avanzati
│   └── ExportPDF.tsx       # Esportazione PDF
├── lib/                    # Utilities
│   ├── prisma.ts           # Client Prisma
│   ├── edgeConfig.ts       # Edge Config utilities
│   ├── mockData.ts         # Dati di esempio (deprecato)
│   └── utils.ts            # Funzioni di utilità
├── prisma/                 # Configurazione Prisma
│   ├── schema.prisma       # Schema database
│   └── migrations/         # Migrazioni database
├── middleware.js           # Next.js middleware per Edge Config
└── types/                  # Definizioni TypeScript
    └── index.ts            # Tipi e interfacce
```

## Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione (include generazione Prisma)
- `npm start` - Avvia il server di produzione
- `npm run lint` - Esegue il linter
- `npm run prisma:generate` - Genera il client Prisma
- `npm run prisma:migrate` - Crea una nuova migrazione
- `npm run prisma:studio` - Apre Prisma Studio

## Funzionalità Implementate

✅ **Gestione Movimenti**
- Creazione, modifica ed eliminazione transazioni
- Filtri per data, categoria e conto
- Ricerca case-insensitive
- Calcolo automatico di entrate/uscite
- Aggiornamento automatico dei saldi dei conti

✅ **Conto Economico**
- Calcolo automatico di ricavi, costi e utile netto
- Dettaglio ricavi e costi per categoria
- Grafico dell'andamento degli ultimi 6 mesi
- Filtri per periodo (Mensile, Trimestrale, Annuale)
- Esportazione PDF

✅ **Dashboard**
- Statistiche in tempo reale dal database
- Variazioni percentuali rispetto al mese precedente
- Statistiche rapide (movimenti, categorie, conti, fatture)

✅ **Database**
- Schema completo con relazioni
- Migrazioni automatiche
- API RESTful per tutte le operazioni
- Popolamento iniziale con dati di esempio

✅ **Esportazione**
- Esportazione CSV dei movimenti
- Esportazione PDF del conto economico
- Rispetta i filtri applicati

✅ **Ricerca e Filtri**
- Ricerca globale nella barra header
- Filtri avanzati (data, categoria, conto, stato, importo)
- Ricerca case-insensitive con PostgreSQL

## Licenza

© 2023 Prima Nota Accounting. Tutti i diritti riservati.
