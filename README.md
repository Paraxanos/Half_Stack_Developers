# 👻 Ghost-Collab  
**Match. Build. Ship.**

Ghost-Collab is a student-first collaboration platform that helps university students find **project collaborators based on roles, skills, and availability** — not just social connections.

Think **Tinder for side projects**, but instead of swiping on people, you swipe on **ideas and roles**.

---

## 🚩 The Problem

Students often have strong side-project ideas but struggle to find collaborators **outside their immediate circle**.

- A CS student needs a Designer
- A Bio student needs an AI developer
- A solo builder needs a Marketing or Product partner  

Platforms like LinkedIn feel **too corporate**, and WhatsApp/Discord groups are **chaotic and unstructured**.

---

## 🎯 The Solution

Ghost-Collab enables students to:
- Discover projects that need *their* skills
- Match based on **complementary roles**, not popularity
- Quickly move from match → real-world meeting
- Collaborate without unnecessary social noise

No feeds. No DMs. Just building.

---

## ✨ Key Features

### 🔐 University-Only Access
- Secure sign-in using **Firebase Authentication**
- Restricted to `.edu` / university email domains

---

### 🧑‍💻 Builder Profiles (Work-Focused)
Profiles are designed as **working resumes**, not social bios:
- Role identity (Developer, Designer, Researcher, etc.)
- Skills & tools
- Availability & weekly commitment
- Collaboration style preferences
- Profile completeness indicator

---

### 🚀 Project-Based Matching
Users swipe on **project cards**, not people.

Each project includes:
- Vision & problem statement
- Required roles
- Expected commitment
- Tech stack (optional)
- Project stage (Idea / Prototype / MVP)

---

### 📊 Transparent Match Percentage
Every match % is **explainable**, based on:
- Skill overlap or complementarity
- Time availability
- Project duration preference
- Shared interests

Users can see *why* a match exists.

---

### 🤖 Gemini-Powered Smart Suggestions
Using the Gemini API:
- Suggests complementary collaborators
- Recommends projects users are well-suited for
- Improves clarity of project descriptions
- Sends weekly opportunity digests

Example:
> *“A Bio student just posted about Hive Monitoring — your AI skills could help.”*

---

### 📅 Smart Meeting Scheduling
- Integrated with **Google Calendar API**
- Automatically finds mutual free slots
- One-click meeting creation (no chatting required)

---

### 🧠 Productivity-First Design
Ghost-Collab avoids distractions:
- No messaging system
- No public feeds
- No likes or follower counts

The focus is **execution**, not engagement farming.

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Firebase (Auth + Database)

### APIs & Services
- Firebase Authentication
- Gemini API (AI matching & recommendations)
- Google Calendar API

---

## 🧩 Current Project Status

✅ Landing page with authentication  
✅ Innovation board with developer/project cards  
✅ Match percentage logic  
🚧 Profile setup flow (in progress)  
🚧 Project posting & refinement  
🚧 Calendar-based meeting scheduling  

---

## 🧠 Future Enhancements

- Collaboration history & credibility badges
- Lightweight reputation signals
- Team workspaces for matched collaborators
- Analytics dashboard for builders
- Mobile-first UI optimization

---

## 🚫 What We Intentionally Avoided

- Messaging systems (reduces noise & moderation overhead)
- Social feeds
- Public comments
- Rating/review systems

Ghost-Collab is **not a social network** — it's a builder network.

---

## 👥 Who Is This For?

- University students
- Hackathon participants
- Solo builders
- Early-stage startup enthusiasts
- Anyone who wants to *build*, not scroll

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Setup

Configure Firebase and other services:

```bash
# Interactive setup
npm run setup:firebase
```

Or manually edit `.env.local` with your credentials.

See **[QUICK_START.md](./QUICK_START.md)** for the 3-step setup guide.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [QUICK_START.md](./QUICK_START.md) | Quick 3-step setup guide |
| [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) | Complete production deployment |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase configuration details |
| [SETUP_README.md](./SETUP_README.md) | Troubleshooting & status |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Three.js** - 3D background effects

### Backend
- **Node.js** + **Express.js**
- **Firebase Admin SDK** - Server-side operations
- **Firestore** - Database
- **Firebase Authentication** - User auth

### APIs & Services
- **Firebase Auth** - Google + Email/Password sign-in
- **Gemini API** - AI-powered match analysis
- **Resend/SendGrid** - Email notifications

---

## 📁 Project Structure

```
Half_Stack_Developers/
├── app/
│   ├── api/                    # API routes
│   │   ├── gemini/            # AI alignment API
│   │   └── meetups/           # Meetup email API
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── components/        # Dashboard UI components
│   │   ├── add-project/       # Create project page
│   │   └── meetups/schedule/  # Schedule meetup page
│   ├── pages/                  # Landing page components
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── backend/                    # Express backend
│   ├── middleware/            # Auth middleware
│   ├── routes/                # API routes
│   └── firebaseAdmin.js       # Firebase Admin init
├── components/                 # React components
├── contexts/                   # React Context (Auth)
├── lib/                        # Utilities
│   ├── firebase-admin.ts      # Server-side Firebase
│   ├── firebase-client.ts     # Client-side Firebase
│   └── email/                 # Email templates
├── hooks/                      # Custom React hooks
└── scripts/                    # Setup scripts
```

---

## 🔐 Environment Variables

Required for production:

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Services
GEMINI_API_KEY=
RESEND_API_KEY=
```

See `.env.example` for full list.

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Push to Git
git push origin main

# Then in Vercel dashboard:
# 1. Import repository
# 2. Add environment variables
# 3. Deploy
```

Environment variables needed in Vercel:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`

See **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** for detailed deployment guide.

---

## 📝 License

MIT License - feel free to use this for your own projects!

---

## 👻 Ghost Collab Team

Built with ❤️ for student developers.


