from fastapi import APIRouter
from pydantic import BaseModel
from backend.storage.settings_store import set_setting, get_all_settings

router = APIRouter()

class SettingUpdate(BaseModel):
    key: str
    value: str # Simplified for now, can be complex JSON

@router.get("/")
async def settings_get():
    return {"settings": get_all_settings()}

@router.post("/")
async def settings_update(update: SettingUpdate):
    set_setting(update.key, update.value)
    return {"status": "updated", update.key: update.value}
