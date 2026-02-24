#!/bin/zsh

# Direciona para a pasta do projeto
cd "/Users/mateusjobdebrito/Documents/Ciencia_Pedagogia"

# Abre o navegador no local correto
sleep 2 && open "http://localhost:3000" &

# Inicia o servidor Next.js
npm run dev
