@echo off
title Boltech Group - Dashboard Ejecutivo Fiduciario
echo ========================================================
echo   Boltech Group - CONSOLA EJECUTIVA Y PRESUPUESTO 24/7
echo ========================================================
echo [1/2] Abriendo navegador en http://localhost:8765/executive-dashboard ...
start http://localhost:8765/executive-dashboard
echo [2/2] Iniciando servicio local fiduciario en puerto 8765...
echo Para cerrar el servicio, presiona Ctrl + C en esta ventana.
echo ========================================================
node server.js
