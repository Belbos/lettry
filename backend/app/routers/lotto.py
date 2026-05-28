from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models.lotto_draw import LottoDraw
from app.models.user import User
from app.repositories import lotto_repo
from app.schemas.lotto import DrawListResponse, LottoDrawOut
from app.services.lotto_import.csv_importer import import_csv
from app.services.lotto_import.dhlottery_client import DhLotteryError
from app.services.lotto_import.dhlottery_sync import sync_new_draws

router = APIRouter(prefix="/api/lotto", tags=["lotto"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def _to_out(d: LottoDraw) -> LottoDrawOut:
    return LottoDrawOut(
        draw_no=d.draw_no,
        draw_date=d.draw_date,
        numbers=d.numbers,
        bonus_number=d.bonus_number,
    )


@router.get("/draws", response_model=DrawListResponse)
def list_draws(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    if limit < 1 or limit > 500:
        raise HTTPException(400, "limit must be between 1 and 500")
    if offset < 0:
        raise HTTPException(400, "offset must be >= 0")
    items = [_to_out(d) for d in lotto_repo.list_draws(db, limit, offset)]
    return DrawListResponse(
        items=items, total=lotto_repo.count(db), limit=limit, offset=offset
    )


@router.get("/draws/{draw_no}", response_model=LottoDrawOut)
def get_draw(draw_no: int, db: Session = Depends(get_db)):
    d = lotto_repo.get_draw(db, draw_no)
    if not d:
        raise HTTPException(404, f"draw_no={draw_no} not found")
    return _to_out(d)


@router.post("/import-csv")
async def import_csv_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(400, "must be a .csv file")
    # Read at most MAX+1 bytes so an oversized file is rejected without
    # loading the whole payload into memory.
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "file too large (max 5MB)")
    try:
        inserted = import_csv(db, BytesIO(content))
    except ValueError as e:
        raise HTTPException(422, str(e))
    return {"inserted": inserted, "total": lotto_repo.count(db)}


@router.post("/sync")
def sync_endpoint(
    max_fetch: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    """Pull new lotto draws from 동행복권 since the latest one in DB."""
    if max_fetch < 1 or max_fetch > 200:
        raise HTTPException(400, "max_fetch must be between 1 and 200")
    try:
        result = sync_new_draws(db, max_fetch=max_fetch)
    except DhLotteryError as e:
        raise HTTPException(502, f"upstream error: {e}")
    return {
        "inserted": result.inserted,
        "fetched": result.fetched,
        "started_from": result.started_from,
        "stopped_at": result.stopped_at,
        "new_draw_nos": result.new_draw_nos,
        "note": result.note,
        "total": lotto_repo.count(db),
    }
