# Prima Nota - Sistema di Gestione Contabilità

Applicazione web per la gestione della prima nota e del conto economico.

## Caratteristiche

- 📊 **Dashboard** - Panoramica generale della situazione finanziaria
- 💰 **Movimenti** - Gestione e monitoraggio delle transazioni finanziarie
- 📈 **Conto Economico** - Analisi dettagliata della performance finanziaria
- 📋 **Bilancio** - Visualizzazione del bilancio patrimoniale (in sviluppo)
- ⚙️ **Impostazioni** - Configurazione dell'applicazione (in sviluppo)

## Tecnologie Utilizzate

- **Next.js 14** - Framework React per applicazioni web
- **TypeScript** - Tipizzazione statica
- **Prisma** - ORM per la gestione del database
- **SQLite** - Database (facilmente migrabile a PostgreSQL)
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Libreria per grafici
- **Lucide React** - Icone moderne
- **date-fns** - Gestione date

## Installazione

1. Installa le dipendenze:
```bash
npm install
```

2. Configura il database:
```bash
# Genera il client Prisma
npm run prisma:generate

# Crea le migrazioni e inizializza il database
npx prisma migrate dev --name init
```

3. Popola il database con dati di esempio (opzionale):
```bash
# Avvia il server prima
npm run dev

# In un altro terminale, popola il database
curl -X POST http://localhost:3000/api/seed
```

4. Avvia il server di sviluppo:
```bash
npm run dev
```

5. Apri [http://localhost:3000](http://localhost:3000) nel browser

## Database

L'applicazione utilizza **SQLite** per lo sviluppo locale. Il database si trova in `prisma/dev.db`.

### Struttura Database

- **Transaction** - Transazioni finanziarie (entrate/uscite)
- **Category** - Categorie per le transazioni
- **Account** - Conti bancari e contanti

### Comandi Database

- `npm run prisma:generate` - Genera il client Prisma
- `npm run prisma:migrate` - Crea una nuova migrazione
- `npm run prisma:studio` - Apre Prisma Studio per visualizzare/modificare i dati

### Migrazione a PostgreSQL

Per usare PostgreSQL in produzione, modifica il file `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/primanota?schema=public"
```

Poi esegui:
```bash
npx prisma migrate deploy
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
│   └── TransactionForm.tsx # Form per transazioni
├── lib/                    # Utilities
│   ├── prisma.ts           # Client Prisma
│   ├── mockData.ts         # Dati di esempio (deprecato)
│   └── utils.ts            # Funzioni di utilità
├── prisma/                 # Configurazione Prisma
│   ├── schema.prisma       # Schema database
│   └── migrations/         # Migrazioni database
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
- Calcolo automatico di entrate/uscite
- Aggiornamento automatico dei saldi dei conti

✅ **Conto Economico**
- Calcolo automatico di ricavi, costi e utile netto
- Dettaglio ricavi e costi per categoria
- Grafico dell'andamento degli ultimi 6 mesi
- Filtri per periodo (Mensile, Trimestrale, Annuale)

✅ **Database**
- Schema completo con relazioni
- Migrazioni automatiche
- API RESTful per tutte le operazioni
- Popolamento iniziale con dati di esempio

## Licenza

© 2023 Prima Nota Accounting. Tutti i diritti riservati.
# primanota
# primanota
