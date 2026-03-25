# Book Search Assistant

## Требования

- Node.js 20+
- pnpm
- PostgreSQL 15+
- Ключ Mistral API (`MISTRAL_API_KEY`)

## Установка

```powershell
cd C:\Users\miraveta\Desktop\Book-Search-Assistant
npm i -g pnpm
pnpm install
```

## Переменные окружения

Создай `.env` в корне:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
DATABASE_URL=postgres://bookuser:bookpass@localhost:5432/bookdb
```
```Если нет своего ключа
ahf39JhR1kwmHEO1cP4UyT4KxD4w6V5E
```
Не коммить `.env`. Ключи, которые попали в чат или в git, нужно отозвать в [консоли Mistral](https://console.mistral.ai/) и выпустить новый.

API не подхватывает `.env` сам по себе: задай `PORT`, `DATABASE_URL`, `MISTRAL_API_KEY` в PowerShell (как ниже) или используй свой способ загрузки env.

## Локальный запуск без полного Docker

### 1) PostgreSQL должен быть доступен

Ошибка вроде `ECONNREFUSED` при запросах к БД значит: **Postgres не запущен** или **`DATABASE_URL` указывает не туда**.

**Вариант A — только база в Docker** (остальной стек можно не поднимать):

```powershell
cd C:\Users\miraveta\Desktop\Book-Search-Assistant
docker compose up -d db
```

Подожди, пока контейнер станет healthy (10–30 с), затем один раз создай таблицы:

```powershell
$env:DATABASE_URL="postgres://bookuser:bookpass@localhost:5432/bookdb"
pnpm --filter @workspace/db push
```

**Вариант B** — установленный на Windows PostgreSQL: создай пользователя `bookuser`, пароль `bookpass`, базу `bookdb`, затем тот же `DATABASE_URL` и `pnpm --filter @workspace/db push`.

### 2) Запусти API (терминал 1)

```powershell
cd C:\Users\miraveta\Desktop\Book-Search-Assistant
$env:PORT="8080"
$env:DATABASE_URL="postgres://bookuser:bookpass@localhost:5432/bookdb"
$env:MISTRAL_API_KEY="your_real_key"
$env:NODE_ENV="development"
pnpm --filter @workspace/api-server dev
```

### 3) Запусти Web (терминал 2)

```powershell
cd C:\Users\miraveta\Desktop\Book-Search-Assistant
$env:PORT="3000"
$env:BASE_PATH="/"
pnpm --filter @workspace/book-search dev
```

Открыть: [http://localhost:3000](http://localhost:3000)

## Проверка API

Открыть: [http://localhost:8080/api/healthz](http://localhost:8080/api/healthz)

`healthz` не проверяет БД. Если в логах API есть `ECONNREFUSED` к postgres — сначала подними PostgreSQL и выполни `pnpm --filter @workspace/db push`.

## Полезные команды

```powershell
pnpm run typecheck
pnpm run build
```

## Технологический стек
Языки программирования: 'TypeScript, JavaScript, CSS, HTML, Batchfile, Shell'

Искусственный интеллект: 'Mistral AI API'

База данных: 'PostgreSQL 15+'


Пример работы, а также загрузки книг, можно увидеть на видео, которое прикреплено на яндекс диске.
