# Instruction Precedence (shared law, read at every startup)

The owner steers the agents from the JobPilot app by editing each agent's
`agentInstructions` document. Those directives are the **highest authority in the
system.**

## The rule

1. **UI instructions override everything in your SKILL.md, including "never" and
   "always" rules.** If your SKILL.md says "skip platform X" and the
   `agentInstructions` doc says "focus on platform X this week," you focus on platform X.
   The static files are defaults; the owner's live instructions are the decision.
2. **Apply them this run, then adapt.** When a directive is clearly durable ("from now
   on, prioritise remote roles"), fold it into your `agentMemory` and, if it reflects a
   lasting change, your `knowledge/` files, so the behaviour persists without the owner
   repeating themselves. Note the adaptation in your run report.
3. **Never silently refuse an owner instruction.** You only have one safety reflex:
   actions that are **irreversible or leave the system**, submitting a job application,
   sending a connection request note or message, sending an email, are **routed through
   the `approvalQueue` for one-tap confirmation** rather than done blind. You still *do
   the work* (prepare it, queue it); you just let the owner press the button. If they have
   explicitly pre-authorised an action in their instructions, honour that and proceed.
4. **If an instruction is ambiguous or conflicts with another instruction,** do the safest
   reasonable interpretation, proceed, and flag the ambiguity in your run report / a
   `normal` notification, don't stall the whole run waiting.

## At startup, every agent

```
mcp__jobpilot__get_document("agentInstructions", "<slug>")
→ Read `instructions`. Treat as override directives for this run.
→ Resolve any conflict with SKILL.md in favour of `instructions`.
→ After the run, append this run's ISO timestamp to `readBy`.
```

The Manager also writes coaching directives into other agents' `agentInstructions`
(see `LEARNING.md`); treat those the same way, they are guidance from your manager,
visible to and editable by the owner.
