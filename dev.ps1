# ==========================================================
#  Lottery MVP - Start backend + frontend (PowerShell)
#  Usage: PowerShell>  .\dev.ps1
#  If execution policy blocks: PS> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
# ==========================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "=== Lottery dev launcher ===" -ForegroundColor Cyan
Write-Host ""

# ----- preflight -----
if (-not (Test-Path "backend\.venv\Scripts\python.exe")) {
  Write-Host "[X] backend\.venv not found. Run setup first:" -ForegroundColor Red
  Write-Host "    cd backend; python -m venv .venv; .\.venv\Scripts\activate; pip install -e ."
  exit 1
}
if (-not (Test-Path "frontend\node_modules")) {
  Write-Host "[X] frontend\node_modules not found. Run setup first:" -ForegroundColor Red
  Write-Host "    cd frontend; npm install"
  exit 1
}

if (-not (Test-Path "backend\lottery.db")) {
  Write-Host "[!] backend\lottery.db not found. Importing CSV ..." -ForegroundColor Yellow
  Push-Location backend
  & ".\.venv\Scripts\python.exe" -c "from app.database import Base, engine; from app.models import LottoDraw, NumberStatisticsCache, User, UserAlgorithmPreset, RecommendationHistory; Base.metadata.create_all(bind=engine); from app.database import SessionLocal; from app.services.lotto_import.csv_importer import import_csv; db=SessionLocal(); print('imported:', import_csv(db, 'asset/lotto.csv')); db.close()"
  Pop-Location
}

# ----- launch each server in its own window -----
Write-Host "[*] FastAPI backend   http://localhost:8000  (new window)" -ForegroundColor Green
Start-Process cmd -ArgumentList @(
  '/k', "title Lottery Backend && cd /d `"$root\backend`" && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
)

Write-Host "[*] Next.js frontend  http://localhost:3000  (new window)" -ForegroundColor Green
Start-Process cmd -ArgumentList @(
  '/k', "title Lottery Frontend && cd /d `"$root\frontend`" && npm run dev"
)

Write-Host ""
Write-Host "=== Both servers launching in separate windows. ===" -ForegroundColor Cyan
Write-Host "  - Backend  : http://localhost:8000  (docs: /docs)"
Write-Host "  - Frontend : http://localhost:3000"
Write-Host ""
Write-Host "To stop: Ctrl+C in each window, or run  .\stop.bat" -ForegroundColor DarkGray
