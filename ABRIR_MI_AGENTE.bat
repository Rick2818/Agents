@echo off
title Cabina Soberana de Ricardo — Destraba AI
color 0b
echo =============================================================================
echo   INICIANDO CABINA EJECUTIVA SOBERANA DE RICARDO
echo =============================================================================
echo.
echo [1/2] Verificando demonio 24/7 en segundo plano...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Demonio de Telegram y Calendario ya esta activo.
) else (
    echo [*] Arrancando demonio de Telegram y Calendario en segundo plano...
    start /B node scripts/telegram_assistant_bot.mjs
)

echo [2/2] Abriendo Cabina Ejecutiva privada en tu navegador...
start COCKPIT_EJECUTIVO_RICARDO.html
echo.
echo =============================================================================
echo   LISTO: Tu agente y cabina estan operando 100%% en privado en tu laptop.
echo =============================================================================
