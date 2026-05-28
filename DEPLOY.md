# 배포 가이드 (베타)

이 문서는 Lotto Advisor를 단일 인스턴스 베타로 배포하는 절차입니다.
스택: PostgreSQL + FastAPI(백엔드) + Next.js(프론트엔드).

## 1. 사전 준비

- Docker / Docker Compose
- 도메인과 HTTPS 종단(리버스 프록시: Nginx, Caddy, 또는 PaaS 제공 TLS)
- 강한 시크릿: `openssl rand -hex 32`

## 2. 환경변수 설정

```bash
cp .env.example .env
# .env 편집:
#   POSTGRES_PASSWORD      강한 비밀번호
#   JWT_SECRET_KEY         openssl rand -hex 32 결과 (운영에서 기본/약한 값이면 기동 거부)
#   CORS_ORIGINS           실제 프론트 도메인 JSON 배열 예: ["https://lotto.example.com"]
#   NEXT_PUBLIC_API_BASE_URL  브라우저에서 접근할 백엔드 주소 예: https://api.lotto.example.com
#   INITIAL_ADMIN_USERNAME 첫 관리자로 승격할 아이디(선택)
```

## 3. 기동

```bash
docker compose up -d --build
```

- 백엔드 컨테이너는 시작 시 `alembic upgrade head`로 스키마를 자동 적용합니다.
- 프론트엔드는 `NEXT_PUBLIC_API_BASE_URL`을 **빌드 타임에 인라인**하므로, 백엔드 주소를 바꾸면 프론트를 재빌드해야 합니다.

## 4. 초기 데이터 적재 (최초 1회)

과거 당첨번호 CSV를 적재합니다.

```bash
docker compose exec backend python -c "from app.database import SessionLocal; from app.services.lotto_import.csv_importer import import_csv; db=SessionLocal(); print('inserted:', import_csv(db, 'asset/lotto.csv'))"
```

## 5. 관리자 부트스트랩

- `INITIAL_ADMIN_USERNAME`을 설정했다면, 그 아이디로 **가입만** 하면 자동으로 관리자가 됩니다(관리자가 아직 없을 때만).
- 또는 이미 가입한 사용자를 승격:

```bash
docker compose exec backend python -m scripts.create_admin <username>
```

## 6. HTTPS / 리버스 프록시

`backend(8000)`, `frontend(3000)`을 리버스 프록시 뒤에 두고 TLS를 종단하세요.
`APP_ENV=production`이면 백엔드가 HSTS 헤더를 보냅니다(실제 HTTPS에서만 의미 있음).

---

## 스키마 변경(마이그레이션) 워크플로

모델(`app/models`)을 바꾼 뒤:

```bash
cd backend
# 새 마이그레이션 자동 생성
alembic revision --autogenerate -m "describe change"
# 생성된 파일을 검토 후 적용
alembic upgrade head
# 모델과 마이그레이션 일치 검증
alembic check
```

> ⚠️ 운영에서는 `create_all`을 사용하지 않습니다(APP_ENV=production 시 비활성화).
> 스키마는 반드시 Alembic으로 관리하세요. 개발(APP_ENV=development)에서는 앱 시작 시
> 테이블을 자동 생성하므로 편의상 마이그레이션 없이도 동작합니다.

## 비-Docker(직접) 운영 실행 참고

```bash
cd backend
pip install .
export APP_ENV=production DATABASE_URL=postgresql+psycopg://user:pw@host:5432/lottery
export JWT_SECRET_KEY=$(openssl rand -hex 32) CORS_ORIGINS='["https://lotto.example.com"]'
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 배포 전 체크리스트

- [ ] `JWT_SECRET_KEY` 강한 무작위 값(32바이트 이상)
- [ ] `APP_ENV=production`
- [ ] `DATABASE_URL`이 PostgreSQL을 가리킴
- [ ] `CORS_ORIGINS`가 실제 프론트 도메인
- [ ] `NEXT_PUBLIC_API_BASE_URL`이 실제 백엔드 도메인 (프론트 재빌드)
- [ ] `alembic upgrade head` 적용됨
- [ ] 초기 CSV 데이터 적재
- [ ] 관리자 계정 생성
- [ ] HTTPS 종단 구성
