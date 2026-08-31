import os
import requests


RESEND_API_KEY = os.environ.get("RESEND_API_KEY")

FROM_EMAIL = os.environ.get(
    "FROM_EMAIL",
    "onboarding@resend.dev"
)


def send_verification_email(
    email: str,
    otp: str
):

    if not RESEND_API_KEY:
        raise Exception(
            "RESEND_API_KEY is not configured"
        )

    response = requests.post(
        "https://api.resend.com/emails",

        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        },

        json={
            "from": FROM_EMAIL,
            "to": [email],
            "subject": "CampusConnect Email Verification",
            "html": f"""
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: auto;
                    padding: 30px;
                ">

                    <h2>CampusConnect</h2>

                    <p>
                        Your email verification code is:
                    </p>

                    <h1 style="
                        letter-spacing: 8px;
                        font-size: 32px;
                    ">
                        {otp}
                    </h1>

                    <p>
                        This code will expire in 10 minutes.
                    </p>

                    <p>
                        If you did not request this code,
                        you can safely ignore this email.
                    </p>

                </div>
            """
        },

        timeout=30
    )

    if not response.ok:
        raise Exception(
            f"Resend error: "
            f"{response.status_code} "
            f"{response.text}"
        )

    return response.json()