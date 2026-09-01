@echo off
title Trust Security System - Local CMS Server
color 0b
echo ================================================================
echo   Trust Security System - Starting Local CMS Web Server...
echo ================================================================
echo.
echo   Starting local server with instant Disk Save and multi-browser sync...
echo   Open your browser at: http://localhost:8080/
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
