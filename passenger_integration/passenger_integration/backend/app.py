from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime, timedelta
import random
import webbrowser
import threading
import os

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy train routes
train_routes = {
    "12345": [
        {"station": "Delhi", "lat": 28.6139, "lon": 77.2090},
        {"station": "Kanpur", "lat": 26.4499, "lon": 80.3319},
        {"station": "Allahabad", "lat": 25.4358, "lon": 81.8463},
        {"station": "Varanasi", "lat": 25.3176, "lon": 82.9739},
    ],
    "54321": [
        {"station": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"station": "Surat", "lat": 21.1702, "lon": 72.8311},
        {"station": "Vadodara", "lat": 22.3072, "lon": 73.1812},
        {"station": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
    ]
}

# Starting positions
train_positions = {"12345": 0, "54321": 0}


# ---------------- API Endpoints ---------------- #

@app.get("/predict-delay/{train_no}")
async def predict_delay(train_no: str):
    """Return fake delay prediction + new ETA"""
    delay = random.choice([0, 5, 10, 15, 20])  # dummy ML logic
    eta = datetime.now() + timedelta(minutes=30 + delay)
    return {
        "train_no": train_no,
        "predicted_delay": delay,
        "new_eta": eta.strftime("%H:%M:%S")
    }


@app.get("/route/{train_no}")
async def get_route(train_no: str):
    return {"route": train_routes.get(train_no, [])}


@app.get("/all_routes")
async def get_all_routes():
    return train_routes


@app.get("/position/{train_no}")
async def get_position(train_no: str):
    """Return current train position and move it forward step by step"""
    if train_no not in train_routes:
        return {"error": "Train not found"}
    idx = train_positions[train_no]
    route = train_routes[train_no]

    # Move forward
    train_positions[train_no] = (idx + 1) % len(route)
    next_station = route[train_positions[train_no]]["station"]

    return {
        "train_no": train_no,
        "lat": route[idx]["lat"],
        "lon": route[idx]["lon"],
        "next_station": next_station
    }


@app.get("/all_positions")
async def get_all_positions():
    positions = {}
    for train_no in train_routes.keys():
        positions[train_no] = await get_position(train_no)
    return positions


# ---------------- Run with Auto-Browser ---------------- #

def open_browser():
    # point to your frontend index.html
    frontend_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../frontend/index.html")
    )
    webbrowser.open_new_tab(f"file://{frontend_path}")


if __name__ == "__main__":
    threading.Timer(1.5, open_browser).start()
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
