from email.message import EmailMessage
import smtplib


def send_email(recipient: str, subject: str, body: str) -> None:
    """Placeholder email sender; swap out with real SMTP/service later."""
    msg = EmailMessage()
    msg["To"] = recipient
    msg["Subject"] = subject
    msg["From"] = "no-reply@finvault.local"
    msg.set_content(body)

    try:
        print(f"[EMAIL] To: {recipient} | Subject: {subject} | Body: {body}")
    except Exception as exc:
        print("Failed to send OTP email:", exc)
