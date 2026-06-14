"""Playwright verification of the JobPilot app in demo mode.

Checks every route, the approval->pipeline flow, theme toggle persistence,
and mobile nav; captures the docs/screenshots set along the way.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5199"
ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "docs" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)

errors = []
checks = []


def check(name, cond):
    checks.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    # ── Overview ──
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1200)
    check("demo banner visible", page.locator("text=Demo mode").count() > 0)
    check("greeting renders", page.locator("text=Jane").count() > 0)
    check("stat card: pending approvals", page.locator("text=Pending approvals").count() > 0)
    check("crew activity present", page.locator("text=Crew activity").count() > 0)
    page.screenshot(path=str(SHOTS / "overview-light.png"))

    # ── Approvals: approve the Northwind CV ──
    page.click("a[href='/approvals']")
    page.wait_for_timeout(600)
    check("approvals listed", page.locator("text=CV ready, Northwind Labs").count() > 0)
    check("cv questions form present", page.locator("textarea").count() >= 2)
    page.screenshot(path=str(SHOTS / "approvals.png"))

    northwind = page.locator("article", has_text="Northwind Labs").first
    before = page.locator("article").count()
    northwind.locator("button", has_text="Approve").first.click()
    page.wait_for_timeout(800)
    after = page.locator("article").count()
    check("approval card removed after approve", after == before - 1)

    # ── Applications: the approved case moved to Application Stage ──
    page.click("a[href='/applications']")
    page.wait_for_timeout(800)
    check("pipeline columns render", page.locator("text=Your Review").count() > 0)
    app_stage = page.locator("section", has_text="Application Stage").first
    check("approved CV moved stage", app_stage.locator("text=Northwind Labs").count() > 0)
    page.screenshot(path=str(SHOTS / "applications-board.png"))

    # open detail drawer
    page.locator("button", has_text="Northwind Labs").first.click()
    page.wait_for_timeout(600)
    check("detail drawer opens", page.locator("text=Timeline").count() > 0)
    page.screenshot(path=str(SHOTS / "job-detail.png"))
    page.keyboard.press("Escape")
    page.locator("button[aria-label='Close details']").click(force=True)
    page.wait_for_timeout(400)

    # ── Agents ──
    page.click("a[href='/agents']")
    page.wait_for_timeout(600)
    check("7 agent cards", page.locator("article").count() == 7)
    check("manager error shown", page.locator("text=Evening run timed out").count() > 0)
    page.screenshot(path=str(SHOTS / "agents.png"))

    # toggle pause an agent
    toggle = page.locator("button[role='switch']").first
    toggle.click()
    page.wait_for_timeout(400)
    check("agent paused chip", page.locator("text=paused").count() > 0)
    toggle.click()  # re-enable

    # instructions editor
    page.locator("button", has_text="Custom instructions").first.click()
    page.wait_for_timeout(300)
    check("instructions editor opens", page.locator("textarea").count() > 0)

    # ── Insights ──
    page.click("a[href='/insights']")
    page.wait_for_timeout(600)
    check("reports tab", page.locator("text=Healthy pipeline").count() > 0)
    page.locator("button", has_text="Trends").click()
    page.wait_for_timeout(500)
    check("trends bars", page.locator("text=Most-requested skills").count() > 0)
    page.screenshot(path=str(SHOTS / "insights-trends.png"))
    page.locator("button", has_text="Advice").click()
    page.wait_for_timeout(400)
    check("advice cards", page.locator("text=TypeScript").count() > 0)

    # ── Tracker ──
    page.click("a[href='/tracker']")
    page.wait_for_timeout(600)
    check("tracker rows", page.locator("text=Hafenblick").count() > 0)
    page.locator("button", has_text="ATS check").click()
    page.wait_for_timeout(500)
    check("ats checker", page.locator("text=Job description").count() > 0)
    page.screenshot(path=str(SHOTS / "tracker-ats.png"))

    # ── Settings + theme toggle ──
    page.click("a[href='/settings']")
    page.wait_for_timeout(500)
    check("settings rows", page.locator("text=Appearance").count() > 0)
    page.locator("button", has_text="Switch to dark").click()
    page.wait_for_timeout(400)
    theme = page.evaluate("document.documentElement.dataset.theme")
    check("dark theme applied", theme == "dark")

    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(900)
    theme = page.evaluate("document.documentElement.dataset.theme")
    check("dark theme persists after reload", theme == "dark")
    page.screenshot(path=str(SHOTS / "overview-dark.png"))

    # back to light
    page.goto(BASE + "/settings", wait_until="networkidle")
    page.wait_for_timeout(500)
    page.locator("button", has_text="Switch to light").click()
    page.wait_for_timeout(300)

    # ── Mobile viewport ──
    mob = browser.new_context(viewport={"width": 390, "height": 844})
    mpage = mob.new_page()
    mpage.goto(BASE, wait_until="networkidle")
    mpage.wait_for_timeout(900)
    check("mobile bottom nav", mpage.locator("nav").last.locator("a").count() >= 5)
    mpage.screenshot(path=str(SHOTS / "mobile-overview.png"))
    mpage.locator("nav").last.locator("a[href='/approvals']").click()
    mpage.wait_for_timeout(600)
    check("mobile approvals route", "approvals" in mpage.url)
    mob.close()

    browser.close()

print()
real_errors = [e for e in errors if "favicon" not in e.lower()]
if real_errors:
    print("CONSOLE ERRORS:")
    for e in real_errors[:10]:
        print("  ", e[:200])
failed = [n for n, ok in checks if not ok]
print(f"\n{len(checks) - len(failed)}/{len(checks)} checks passed")
if failed or real_errors:
    raise SystemExit(1)
print("ALL OK")
