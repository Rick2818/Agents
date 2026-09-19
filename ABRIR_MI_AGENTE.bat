@echo off
title Cabina Soberana de Ricardo — Destraba AI
color 0b
echo =============================================================================
echo   CABINA EJECUTIVA SOBERANA DE RICARDO — DESTRABA AI
echo =============================================================================
echo.
echo [1/3] Modo de Entrega Telegram: CLOUD NATIVE SERVERLESS 24/7 (Vercel)
echo       Tu agente de Telegram responde 24/7 en la nube (tu laptop puede apagarse).
echo.
echo [2/3] Verificando Runtime Local de Soporte (Puerto 8765)...
netstat -ano | findstr :8765 >nul
if %errorlevel% neq 0 (
    echo       Iniciando servidor local seguro en segundo plano...
    start /B node server.js >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo       Servidor local activo y respondiendo.
)
echo.
echo [3/3] Abriendo Cabina Ejecutiva privada en tu navegador...
start http://localhost:8765/cockpit
echo.
echo =============================================================================
echo   LISTO: Cabina Ejecutiva abierta en http://localhost:8765/cockpit
echo   Voz STT y TTS activas. Tu agente opera sin colisiones locales ni en la nube.
echo =============================================================================
