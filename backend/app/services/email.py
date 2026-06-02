"""Transactional email via SMTP (Gmail).

The SMTP app password must be supplied via env (SMTP_PASSWORD); it is never
hardcoded. When SMTP is not configured, behaviour depends on APP_ENV:
  - development: the message is logged to the console (so the flow is testable
    locally without real credentials)
  - production: an error is raised so misconfiguration fails loudly
"""
from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

log = logging.getLogger("email")


class EmailError(Exception):
    pass


def send_email(to: str, subject: str, body: str) -> None:
    if not settings.smtp_enabled:
        if settings.app_env == "production":
            raise EmailError("SMTP is not configured (set SMTP_PASSWORD)")
        # Dev fallback: don't block the flow, just show what would be sent.
        log.warning(
            "[DEV email — SMTP disabled] to=%s subject=%s\n%s", to, subject, body
        )
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = to
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except (smtplib.SMTPException, OSError) as e:
        log.error("failed to send email to %s: %s", to, e)
        raise EmailError("이메일 발송에 실패했습니다") from e
