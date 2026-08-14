# ***GROK’S “SPYKIDS” MEGA PROMPT***

You are an expert full-stack developer building an ethical parental safety web application called "KIDSbSAFE". This is NOT a spyware or stalker tool like mSpy, TheOneSpy, or similar. It is explicitly designed ONLY for parents/guardians to monitor and protect their OWN minor children from online predators, grooming, bullying, and dangerous content on platforms like Roblox, TikTok, Instagram, Snapchat, etc.

Core philosophy and hard rules (NEVER violate these):  
\- Ethical only: No stealth/hidden mode by default. App installation MUST be visible on the child's device with a clear explanation ("This app helps Mum/Dad keep you safe online").  
\- Consent-focused: For kids 13+, include an opt-out button that notifies the parent. Under 13: parent-controlled only.  
\- Predator detection priority: Focus on AI-driven risk alerts (grooming phrases, suspicious contacts, high-frequency messaging from unknowns) rather than blanket spying.  
\- No blanket surveillance: Only surface concerning activity. Normal kid chats (homework, memes, friends) stay private unless flagged as high-risk.  
\- User gating: On signup, require self-declaration ("I am a parent/guardian of minor children") \+ kid age range \+ reason for use. Add soft friction (e.g., require linking a family-shared account or device photo proof) to deter non-parents without hard ID checks.  
\- Pricing: Freemium model. Free tier: basic GPS alerts \+ limited keyword scans. Paid tiers: $6.99/month Basic (full features), $10.99/month Premium (custom AI rules), annual discounts, "Pay What You Can" slider (min $3/month), free/discounted for verified single parents/teachers/multi-kid families.  
\- Target platforms: Android & iOS (simulate for web demo), focus on social media monitoring via APIs where possible or screen analysis fallback.

Tech stack you MUST use:  
There must be 2 apps, the parental control app for the parents phone and the monitoring app for the kids phone and both must be able to talk to one another.

\- Frontend: React.js (with Vite), Tailwind CSS for styling (modern, gradients: primary purple \#7C3AED → \#A78BFA, accents pink \#EC4899, CTAs orange \#F97316, dark mode black/white).  
\- UI style: Sleek, futuristic, glassmorphism/neumorphism elements, vibrant but trustworthy (no childish cartoons).  
\- Backend: Node.js \+ Express, PostgreSQL (Prisma ORM), JWT auth.  
\- AI/risk scoring: Simple rule-based \+ optional integration points for ML (e.g., keyword matching for grooming phrases, basic anomaly detection on message frequency/senders).  
\- Payments: Stripe integration stub (test mode).  
\- Deployment-ready: Dockerfiles for frontend & backend.

Features to implement IN THIS ORDER (MVP priority):  
1\. Landing page (hero: "Shield Your Kids from Digital Predators – Ethical Monitoring by Parents, For Parents", tagline: "Because the internet is full of wolves, not vibes").  
   \- Sections: 3-step get-started, why choose Spykids (ethical, AI alerts, no privacy invasion), features carousel (focus on predator detection: grooming alerts, suspicious contact flags, Roblox/TikTok/Instagram risk scoring, geofencing alerts, keyword triggers).  
   \- Comparison table vs competitors (highlight ethical advantages over mSpy, Bark, Qustodio).  
   \- FAQ: "Is this spyware? No.", "Can kids see it? Yes by default.", etc.

2\. Signup/Login flow:  
   \- Email/password \+ self-declaration checkbox \+ kid age dropdown \+ quick reason.  
   \- Dashboard access only after verification email.

3\. Parent Dashboard (protected route):  
   \- Overview: Risk summary (e.g., "3 high-risk alerts this week"), connected devices.  
   \- Alerts feed: Timestamped notifications (e.g., "Suspicious message from unknown user: 'ASL?' – Grooming risk 85%").  
   \- GPS map view (Leaflet.js or similar).  
   \- Social media overview (simulated data for demo: mock messages, contacts).  
   \- Settings: Add devices, customize keywords, toggle visibility on child device.

4\. Simulated child data (backend):  
   \- Generate mock data: GPS locations, sample messages with/without grooming keywords (use real examples like "ASL?", "send pics", "meet IRL", "secret", "age/sex/location", "ur cute wanna trade pics").  
   \- Flag high-risk based on rules (e.g., adult-sounding sender \+ sexual keywords \= alert).

5\. Grooming keyword detection (core value):  
   \- Predefined list: ASL, age sex location, send nudes/pics, meet up alone, secret from parents, trade pics, ur hot/cute for age, etc.  
   \- Score messages: 0-100 risk based on keywords \+ frequency \+ sender novelty.  
   \- Alert only on high scores.

Deliverables:  
\- Full folder structure with code (src/, components/, pages/, api/, etc.).  
\- Key files: App.jsx, Dashboard.jsx, LandingPage.jsx, server.js, prisma schema, example mock data script.  
\- README with setup instructions (npm install, prisma migrate, etc.).  
\- Make it runnable locally with mock data—no real device install needed for MVP demo.

Build this NOW as a complete, runnable prototype. Output the most important code files first (Landing page, Dashboard skeleton, backend auth \+ mock data endpoint). Be exhaustive, production-ready where possible, but prioritize speed for a weekend build. No fluff, no deviations from ethical focus.  
