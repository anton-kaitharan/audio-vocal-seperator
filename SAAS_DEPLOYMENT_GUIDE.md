# AuraVocal SaaS Production & Public Deployment Guide

This guide outlines how to transform this local vocal & stem separation project into a globally accessible, scalable **SaaS product**.

---

## 1. High-Level Production Architecture

```mermaid
graph TD
    Client[User Web Browser] -->|HTTPS| CDN[Vercel / Cloudflare Edge (Next.js)]
    CDN -->|API Requests| API[FastAPI / Node API Gateway (Railway / Render / Fly.io)]
    API -->|Authenticate & Quota| DB[(Supabase PostgreSQL / Redis)]
    API -->|Enqueue Audio Job| Queue[(Redis / BullMQ / Celery)]
    Queue -->|Pulls Job| GPU[Serverless GPU Workers (Modal / RunPod)]
    GPU -->|Downloads Audio| YT[YouTube / Cloudflare R2 Upload]
    GPU -->|Runs Demucs AI| Demucs[Meta Demucs htdemucs]
    GPU -->|Masters Audio| FFmpeg[FFmpeg Normalization]
    GPU -->|Uploads Stems (.wav / .mp3)| Storage[(Cloudflare R2 Storage)]
    GPU -->|WebHook: Job Done| API
    API -->|Server-Sent Events / WebSocket| Client
    Client -->|Pre-signed URL Download| Storage
```

---

## 2. Component Breakdown

### A. Frontend (Next.js 15)
* **Hosting**: [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
* **Benefits**: Instant global CDN, automatic SSL, zero server management, sub-50ms TTFB worldwide.
* **Environment Variables**:
  ```env
  NEXT_PUBLIC_API_URL=https://api.auravocal.com
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  ```

---

### B. GPU Compute Engine (The Most Important Part)
Separating vocals via Demucs is compute-heavy. CPU takes 3-6 minutes per song; an NVIDIA RTX 3090/4090 or A10G takes **15 to 30 seconds**.

#### Option 1: Serverless GPU (Recommended for SaaS Startups)
Use **[Modal.com](https://modal.com)** or **[RunPod Serverless](https://www.runpod.io/serverless-gpu)**.
* **Why**: You only pay per second of actual audio separation. When zero users are processing songs, your GPU bill is **$0.00/month**.
* **Cost**: ~$0.0005 per second on an A10G GPU (~$0.015 per 3-minute song separation).
* **Modal Code Example**:
```python
import modal

app = modal.App("auravocal-worker")
image = modal.Image.debian_slim().pip_install(
    "demucs", "torch", "yt-dlp", "ffmpeg-python"
).apt_install("ffmpeg")

@app.function(image=image, gpu="A10G", timeout=300)
def separate_track(youtube_url: str, stems: int = 2):
    # 1. Download via yt-dlp
    # 2. Run demucs
    # 3. Upload stems to S3/R2
    # 4. Return signed download URLs
    return {"status": "success", "vocals_url": "...", "backing_url": "..."}
```

#### Option 2: Dedicated GPU VPS (For High Volume)
If you process thousands of tracks per day, rent a dedicated GPU instance on [Hetzner Server Auction](https://www.hetzner.com/) or [Vast.ai](https://vast.ai):
* Fixed cost: ~$80 - $140 / month for an RTX 3090 / 4090 server.
* Can process up to 3,000+ tracks per day.

---

### C. File Storage & CDN (Cloudflare R2)
* **Why Cloudflare R2 over AWS S3?**
  * S3 charges heavy bandwidth egress fees when users download large WAV files (1411 kbps WAV is ~40-60 MB).
  * **Cloudflare R2 has $0.00 egress fees**. You only pay $0.015 / GB-month for storage.
* **Lifecycle Rule**: Configure R2 to **automatically delete generated files after 24 hours** to prevent unbounded storage costs.

---

### D. User Authentication & Monetization
* **Auth**: [Clerk](https://clerk.com) or [Supabase Auth](https://supabase.com). Free tier covers up to 10,000 monthly active users.
* **Billing**: [Stripe](https://stripe.com) or [LemonSqueezy](https://lemonsqueezy.com):
  * **Freemium Model**:
    * Free: 2 songs / day, 2 stems (Vocals + Instrumental), standard MP3 quality.
    * Pro ($9.99/mo): Unlimited songs, 4 stems (Vocals, Drums, Bass, Other), studio lossless 44.1kHz WAV, priority GPU queue.
  * **Credit Packs**:
    * 10 songs: $4.99
    * 50 songs: $19.99

---

### E. Legal & Copyright Considerations
* **YouTube Ingestion Disclaimer**: When deploying publicly, include Terms of Service stating that users must have rights or fair-use permissions for the media they separate.
* **User Audio Uploads**: Support direct `.mp3`/`.wav` file upload so musicians and producers can process their own original stems without relying solely on YouTube.

---

## 3. Quickstart Deployment Checklist

1. [ ] Deploy `frontend/` to Vercel (`vercel deploy`).
2. [ ] Wrap `watch.py` & `server.py` into a Docker container or Modal.com serverless function.
3. [ ] Set up a Cloudflare R2 bucket with 24-hour retention.
4. [ ] Point domain (e.g. `app.auravocal.com`) to Vercel.
5. [ ] Configure Stripe webhook for subscription tier upgrades.
