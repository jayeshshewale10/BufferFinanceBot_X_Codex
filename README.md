# X Finance + Geopolitics Bot

Posts twice daily on X through Buffer:

- 9:00 AM IST: investing motivation post with a locally generated image
- 6:00 PM IST: trending geopolitics to market-impact explainer with a locally generated infographic

No paid image generator is used. Investing images are created locally with SVG templates rendered to PNG with `sharp`. Geopolitics images use a free no-key Pollinations image endpoint for the cinematic background, then the bot adds readable poster text and impact icons locally. If the free image endpoint is unavailable, the bot falls back to a local infographic.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Add Buffer credentials to `.env`:

```env
BUFFER_API_KEY=...
BUFFER_CHANNEL_ID=...
BUFFER_PUBLIC_IMAGE_BASE_URL=https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/public/generated
DRY_RUN=false
```

Optional:

```env
ENABLE_FREE_AI_IMAGES=true
```

Do not commit `.env`. The Buffer API key belongs in local environment variables or GitHub Actions secrets.

4. Find your Buffer channel ID:

```bash
npm run buffer:channels
```

If `npm` is not available on Windows:

```powershell
.\scripts\buffer-channels.ps1
```

Copy the X/Twitter channel ID into `BUFFER_CHANNEL_ID`.

## Test Locally

Generate content and images without posting:

```bash
npm run dry:all
```

If `npm` is not available on Windows:

```powershell
cd "C:\Users\Nikita kadam\Documents\Codex\2026-05-06\you-are-a-viral-content-strategist"
.\scripts\dry-all.ps1
```

Validate generated content and images:

```powershell
.\scripts\validate-generated.ps1
```

Test Buffer by creating a draft only, without publishing:

```powershell
.\scripts\buffer-draft-test.ps1
```

Generate the daily high-visibility reply plan:

```powershell
.\scripts\reply-plan.ps1
```

Post manually:

```bash
npm run morning
npm run evening
```

Generated previews are saved in `public/generated/YYYY-MM-DD/`.

## GitHub Actions Automation

Add these repository secrets:

- `BUFFER_API_KEY`
- `BUFFER_CHANNEL_ID`
- `BUFFER_PUBLIC_IMAGE_BASE_URL`

The workflow in `.github/workflows/post-to-x.yml` runs and publishes immediately through Buffer at:

- `03:30 UTC` = `09:00 IST`
- `12:30 UTC` = `18:00 IST`

GitHub cron can drift by a few minutes. That is normal.

## Notes

- X API access is required to post automatically.
- Buffer needs a public image URL. The included GitHub Actions workflow commits generated images to `public/generated/`, then posts using your configured public raw GitHub URL.
- The evening post uses free public RSS feeds, then converts the top market-relevant geopolitical headline into a beginner-friendly post.
- If a post exceeds 280 characters, the bot converts it into a short thread.
