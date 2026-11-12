from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from backend.storage.settings_store import set_setting, get_all_settings
from backend.api.auth_routes import get_current_user_optional

router = APIRouter()

class SettingUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
async def settings_get(user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    return {"settings": get_all_settings(user_id=user_id)}

@router.post("/")
async def settings_update(update: SettingUpdate, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    set_setting(update.key, update.value, user_id=user_id)
    return {"status": "updated", update.key: update.value}
