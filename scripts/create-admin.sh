#!/bin/bash

# Script per creare l'utente admin iniziale
# Esegui: bash scripts/create-admin.sh

echo "Creazione utente admin..."
echo "Email: admin@primanota.it"
echo "Password: !Buui8492"

curl -X POST http://localhost:3000/api/users/create-admin \
  -H "Content-Type: application/json" \
  | jq .

echo ""
echo "Utente admin creato! Ora puoi accedere con:"
echo "Email: admin@primanota.it"
echo "Password: !Buui8492"
