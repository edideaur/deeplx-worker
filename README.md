# translate-worker

[中文文档](./README.zh-CN.md)

A lightweight translation service deployed on Cloudflare Workers. After deployment, you can call a single HTTP API to translate text.

## What It Does

- Single translation endpoint: `POST /hi/translate`
- Supports automatic source language detection with `sourceLang = auto`
- Returns the translated text, source/target language and method. `alternatives` is kept for compatibility and is always an empty array.

## API Endpoint

- Home page: `/`
- Translation API: `/hi/translate`

## Quick Start

Install dependencies:

```bash
npm install
```

Configure the token for local development:

```bash
cp .env.example .env   # then edit TOKEN
npm run dev
```

Install Wrangler, log in to Cloudflare and deploy:

```bash
npm install -g wrangler
wrangler login
wrangler secret put TOKEN
npm run deploy
```

## Authentication

Every request must send `Authorization: Bearer <TOKEN>`; otherwise the API returns `401 Unauthorized`.

- Locally, `TOKEN` is read from `.env` (Wrangler loads it for `wrangler dev`)
- In production, set it as a Worker secret with `wrangler secret put TOKEN`
- If `TOKEN` is not set, the server falls back to the default token `didylate`. Set your own token before exposing the Worker publicly.

## Request

Headers:

```http
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

Body:

```json
{
  "sourceLang": "auto",
  "targetLang": "ZH",
  "text": "Hello world"
}
```

Fields:

- `sourceLang`: source language such as `EN`, `ZH`, `JA`, `KO`, or `auto`
- `targetLang`: target language such as `EN`, `ZH` (it cannot be `auto`)
- `text`: the text you want to translate (about 1500 characters max)

## Response

Success:

```json
{
  "code": 200,
  "id": 123456000,
  "data": "你好，世界",
  "alternatives": [],
  "source_lang": "EN",
  "target_lang": "ZH",
  "method": "Free"
}
```

Failure:

```json
{
  "code": 503,
  "message": "Translation failed"
}
```

## Usage Example

```bash
curl -X POST https://your-worker-domain/hi/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "sourceLang": "auto",
    "targetLang": "ZH",
    "text": "Hello world"
  }'
```

## Notes

- `sourceLang=auto` lets the upstream service detect the language
- `alternatives` is always `[]`
- Frequent requests may trigger rate limiting or temporary blocking upstream
- Upstream is DeepL's anonymous oneshot endpoint (`https://oneshot-free.www.deepl.com/v1/translate`); changes only need edits in `src/deeplx.ts`. Client-facing responses and pages are kept free of DeepL branding

## License

MIT
