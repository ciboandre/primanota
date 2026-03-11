# 🚀 Guida Passo-Passo: Configurazione Vercel

## 📋 Checklist Pre-Deploy

- [x] Codice committato e pushato su GitHub
- [x] Database Supabase configurato e funzionante
- [ ] Variabile d'ambiente `DATABASE_URL` configurata su Vercel
- [ ] Redeploy eseguito

---

## 📝 Passo 1: Accedi al Dashboard Vercel

1. **Apri il browser** e vai su: https://vercel.com
2. **Accedi** con il tuo account (GitHub, GitLab, o email)
3. **Seleziona il progetto** `primanota` dalla lista dei progetti

---

## 📝 Passo 2: Vai alle Impostazioni

1. **Clicca sul nome del progetto** `primanota` nella dashboard
2. **Clicca sulla tab "Settings"** (in alto nella barra di navigazione)
3. **Scorri fino a "Environment Variables"** nella sidebar sinistra
4. **Clicca su "Environment Variables"**

---

## 📝 Passo 3: Aggiungi la Variabile DATABASE_URL

1. **Clicca sul pulsante "Add New"** (in alto a destra)

2. **Compila il form:**
   - **Key (Nome)**: 
     ```
     DATABASE_URL
     ```
   - **Value (Valore)**: 
     ```
     postgresql://postgres.exmpgaocttxqzpvpxsgy:%21Buui849200@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
     ```
   - **Environments**: Seleziona tutte e tre le checkbox:
     - ☑️ Production
     - ☑️ Preview  
     - ☑️ Development

3. **Clicca su "Save"**

✅ **Verifica**: Dovresti vedere la variabile `DATABASE_URL` nella lista con un valore mascherato (mostra solo i primi caratteri per sicurezza)

---

## 📝 Passo 4: Redeploy dell'Applicazione

### Opzione A: Redeploy Manuale (Consigliato)

1. **Vai alla tab "Deployments"** (in alto nella barra di navigazione)
2. **Trova l'ultimo deployment** nella lista
3. **Clicca sui tre puntini (...)** a destra del deployment
4. **Seleziona "Redeploy"** dal menu
5. **Conferma** cliccando su "Redeploy" nel popup

### Opzione B: Trigger con Git Push

Se preferisci, puoi fare un commit vuoto per triggerare un nuovo deploy:

```bash
git commit --allow-empty -m "Trigger redeploy after DATABASE_URL setup"
git push origin main
```

Vercel rileverà automaticamente il nuovo commit e farà un nuovo deploy.

---

## 📝 Passo 5: Verifica il Deploy

1. **Aspetta che il deploy finisca** (vedrai un indicatore di progresso)
2. **Quando il deploy è completato**, vedrai un badge verde "Ready"
3. **Clicca sul link dell'URL** (es: `primanota-xxx.vercel.app`)

---

## 📝 Passo 6: Test dell'Applicazione

1. **Visita la homepage**: `https://primanota-xxx.vercel.app`
2. **Vai alla pagina Movimenti**: `https://primanota-xxx.vercel.app/movimenti`
3. **Verifica che:**
   - ✅ La pagina si carica senza errori
   - ✅ Non vedi errori 500 nella console del browser
   - ✅ I dati vengono caricati dal database (se ci sono transazioni)

### Come verificare gli errori:

1. **Apri la Console del Browser**:
   - Chrome/Edge: `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` o `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: `Cmd+Option+C` (Mac)

2. **Vai alla tab "Console"**
3. **Cerca errori in rosso** - non dovrebbero esserci errori relativi a `DATABASE_URL`

---

## 🔍 Verifica Avanzata: Logs di Vercel

Se vuoi verificare i logs del server:

1. **Vai alla tab "Deployments"**
2. **Clicca sull'ultimo deployment**
3. **Clicca su "Functions"** nella sidebar
4. **Seleziona una funzione** (es: `/api/transactions`)
5. **Vedi i logs** - non dovrebbero esserci errori `Environment variable not found`

---

## ✅ Checklist Post-Deploy

- [ ] Variabile `DATABASE_URL` aggiunta su Vercel
- [ ] Redeploy completato con successo
- [ ] Homepage si carica correttamente
- [ ] Pagina Movimenti si carica senza errori 500
- [ ] Nessun errore nella console del browser
- [ ] I dati vengono caricati dal database

---

## 🆘 Problemi Comuni

### ❌ Errore: "Environment variable not found: DATABASE_URL"

**Causa**: La variabile non è stata aggiunta o il redeploy non è stato fatto.

**Soluzione**:
1. Verifica che la variabile sia presente in Settings → Environment Variables
2. Assicurati che sia abilitata per Production
3. Fai un nuovo redeploy

### ❌ Errore: "Authentication failed"

**Causa**: La password nella connection string non è corretta o non è URL-encoded.

**Soluzione**:
1. Verifica la password nel file `.env` locale
2. Assicurati che i caratteri speciali siano URL-encoded (`!` = `%21`)
3. Copia esattamente la connection string dal file `.env`

### ❌ Errore: "Can't reach database server"

**Causa**: La connection string usa il metodo sbagliato o il progetto Supabase è spento.

**Soluzione**:
1. Verifica che il progetto Supabase sia attivo
2. Usa il Session Pooler invece della Direct Connection
3. Controlla le impostazioni di rete su Supabase

---

## 📞 Supporto

Se continui ad avere problemi:

1. **Controlla i logs** su Vercel (Deployments → Functions → Logs)
2. **Verifica la connection string** copiandola dal dashboard Supabase
3. **Assicurati che il database Supabase sia attivo** e accessibile

---

## 🎉 Fatto!

Una volta completati tutti i passi, la tua applicazione dovrebbe funzionare correttamente su Vercel!
