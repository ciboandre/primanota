#!/bin/bash

echo "🚀 Setup Prima Nota App"
echo ""

# Verifica che Node.js sia installato
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non è installato. Installa Node.js prima di continuare."
    exit 1
fi

echo "📦 Installazione dipendenze..."
npm install

echo ""
echo "🗄️  Configurazione database..."
npx prisma generate
npx prisma migrate dev --name init

echo ""
echo "✅ Setup completato!"
echo ""
echo "Per avviare l'applicazione:"
echo "  npm run dev"
echo ""
echo "Per popolare il database con dati di esempio:"
echo "  curl -X POST http://localhost:3000/api/seed"
echo ""
