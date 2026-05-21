@echo off
REM ==========================================================
REM  Lottery MVP - Start backend + frontend
REM  Usage: double-click or  cmd> dev.bat
REM ==========================================================
setlocal
cd /d "%~dp0"

echo.
echo === Lottery dev launcher ===
echo.

REM ----- preflight -----
if not exist "backend\.venv\Scripts\python.exe" (
  echo [X] backend\.venv not found. Run setup first:
  echo     cd backend ^&^& python -m venv .venv ^&^& .venv\Scripts\activate ^&^& pip install -e .
  pause
  exit /b 1
)
if not exist "frontend\node_modules" (
  echo [X] frontend\node_modules not found. Run setup first:
  echo     cd frontend ^&^& npm install
  pause
  exit /b 1
)
if not exist "backend\lottery.db" (
  echo [!] backend\lottery.db not found. Importing CSV ...
  pushd backend
  ".venv\Scripts\python.exe" -c "from app.database import Base, engine; from app.models import LottoDraw, NumberStatisticsCache, User, UserAlgorithmPreset, RecommendationHistory; Base.metadata.create_all(bind=engine); from app.database import SessionLocal; from app.services.lotto_import.csv_importer import import_csv; db=SessionLocal(); print('imported:', import_csv(db, 'asset/lotto.csv')); db.close()"
  popd
  echo.
)

REM ----- launch each server in its own window -----
echo [*] FastAPI backend   http://localhost:8000  (new window)
start "Lottery Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo [*] Next.js frontend  http://localhost:3000  (new window)
start "Lottery Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo === Both servers launching in separate windows. ===
echo  - Backend  : http://localhost:8000  (docs: /docs)
echo  - Frontend : http://localhost:3000
echo.
echo To stop: Ctrl+C in each window, or run  stop.bat
echo.
endlocal
