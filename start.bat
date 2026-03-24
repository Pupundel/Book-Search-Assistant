@echo off
echo ========================================
echo   Книжный Искатель — запуск на Windows
echo ========================================

if not exist .env (
    echo [!] Файл .env не найден. Создаю из шаблона...
    copy .env.example .env
    echo [!] Откройте .env и укажите ваш MISTRAL_API_KEY, затем запустите снова.
    pause
    exit /b 1
)

echo [*] Проверяю Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [!] Docker не запущен или не установлен.
    echo     Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [*] Запускаю сервисы...
docker compose up --build -d

echo.
echo [OK] Приложение запущено!
echo      Откройте браузер: http://localhost:3000
echo      Остановить: docker compose down
echo.
pause
