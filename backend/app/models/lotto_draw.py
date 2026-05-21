from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Integer, SmallInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LottoDraw(Base):
    __tablename__ = "lotto_draws"
    __table_args__ = (
        UniqueConstraint("draw_no", name="uq_lotto_draw_no"),
        CheckConstraint(
            "number_1 < number_2 AND number_2 < number_3 "
            "AND number_3 < number_4 AND number_4 < number_5 "
            "AND number_5 < number_6",
            name="chk_numbers_sorted",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    draw_no: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    draw_date: Mapped[date] = mapped_column(Date, nullable=False)
    number_1: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    number_2: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    number_3: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    number_4: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    number_5: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    number_6: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    bonus_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def numbers(self) -> list[int]:
        return [self.number_1, self.number_2, self.number_3,
                self.number_4, self.number_5, self.number_6]
