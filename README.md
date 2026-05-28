# Lotto Advisor — 로또 번호 추천 MVP

> ⚠️ **본 서비스는 과거 로또 당첨 데이터를 기반으로 통계 및 엔터테인먼트 목적의 번호 조합을 제공합니다. 당첨을 보장하지 않으며, 복권 구매는 사용자 본인의 판단에 따라 이루어져야 합니다.**

과거 1,224회 당첨번호 데이터를 분석하여 사용자가 설정한 알고리즘 순서·필터 조건으로 6개의 번호 조합을 생성하는 풀스택 웹앱.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · TailwindCSS · Zustand · dnd-kit · Recharts |
| Backend | FastAPI · SQLAlchemy 2 · Pandas · httpx |
| DB | SQLite (개발) / PostgreSQL (운영) |

## 핵심 기능

- 회차별 당첨번호 CSV import + 동행복권 자동 동기화
- 번호별 통계(빈도·Hot·Cold·홀짝·고저·합계 분포)
- 블록 기반 추천 엔진 — Hot/Cold/WeightedRandom/PureRandom + 6종 필터
- 적용 순서 드래그 앤 드롭 + 블록별 사용/미사용 체크박스
- 프리셋 저장 + 추천 이력 (localStorage)

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -e .
python -c "from app.database import Base, engine; from app.models import *; Base.metadata.create_all(bind=engine)"
# 초기 데이터 적재 (1,224회분)
python -c "from app.database import SessionLocal; from app.services.lotto_import.csv_importer import import_csv; db=SessionLocal(); print('inserted:', import_csv(db, 'asset/lotto.csv'))"
# 서버 기동
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# http://localhost:3000
```

### Tests

```bash
cd backend
pytest tests/ -v
```

### 한 번에 시작 / 종료 (Windows)

```bat
:: 백 + 프론트를 각각 새 cmd 창에서 동시에 기동
dev.bat
:: 또는 PowerShell
.\dev.ps1

:: 두 서버 종료 (포트 8000, 3000 + 창 타이틀 기반)
stop.bat
```

## 주요 API

| Method | Path | Description | 인증 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입 | - |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | - |
| POST | `/api/lotto/import-csv` | CSV 업로드 | 필요 |
| POST | `/api/lotto/sync` | 동행복권에서 신규 회차 증분 동기화 | 필요 |
| GET | `/api/lotto/draws` | 회차 목록 | - |
| GET | `/api/statistics/{number-frequency,hot,cold,summary}` | 통계 | - |
| POST | `/api/recommend` | 사용자 설정 기반 6개 번호 추천 | - |
| GET/POST/PUT/DELETE | `/api/presets` | 프리셋 관리 (계정별) | 필요 |
| GET/POST/DELETE | `/api/history` | 추천 이력 (계정별) | 필요 |

## 폴더 구조

```
backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/                  # SQLAlchemy 테이블
│   ├── routers/                 # FastAPI 라우터
│   ├── repositories/
│   ├── schemas/                 # Pydantic
│   ├── services/
│   │   ├── recommendation/
│   │   │   ├── engine.py
│   │   │   ├── blocks/          # HotNumber/Cold/WeightedRandom/PureRandom/FilterValidation
│   │   │   └── filters/         # 6종 필터
│   │   └── lotto_import/
│   │       ├── csv_importer.py
│   │       ├── dhlottery_client.py
│   │       └── dhlottery_sync.py
│   └── utils/
├── tests/                       # pytest (13건)
├── scripts/                     # CLI: sync_dhlottery.py
└── asset/lotto.csv              # 초기 1,224회 데이터

frontend/
├── app/
│   ├── page.tsx                 # 메인 추천
│   ├── settings/                # 알고리즘 설정 (DnD + 체크박스)
│   ├── statistics/              # 통계 대시보드 + 동기화 버튼
│   ├── presets/                 # 프리셋 관리
│   └── history/                 # 추천 이력
├── components/
│   ├── lotto/                   # 공통 번호 공
│   ├── settings/                # Hot/Cold/Random/Weighted/Filter/StepOrderDnD
│   └── statistics/              # FrequencyChart/HotColdPanel/RatioCard/...
└── lib/
    ├── api/                     # 백엔드 호출 (recommend/statistics/sync)
    ├── store/                   # Zustand (settings/preset/history)
    └── types/
```

## 라이선스

엔터테인먼트/학습 목적 프로젝트. 실제 도박 행위를 권장하지 않습니다.
