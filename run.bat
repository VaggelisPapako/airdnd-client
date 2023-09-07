@echo off
set "HTTPS=true"
set "SSL_CRT_FILE=../airdnd-server/configurations/cert.pem"
set "SSL_KEY_FILE=../airdnd-server/configurations/key.pem"
npm start
