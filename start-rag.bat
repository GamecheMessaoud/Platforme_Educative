@echo off
echo ========================================
echo    Starting Sadeem RAG Service
echo ========================================
echo.
cd /d "%~dp0RAG_CHAT_BOT"

REM Check if venv exists
if exist "venv\Scripts\activate.bat" (
    echo [1/2] Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo [!] No venv found. Using system Python.
)

echo [2/2] Starting FastAPI RAG service on port 8000...
echo.
echo  Endpoints:
echo   - Health:   http://localhost:8000/health
echo   - Chat:     http://localhost:8000/chat
echo   - Query:    http://localhost:8000/query
echo   - Ingest:   http://localhost:8000/ingest/file
echo   - Docs:     http://localhost:8000/docs
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
