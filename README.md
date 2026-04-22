# 🎮 iwantwhatiwant.co — Educational Platform

> Learn anything. Own your progress. Built for the next generation.

A Roblox-inspired educational platform where learning feels like playing — immersive, social, and rewarding.

---

## 🧠 Vision

`iwantwhatiwant.co` is an interactive learning platform that borrows the energy of Roblox:
- **World-based learning** — courses feel like levels, not lectures
- **Avatar & progression system** — students earn XP, badges, and unlock content
- **Social by default** — learn alongside others in shared spaces
- **Creator ecosystem** — educators can build and publish their own learning worlds

---

## 🏗️ Tech Stack (Proposed)

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom game-inspired UI kit |
| 3D / Worlds | Three.js or Babylon.js |
| Auth | NextAuth.js |
| Database | Supabase (Postgres + Realtime) |
| Media | Cloudflare R2 |
| Deployment | Vercel |

---

## 📁 Project Structure

```
/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Login, signup
│   ├── (platform)/       # Core platform pages
│   │   ├── dashboard/    # Student home base
│   │   ├── worlds/       # Course worlds browser
│   │   └── profile/      # Avatar + XP + badges
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── ui/               # Design system primitives
│   ├── game/             # Game-feel components (XP bars, badges, etc.)
│   └── worlds/           # 3D world components
├── lib/                  # Shared utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── public/               # Static assets
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/vanta722/iwantwhatiwant.git
cd iwantwhatiwant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Phase 1 MVP Features

- [ ] User auth (sign up / login)
- [ ] Student dashboard with avatar
- [ ] XP + leveling system
- [ ] Course world browser
- [ ] First sample learning world (interactive)
- [ ] Progress tracking

---

## 🌐 Domain

**[iwantwhatiwant.co](https://iwantwhatiwant.co)**

---

## 📄 License

Private — All rights reserved.
