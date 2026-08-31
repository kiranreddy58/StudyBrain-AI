from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

clients = []

@router.get("/events")
async def events():
    """SSE endpoint to broadcast data updates to the frontend."""
    async def event_generator():
        queue = asyncio.Queue()
        clients.append(queue)
        try:
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            clients.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def broadcast_update(event_type: str, data: dict = None):
    """Broad-casts an update to all connected SSE clients."""
    payload = {"type": event_type, "payload": data or {}}
    for queue in clients:
        await queue.put(payload)
