@echo off
chcp 65001 > nul
for /F "delims=" %%A in ('powershell -Command "[char]27"') do set "ESC=%%A"

set "C0=%ESC%[0m"
set "BOLD=%ESC%[1m"
set "DIM=%ESC%[2m"
set "CYAN=%ESC%[96m"
set "BLUE=%ESC%[94m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "RED=%ESC%[91m"
set "WHITE=%ESC%[97m"
set "GRAY=%ESC%[90m"

cls
echo.
echo %CYAN%%BOLD%  ██████╗  ██████╗  ██████╗ ██╗  ██╗  ███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗%C0%
echo %CYAN%%BOLD%  ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝  ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║%C0%
echo %CYAN%%BOLD%  ██████╔╝██║   ██║██║   ██║█████╔╝   ███████╗█████╗  ███████║██████╔╝██║     ███████║%C0%
echo %CYAN%%BOLD%  ██╔══██╗██║   ██║██║   ██║██╔═██╗   ╚════██║██╔══╝  ██╔══██║██╔══██╗██║     ██╔══██║%C0%
echo %CYAN%%BOLD%  ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗  ███████║███████╗██║  ██║██║  ██║╚██████╗██║  ██║%C0%
echo %CYAN%%BOLD%  ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝%C0%
echo.
echo %BLUE%%BOLD%                         A S S I S T A N T   —   AI Book Search%C0%
echo %GRAY%  ─────────────────────────────────────────────────────────────────────────────%C0%
echo.

echo %WHITE%%BOLD%  Шаг 1 из 4  —  Проверка конфигурации%C0%
echo.
if not exist .env (
    if exist .env.example (
        echo %YELLOW%  [~] Файл .env не найден. Создаю из шаблона...%C0%
        copy .env.example .env > nul
        echo.
        echo %RED%  [!] Укажите ваш MISTRAL_API_KEY в файле .env%C0%
        echo %GRAY%      Получить ключ: https://console.mistral.ai/%C0%
        echo.
        echo %GRAY%  Нажмите любую клавишу, чтобы открыть .env для редактирования...%C0%
        pause > nul
        notepad .env
        echo.
        echo %YELLOW%  После сохранения .env запустите start.bat ещё раз.%C0%
        echo.
        pause
        exit /b 0
    ) else (
        echo %RED%  [!] Файл .env не найден. Создайте его вручную:%C0%
        echo %GRAY%      MISTRAL_API_KEY=ваш_ключ%C0%
        echo.
        pause
        exit /b 1
    )
)
echo %GREEN%  [+] Файл .env найден%C0%
echo.

echo %WHITE%%BOLD%  Шаг 2 из 4  —  Проверка Docker%C0%
echo.
docker info > nul 2>&1
if errorlevel 1 (
    echo %RED%  [!] Docker не запущен или не установлен.%C0%
    echo %GRAY%      Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/%C0%
    echo %GRAY%      После установки перезапустите компьютер и повторите.%C0%
    echo.
    pause
    exit /b 1
)
echo %GREEN%  [+] Docker запущен%C0%
echo.

echo %WHITE%%BOLD%  Шаг 3 из 4  —  Сборка и загрузка зависимостей%C0%
echo %GRAY%  (может занять несколько минут при первом запуске)%C0%
echo.
docker compose pull --quiet 2>nul
docker compose build --quiet
if errorlevel 1 (
    echo %RED%  [!] Ошибка при сборке. Проверьте вывод выше.%C0%
    echo.
    pause
    exit /b 1
)
echo %GREEN%  [+] Зависимости готовы%C0%
echo.

echo %WHITE%%BOLD%  Шаг 4 из 4  —  Запуск сервисов%C0%
echo.
docker compose up -d
if errorlevel 1 (
    echo %RED%  [!] Ошибка запуска. Проверьте вывод выше.%C0%
    echo.
    pause
    exit /b 1
)

echo.
echo %GRAY%  ─────────────────────────────────────────────────────────────────────────────%C0%
echo.
echo %GREEN%%BOLD%  Приложение запущено успешно!%C0%
echo.
echo %WHITE%  Адрес:    %CYAN%%BOLD%http://localhost:3000%C0%
echo %WHITE%  База:     %GRAY%PostgreSQL на порту 5432%C0%
echo %WHITE%  API:      %GRAY%http://localhost:8080/api%C0%
echo.
echo %GRAY%  Для остановки выполните:  docker compose down%C0%
echo %GRAY%  Логи:                     docker compose logs -f%C0%
echo.
echo %GRAY%  ─────────────────────────────────────────────────────────────────────────────%C0%
echo.

set /p "OPEN=  Открыть браузер? [Y/N]: "
if /i "%OPEN%"=="Y" start http://localhost:3000
if /i "%OPEN%"=="y" start http://localhost:3000

echo.
pause
