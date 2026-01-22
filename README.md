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

Ghost-Collab is **not a social network** — it’s a builder network.

---

## 👥 Who Is This For?

- University students
- Hackathon participants
- Solo builders
- Early-stage startup enthusiasts
- Anyone who wants to *build*, not scroll

