from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.storage.auth_store import (
    create_user, 
    authenticate_user, 
    generate_token, 
    verify_token,
    get_user_by_id
)

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    display_name: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str  # email or username
    password: str

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Extracts user from Bearer token if present."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return None
    return get_user_by_id(payload.get("user_id"))

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Requires authentication, raises 401 if not authenticated."""
    user = await get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please log in or register."
        )
    return user

@router.post("/register")
async def register(req: RegisterRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    if not req.username or len(req.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")
    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    try:
        user = create_user(
            email=req.email,
            username=req.username,
            password=req.password,
            display_name=req.display_name
        )
        token = generate_token(user["id"], user["email"], user["username"])
        return {
            "status": "success",
            "message": "Account created successfully",
            "user": user,
            "token": token
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(req: LoginRequest):
    if not req.identifier or not req.password:
        raise HTTPException(status_code=400, detail="Username/Email and Password are required.")
        
    user = authenticate_user(req.identifier, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")
        
    token = generate_token(user["id"], user["email"], user["username"])
    return {
        "status": "success",
        "message": "Logged in successfully",
        "user": user,
        "token": token
    }

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

@router.post("/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}

