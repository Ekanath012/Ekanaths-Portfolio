import os
import re
import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from html import escape

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


app = FastAPI(title="Ekanath Portfolio Contact API")

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://127.0.0.1:4174,http://localhost:4174",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

RATE_WINDOW_SECONDS = 15 * 60
RATE_LIMIT = 5
MAX_MESSAGE_LINKS = 3
request_log = defaultdict(deque)

SPAM_PATTERNS = (
    r"\bcasino\b",
    r"\bcrypto giveaway\b",
    r"\bseo backlinks?\b",
    r"\btelegram\b",
    r"\bwhatsapp marketing\b",
)


class Contact(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=2000)
    website: str = Field(default="", max_length=120)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(ip: str) -> None:
    now = time.time()
    hits = request_log[ip]
    while hits and now - hits[0] > RATE_WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many messages. Please try again later.")
    hits.append(now)


def looks_like_spam(data: Contact) -> bool:
    if data.website:
        return True
    message = data.message.lower()
    if len(re.findall(r"https?://|www\.", message)) > MAX_MESSAGE_LINKS:
        return True
    return any(re.search(pattern, message) for pattern in SPAM_PATTERNS)


def send_email(data: Contact) -> None:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    recipient = os.getenv("CONTACT_TO", "ekanathanehosur@gmail.com")
    sender = os.getenv("CONTACT_FROM", smtp_user or recipient)

    if not smtp_host or not smtp_user or not smtp_password:
        print(f"Contact message from {data.name} <{data.email}>: {data.message}")
        return

    msg = EmailMessage()
    msg["Subject"] = f"Portfolio contact from {data.name}"
    msg["From"] = sender
    msg["To"] = recipient
    msg["Reply-To"] = str(data.email)
    msg.set_content(
        "New portfolio message\n\n"
        f"Name: {data.name}\n"
        f"Email: {data.email}\n\n"
        f"{data.message}\n"
    )
    msg.add_alternative(
        f"""
        <h2>New portfolio message</h2>
        <p><strong>Name:</strong> {escape(data.name)}</p>
        <p><strong>Email:</strong> {escape(str(data.email))}</p>
        <p>{escape(data.message).replace(chr(10), "<br>")}</p>
        """,
        subtype="html",
    )

    port = int(os.getenv("SMTP_PORT", "587"))
    with smtplib.SMTP(smtp_host, port, timeout=10) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/contact")
async def contact(data: Contact, request: Request):
    enforce_rate_limit(client_ip(request))

    if looks_like_spam(data):
        raise HTTPException(status_code=400, detail="Message rejected.")

    try:
        send_email(data)
    except Exception:
        raise HTTPException(status_code=502, detail="Message service unavailable.")

    return {
        "success": True,
        "message": "Thank you! Your message has been sent successfully.",
    }
