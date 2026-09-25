@echo off
title BolTech Group — Plataforma de Agentes Autonomos
color 0b
echo =============================================================================
echo   BOLTECH GROUP — AUTONOMOUS ENTERPRISE AI AGENTS
echo =============================================================================
echo.
echo [1/2] Verificando Runtime Local de Soporte (Puerto 8765)...
netstat -ano | findstr :8765 >nul
if %errorlevel% neq 0 (
    echo       Iniciando servidor local seguro en segundo plano...
    start /B node server.js >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo       Servidor local activo y respondiendo.
)
echo.
echo [2/2] Abriendo BolTech Group en tu navegador...
start http://localhost:8765/
echo.
echo =============================================================================
echo   LISTO: BolTech Group abierto en http://localhost:8765/
echo   Holding: http://localhost:8765/boltech
echo   Dashboard CRM: http://localhost:8765/dashboard
echo   Cabina Soberana: http://localhost:8765/cockpit
echo =============================================================================
timeout /t 2 >nul
exit
