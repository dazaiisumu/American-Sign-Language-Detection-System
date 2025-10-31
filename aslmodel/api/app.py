from fastapi import FastAPI
import threading
from src.detect_sign import run_detection_loop
from src.config import MIN_CONFIDENCE
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware  # <- Add this

app = FastAPI(title="ASL Detection API")

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------

# Shared dictionary to store latest detection results
latest_letter = {"letter": None, "confidence": 0.0, "timestamp": None}

# Flag to control detection loop
detection_running_flag = {"status": False}

# Background thread for detection
detection_thread = None

# Function to run detection loop
def detection_background():
    run_detection_loop(latest_letter, MIN_CONFIDENCE, detection_running_flag)

# -----------------------------
# API Endpoints
# -----------------------------

@app.post("/start-detection")
def start_detection():
    global detection_thread, detection_running_flag
    if detection_running_flag["status"]:
        return {"status": "already running"}
    
    detection_running_flag["status"] = True
    detection_thread = threading.Thread(target=detection_background, daemon=False)
    detection_thread.start()
    return {"status": "started"}

@app.post("/stop-detection")
def stop_detection():
    global detection_running_flag
    if not detection_running_flag["status"]:
        return {"status": "not running"}
    
    detection_running_flag["status"] = False
    return {"status": "stopped"}

@app.get("/get-results")
def get_results():
    latest_letter["timestamp"] = datetime.now().isoformat()
    return latest_letter

@app.get("/health")
def health_check():
    return {"status": "ASL API is running", "detection_running": detection_running_flag["status"]}
