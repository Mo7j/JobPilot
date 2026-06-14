"""Playwright verification of the JobPilot landing page."""
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5198"
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
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1500)

    check("hero headline", page.locator("text=while you sleep").count() > 0)
    check("nav links", page.locator("nav a[href='#crew']").count() > 0)
    check("demo CTA", page.locator("text=Try the live demo").count() > 0)

    # broken images? scroll the whole page first so lazy images actually load
    page.evaluate(
        """async () => {
          // reveal animations grow the page, so scroll in passes and dwell at the bottom
          for (let pass = 0; pass < 2; pass++) {
            for (let y = 0; y <= document.body.scrollHeight; y += 600) {
              window.scrollTo(0, y);
              await new Promise(r => setTimeout(r, 100));
            }
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 800));
          }
          window.scrollTo(0, 0);
        }"""
    )
    broken = []
    for _ in range(20):  # poll up to ~5s for lazy decodes to settle
        broken = page.evaluate(
            "[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)"
        )
        if not broken:
            break
        page.wait_for_timeout(250)
    check(f"all images load ({len(page.locator('img').all())} imgs)", len(broken) == 0)
    if broken:
        print("  broken:", broken[:5])

    page.screenshot(path=str(SHOTS / "landing-hero.png"))

    # anchor scrolls
    page.click("nav a[href='#crew']")
    page.wait_for_timeout(900)
    check("crew section visible", page.locator("text=Setup Agent").first.is_visible())
    page.screenshot(path=str(SHOTS / "landing-crew.png"))

    # FAQ accordion
    page.click("nav a[href='#faq']")
    page.wait_for_timeout(800)
    page.locator("text=Can it apply to jobs without me noticing?").click()
    page.wait_for_timeout(400)
    check("faq opens", page.locator("text=approval queue until you tap Approve").count() > 0)

    # full-page shot for the README
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1200)

    # mobile
    mpage = browser.new_page(viewport={"width": 390, "height": 844})
    mpage.goto(BASE, wait_until="networkidle")
    mpage.wait_for_timeout(1200)
    check("mobile renders hero", mpage.locator("text=while you sleep").count() > 0)
    h_overflow = mpage.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
    check("no horizontal overflow on mobile", not h_overflow)
    mpage.screenshot(path=str(SHOTS / "landing-mobile.png"))

    browser.close()

real_errors = [e for e in errors if "favicon" not in e.lower()]
if real_errors:
    print("\nCONSOLE ERRORS:")
    for e in real_errors[:8]:
        print("  ", e[:200])
failed = [n for n, ok in checks if not ok]
print(f"\n{len(checks) - len(failed)}/{len(checks)} checks passed")
if failed or real_errors:
    raise SystemExit(1)
print("ALL OK")
