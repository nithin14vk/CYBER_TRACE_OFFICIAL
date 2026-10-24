"""
CyberTrace: Digital Exposure Lab - Single-Command Launcher
Launches the FastAPI backend and serves the frontend locally.
"""
import sys
import webbrowser
import threading
import time

# Verify Python version requirement (3.11+)
if sys.version_info < (3, 11):
    print("[ERROR] Python 3.11 or newer is required to run CyberTrace.")
    print(f"Current version detected: {sys.version}")
    sys.exit(1)

import uvicorn
from backend.app.config import settings

BANNER = r"""
   _____      _               _______                    
  / ____|    | |             |__   __|                   
 | |    _   _| |__   ___ _ __   | |_ __ __ _  ___ ___    
 | |   | | | | '_ \ / _ \ '__|  | | '__/ _` |/ __/ _ \   
 | |___| |_| | |_) |  __/ |     | | | | (_| | (_|  __/   
  \_____\__, |_.__/ \___|_|     |_|_|  \__,_|\___\___|   
         __/ |                                           
        |___/        DIGITAL EXPOSURE LAB [v1.0.0]       
=============================================================
  [+] Platform: Educational Cybersecurity Awareness Lab
  [+] Privacy Mode: Strict Zero-Persistence (In-Memory Only)
  [+] Host: http://127.0.0.1:8000
  [+] Swagger API Docs: http://127.0.0.1:8000/docs
=============================================================
"""


def open_browser():
    """Waits for the server to bind and launches default browser."""
    time.sleep(1.2)
    url = f"http://{settings.HOST}:{settings.PORT}"
    print(f"[+] Opening browser automatically at: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[!] Could not open browser automatically: {e}")


def main():
    print(BANNER)
    # Start browser opener in background thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Launch Uvicorn server
    print(f"[+] Starting Uvicorn ASGI server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level="info",
        reload=False
    )


if __name__ == "__main__":
    main()
