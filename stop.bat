@echo off
REM ==========================================================
REM  Lottery MVP - stop backend (8000) + frontend (3000)
REM
REM  Strategy:
REM   1. Kill cmd windows by title (set by dev.bat) with /T to
REM      take down the child python/node processes.
REM   2. Then kill anything still holding ports 8000/3000.
REM ==========================================================
setlocal enabledelayedexpansion

echo.
echo === Lottery dev stopper ===
echo.

REM --- 1) by window title (preferred, kills cleanly via tree) ---
call :killtitle "Lottery Backend"
call :killtitle "Lottery Frontend"

REM --- 2) by port (safety net for orphans) ---
call :killport 8000 backend
call :killport 3000 frontend

echo.
echo Done.
endlocal
exit /b 0

REM ----- subroutines -----

:killtitle
set "title=%~1"
set "hit="
for /f "tokens=2" %%P in ('tasklist /V /FI "WINDOWTITLE eq %title%" /NH 2^>nul ^| findstr /V /B "INFO:"') do (
  set "pid=%%P"
  echo !pid! | findstr /R "^[0-9][0-9]*$" >nul && (
    set "hit=!pid!"
    echo [*] window "%title%" pid !pid! tree kill
    taskkill /F /T /PID !pid! >nul 2>&1
  )
)
if not defined hit echo [-] window "%title%" : not found
exit /b 0

:killport
set "port=%~1"
set "label=%~2"
set "found="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%port% " ^| findstr "LISTENING"') do (
  set "found=%%P"
  echo [*] port %port% [%label%] pid %%P
  taskkill /F /T /PID %%P >nul 2>&1
)
if not defined found echo [-] port %port% [%label%] : no listener
exit /b 0
