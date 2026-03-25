@echo off
chcp 65001 > nul

powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  ============================================================' -ForegroundColor DarkCyan"
powershell -NoProfile -Command "Write-Host '                                                              ' -ForegroundColor DarkCyan"
powershell -NoProfile -Command "Write-Host '    BOOK-SEARCH-ASSISTANT                                    ' -ForegroundColor Cyan"
powershell -NoProfile -Command "Write-Host '    AI-powered book search  //  Mistral RAG                 ' -ForegroundColor Gray"
powershell -NoProfile -Command "Write-Host '                                                              ' -ForegroundColor DarkCyan"
powershell -NoProfile -Command "Write-Host '  ============================================================' -ForegroundColor DarkCyan"
powershell -NoProfile -Command "Write-Host ''"

powershell -NoProfile -Command "Write-Host '  [1/4] Checking configuration...' -ForegroundColor White"

if not exist .env (
    if exist .env.example (
        copy .env.example .env > nul
        powershell -NoProfile -Command "Write-Host '  [~] .env created from template.' -ForegroundColor Yellow"
        powershell -NoProfile -Command "Write-Host '      Add your MISTRAL_API_KEY to .env' -ForegroundColor Yellow"
        powershell -NoProfile -Command "Write-Host '      Get key: https://console.mistral.ai/' -ForegroundColor DarkGray"
        powershell -NoProfile -Command "Write-Host ''"
        powershell -NoProfile -Command "Write-Host '  Opening .env in Notepad...' -ForegroundColor DarkGray"
        notepad .env
        powershell -NoProfile -Command "Write-Host '  Save the file and run start.bat again.' -ForegroundColor Yellow"
        powershell -NoProfile -Command "Write-Host ''"
        pause
        exit /b 0
    ) else (
        powershell -NoProfile -Command "Write-Host '  [X] .env not found. Create it manually:' -ForegroundColor Red"
        powershell -NoProfile -Command "Write-Host '      MISTRAL_API_KEY=your_key_here' -ForegroundColor DarkGray"
        powershell -NoProfile -Command "Write-Host ''"
        pause
        exit /b 1
    )
)
powershell -NoProfile -Command "Write-Host '  [OK] .env found' -ForegroundColor Green"

powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  [2/4] Checking Docker...' -ForegroundColor White"

docker info > nul 2>&1
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [X] Docker is not running or not installed.' -ForegroundColor Red"
    powershell -NoProfile -Command "Write-Host '      Download: https://www.docker.com/products/docker-desktop/' -ForegroundColor DarkGray"
    powershell -NoProfile -Command "Write-Host ''"
    pause
    exit /b 1
)
powershell -NoProfile -Command "Write-Host '  [OK] Docker is running' -ForegroundColor Green"

powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  [3/4] Building images (first run may take a few minutes)...' -ForegroundColor White"

docker compose build --quiet
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [X] Build failed. Check output above.' -ForegroundColor Red"
    powershell -NoProfile -Command "Write-Host ''"
    pause
    exit /b 1
)
powershell -NoProfile -Command "Write-Host '  [OK] Images ready' -ForegroundColor Green"

powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  [4/4] Starting services...' -ForegroundColor White"

docker compose up -d
if errorlevel 1 (
    powershell -NoProfile -Command "Write-Host '  [X] Failed to start. Check output above.' -ForegroundColor Red"
    powershell -NoProfile -Command "Write-Host ''"
    pause
    exit /b 1
)

powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  ============================================================' -ForegroundColor DarkGreen"
powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '    App is running!' -ForegroundColor Green"
powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '    Open:    http://localhost:3000' -ForegroundColor Cyan"
powershell -NoProfile -Command "Write-Host '    API:     http://localhost:8080/api' -ForegroundColor DarkGray"
powershell -NoProfile -Command "Write-Host '    Stop:    docker compose down' -ForegroundColor DarkGray"
powershell -NoProfile -Command "Write-Host '    Logs:    docker compose logs -f' -ForegroundColor DarkGray"
powershell -NoProfile -Command "Write-Host ''"
powershell -NoProfile -Command "Write-Host '  ============================================================' -ForegroundColor DarkGreen"
powershell -NoProfile -Command "Write-Host ''"

set /p "OPEN=  Open browser now? [Y/N]: "
if /i "%OPEN%"=="Y" start http://localhost:3000
if /i "%OPEN%"=="y" start http://localhost:3000

powershell -NoProfile -Command "Write-Host ''"
pause
