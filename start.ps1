# Книжный Искатель — PowerShell запуск
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Книжный Искатель — запуск на Windows  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "[!] Файл .env не найден. Создаю из шаблона..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[!] Откройте .env и укажите ваш MISTRAL_API_KEY, затем запустите снова." -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

try {
    docker info | Out-Null
} catch {
    Write-Host "[!] Docker не запущен или не установлен." -ForegroundColor Red
    Write-Host "    Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host "[*] Запускаю сервисы..." -ForegroundColor Green
docker compose up --build -d

Write-Host ""
Write-Host "[OK] Приложение запущено!" -ForegroundColor Green
Write-Host "     Откройте браузер: http://localhost:3000" -ForegroundColor White
Write-Host "     Остановить: docker compose down" -ForegroundColor Gray
Write-Host ""
Read-Host "Нажмите Enter для выхода"
