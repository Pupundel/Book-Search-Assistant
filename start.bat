@echo off
chcp 65001 > nul

powershell -NoProfile -Command ^
  "Write-Host ''; " ^
  "Write-Host '  +---------------------------------------------------------+' -ForegroundColor DarkCyan; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkCyan; " ^
  "Write-Host '  ^|   BOOK-SEARCH-ASSISTANT                                 ^|' -ForegroundColor Cyan; " ^
  "Write-Host '  ^|   AI-powered book search with Mistral                   ^|' -ForegroundColor White; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkCyan; " ^
  "Write-Host '  +---------------------------------------------------------+' -ForegroundColor DarkCyan; " ^
  "Write-Host ''"

echo.

:: ── Step 1: Check .env ──────────────────────────────────────────────
powershell -NoProfile -Command "Write-Host '  [1/4] Checking configuration...' -ForegroundColor White"

if not exist .env (
    if exist .env.example (
        copy .env.example .env > nul
        powershell -NoProfile -Command "Write-Host '  [!] .env not found — created from template.' -ForegroundColor Yellow"
        powershell -NoProfile -Command "Write-Host '      Set your MISTRAL_API_KEY inside .env' -ForegroundColor Yellow"
        powershell -NoProfile -Command "Write-Host '      Get key: https://console.mistral.ai/' -ForegroundColor DarkGray"
        echo.
        powershell -NoProfile -Command "Write-Host '  Opening .env in Notepad...' -ForegroundColor DarkGray"
        notepad .env
        echo.
        powershell -NoProfile -Command "Write-Host '  Save .env, then run start.bat again.' -ForegroundColor Yellow"
        echo.
        pause
        exit /b 0
    ) else (
        powershell -NoProfile -Command "Write-Host '  [!] .env not found. Create it manually:' -ForegroundColor Red"
        powershell -NoProfile -Command "Write-Host '      MISTRAL_API_KEY=your_key_here' -ForegroundColor DarkGray"
        echo.
        pause
        exit /b 1
    )
)
powershell -NoProfile -Command "Write-Host '  [OK] .env found' -ForegroundColor Green"

:: ── Step 2: Check Docker ─────────────────────────────────────────────
powershell -NoProfile -Command "Write-Host '  [2/4] Checking Docker...' -ForegroundColor White"

docker info > nul 2>&1
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [!] Docker is not running or not installed.' -ForegroundColor Red"
    powershell -NoProfile -Command "Write-Host '      Download: https://www.docker.com/products/docker-desktop/' -ForegroundColor DarkGray"
    echo.
    pause
    exit /b 1
)
powershell -NoProfile -Command "Write-Host '  [OK] Docker is running' -ForegroundColor Green"

:: ── Step 3: Build ────────────────────────────────────────────────────
powershell -NoProfile -Command "Write-Host '  [3/4] Building images (first run may take a few minutes)...' -ForegroundColor White"

docker compose build --quiet
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [!] Build failed. Check output above.' -ForegroundColor Red"
    echo.
    pause
    exit /b 1
)
powershell -NoProfile -Command "Write-Host '  [OK] Images ready' -ForegroundColor Green"

:: ── Step 4: Start ────────────────────────────────────────────────────
powershell -NoProfile -Command "Write-Host '  [4/4] Starting services...' -ForegroundColor White"

docker compose up -d
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [!] Failed to start. Check output above.' -ForegroundColor Red"
    echo.
    pause
    exit /b 1
)

echo.
powershell -NoProfile -Command ^
  "Write-Host '  +---------------------------------------------------------+' -ForegroundColor DarkGreen; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkGreen; " ^
  "Write-Host '  ^|   App is running!                                       ^|' -ForegroundColor Green; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkGreen; " ^
  "Write-Host '  ^|   Open:  http://localhost:3000                          ^|' -ForegroundColor Cyan; " ^
  "Write-Host '  ^|   API:   http://localhost:8080/api                      ^|' -ForegroundColor DarkGray; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkGreen; " ^
  "Write-Host '  ^|   Stop:  docker compose down                            ^|' -ForegroundColor DarkGray; " ^
  "Write-Host '  ^|   Logs:  docker compose logs -f                         ^|' -ForegroundColor DarkGray; " ^
  "Write-Host '  ^|                                                         ^|' -ForegroundColor DarkGreen; " ^
  "Write-Host '  +---------------------------------------------------------+' -ForegroundColor DarkGreen"

echo.
set /p "OPEN=  Open browser now? [Y/N]: "
if /i "%OPEN%"=="Y" start http://localhost:3000
if /i "%OPEN%"=="y" start http://localhost:3000

echo.
pause
