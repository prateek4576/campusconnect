import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from config.database import db, client
from utils.storage import init_storage

from routes.auth import router as auth_router
from routes.items import router as items_router
from routes.messages import router as messages_router
from routes.files import router as files_router
from routes.contact import router as contact_router
from routes.admin import router as admin_router


# =====================================================
# ENVIRONMENT
# =====================================================

ROOT_DIR = Path(__file__).resolve().parent

load_dotenv(ROOT_DIR / ".env")


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="CampusConnect API"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_credentials=True,

    allow_origins=os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(","),

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# ROUTES
# =====================================================

app.include_router(
    auth_router,
    prefix="/api"
)

app.include_router(
    items_router,
    prefix="/api"
)

app.include_router(
    messages_router,
    prefix="/api"
)

app.include_router(
    files_router,
    prefix="/api"
)

app.include_router(
    contact_router,
    prefix="/api"
)

app.include_router(
    admin_router,
    prefix="/api"
)


# =====================================================
# ROOT
# =====================================================

@app.get("/api/")
async def root():
    return {
        "message": "CampusConnect API",
        "ok": True
    }


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# =====================================================
# STARTUP
# =====================================================

@app.on_event("startup")
async def startup():

    await db.email_verifications.create_index(
    "email",
    unique=True
)

    await db.email_verifications.create_index(
    "expires_at",
    expireAfterSeconds=0
)

    try:

        # ---------------------------------------------
        # USERS
        # ---------------------------------------------

        await db.users.create_index(
            "email",
            unique=True
        )

        await db.users.create_index(
            "id",
            unique=True
        )

        # ---------------------------------------------
        # ITEMS
        # ---------------------------------------------

        await db.items.create_index(
            "id",
            unique=True
        )

        await db.items.create_index(
            "type"
        )

        await db.items.create_index(
            "user_id"
        )

        # ---------------------------------------------
        # MESSAGES
        # ---------------------------------------------

        await db.messages.create_index(
            "id",
            unique=True
        )

        await db.messages.create_index(
            "item_id"
        )

        await db.messages.create_index(
            "sender_id"
        )

        await db.messages.create_index(
            "receiver_id"
        )

        await db.messages.create_index(
            [
                ("receiver_id", 1),
                ("read", 1)
            ]
        )

        # ---------------------------------------------
        # EMAIL VERIFICATIONS
        # ---------------------------------------------

        await db.email_verifications.create_index(
        "email",
        unique=True
    )

        await db.email_verifications.create_index(
        "expires_at",
        expireAfterSeconds=0
    )

        # ---------------------------------------------
        # STORAGE
        # ---------------------------------------------

        init_storage()

        print("CampusConnect backend started successfully.")

    except Exception as e:

        print(
            f"Startup error: {e}"
        )


# =====================================================
# SHUTDOWN
# =====================================================

@app.on_event("shutdown")
async def shutdown_db_client():

    client.close()

    print(
        "MongoDB connection closed."
    )