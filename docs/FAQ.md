# FAQ

### What does it cost to run?
JobPilot is free (MIT). You bring: a **Claude subscription** (the agents are your
Claude doing the work, heavier schedules use more of your usage) and a **Firebase
project** (the free Spark tier comfortably covers a single person's job search).
Hosting the dashboard on Netlify/Vercel is free too.

### Can it apply to jobs without me noticing?
No. Every irreversible action stops in the approval queue until you tap Approve. This
is enforced both by the agents' rules and by the pipeline's status machine (agents
literally can't see unapproved cases in their work queries). The application-writer
fills the form, screenshots it, and stops before Submit, every time.

### Where does my data live?
In the Firebase project **you** create. The app and the agents talk only to it.
There's no JobPilot backend, no analytics, no phone-home. Read the code; it's short.

### Does it work outside tech / outside my country?
Yes. Nothing about your field, market, or language is hardcoded. The setup agent
interviews you and generates a market playbook for *your* country (platforms,
employers, salary norms, work-authorization realities) and a CV per *your* market's
norms.

### Why do two users get different CV designs?
The setup agent composes your CV design from independent axes (font pairing, accent
palette, header layout, section style, bullets, spacing): over 1,000 combinations,
seeded from your identity and adjusted to your stated taste. Your resume won't look
like the next JobPilot user's.

### Will the agents lie on my CV?
They can't, by construction. Your skills are sorted into three tiers during setup;
the "never claim" tier is banned from every generated document, and an agent that's
unsure must send you a question instead of guessing. Honesty is the whole point: one
flagged lie ends a hiring process.

### Is the LinkedIn automation safe?
It's deliberately conservative (low volume, human pace, hard caps, notes always
approval-gated), but automating LinkedIn can still violate its Terms of Service.
That's your call; the connection-builder ships enabled but is one toggle to turn off,
and the rest of the system works fine without it.

### What exactly do I need Claude in Chrome for?
Live job-board search, application form filling, and LinkedIn. Without it, job-search
degrades to fetch-only platforms, and application-writer drafts everything as text
for you to paste manually. The pipeline still works, just with more taps from you.

### Demo vs the real thing?
The demo (the "Try it" link) runs entirely in your browser on fictional sample data:
no backend, nothing saved, refresh to reset. The real thing is the same app connected
to your Firebase, with the agents actually running on your Claude.

### Can I change how an agent behaves?
Three levels: (1) type instructions into its card in the app, which override its
rules from the next run; (2) pause it with the toggle; (3) edit its `SKILL.md` or
knowledge files directly, since it's all plain markdown.

### What if I already track applications somewhere?
The Tracker page is a manual tracker (with an ATS keyword checker) that lives
alongside the agent pipeline. Applications you sent yourself go there, and the
application-writer adds a row for everything it submits, so one page has everything.

### Multi-user? Teams?
No, one deployment is one person's job search, locked to one account. Fork freely.
