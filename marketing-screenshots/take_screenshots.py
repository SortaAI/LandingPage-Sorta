#!/usr/bin/env python3
"""
Playwright marketing screenshots for getsorta.io (Sorta v1 SPA).
Run from project root after: python seed.py && python marketing-screenshots/seed_api.py
Requires: pip install playwright && playwright install chromium

Usage: python marketing-screenshots/take_screenshots.py
"""
from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import Page, async_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
STATE_PATH = HERE / ".seed_state.json"

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = f"http://localhost:3000/?api={BACKEND_URL}"

VIEWPORT = {"width": 1920, "height": 1080}
DEVICE_SCALE_FACTOR = 2

OUTPUT_DIR = HERE
DETAIL_DIR = HERE / "details"

TOKEN_KEY = "formsync_token"

EMAIL = "admin@elpasoft.io"
PASSWORD = "SortaDemo2025!"
TORRES_PHONE = "9155550142"


def _out(name: str) -> Path:
    return OUTPUT_DIR / f"{name}.png"


def _detail(name: str) -> Path:
    return DETAIL_DIR / f"{name}.png"


async def inject_token(page: Page, token: str) -> None:
    await page.evaluate(
        """(t) => {
          localStorage.setItem('formsync_token', t);
          sessionStorage.setItem('sorta_tenant_name', 'El Paso Physical Therapy');
        }""",
        token,
    )
    await page.goto(FRONTEND_URL, wait_until="domcontentloaded")


async def wait_for_api_idle(page: Page) -> None:
    await page.wait_for_load_state("networkidle")
    await page.wait_for_timeout(800)


async def full_shot(page: Page, filename: str) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = _out(filename)
    try:
        await page.screenshot(path=str(path), full_page=False, scale="device")
    except TypeError:
        await page.screenshot(path=str(path), full_page=False)


async def detail_shot(
    page: Page, selector: str, filename: str, padding: int = 20
) -> None:
    DETAIL_DIR.mkdir(parents=True, exist_ok=True)
    el = page.locator(selector).first
    await el.wait_for(state="visible", timeout=30_000)
    box = await el.bounding_box()
    if not box:
        print(f"skip detail (no box): {filename} ({selector})", file=sys.stderr)
        return
    vw = page.viewport_size or VIEWPORT
    clip = {
        "x": max(0, box["x"] - padding),
        "y": max(0, box["y"] - padding),
        "width": box["width"] + padding * 2,
        "height": box["height"] + padding * 2,
    }
    if clip["x"] + clip["width"] > vw["width"]:
        clip["width"] = vw["width"] - clip["x"]
    if clip["y"] + clip["height"] > vw["height"]:
        clip["height"] = vw["height"] - clip["y"]
    path = _detail(filename)
    try:
        await page.screenshot(path=str(path), clip=clip, scale="device")
    except TypeError:
        await page.screenshot(path=str(path), clip=clip)


async def wait_dashboard_ready(page: Page) -> None:
    await page.wait_for_selector("#homescreen:not(.hidden)", timeout=60_000)
    await page.wait_for_function(
        """() => {
          const bad = [1,2,3,4].some(i => {
            const el = document.querySelector('#hs-stat-num-' + i);
            return el && el.querySelector('.hs-shimmer');
          });
          return !bad;
        }""",
        timeout=60_000,
    )
    await page.wait_for_selector(".hs-stat-card.hs-stat-in", timeout=30_000)
    await page.wait_for_function(
        """() => {
          const h = document.getElementById('hs-greeting');
          return h && (h.textContent || '').trim().length > 5;
        }""",
        timeout=30_000,
    )
    await page.wait_for_selector("#hs-queue-list .hs-queue-row", timeout=30_000)


async def run() -> None:
    if not STATE_PATH.is_file():
        print(f"Missing {STATE_PATH}. Run: python marketing-screenshots/seed_api.py", file=sys.stderr)
        sys.exit(1)

    state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    token = state["token"]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DETAIL_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=DEVICE_SCALE_FACTOR,
            color_scheme="light",
            reduced_motion="reduce",
        )
        page = await context.new_page()

        # --- SCREEN 1: Login / Auth card (no token) ---
        await context.clear_cookies()
        await page.goto("about:blank")
        await page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
        await page.goto(FRONTEND_URL, wait_until="domcontentloaded")
        await page.wait_for_selector("#auth-card:not(.hidden)", timeout=30_000)
        await page.locator("#auth-email").fill(EMAIL)
        await page.locator("#auth-password").fill(PASSWORD)
        await wait_for_api_idle(page)
        await full_shot(page, "01_login_screen")
        await detail_shot(page, ".auth-card", "detail_01_auth_card")

        # --- SCREEN 2: Dashboard ---
        await inject_token(page, token)
        await page.wait_for_selector("#app:not(.hidden)", timeout=30_000)
        await wait_dashboard_ready(page)
        await wait_for_api_idle(page)
        await full_shot(page, "02_dashboard_homescreen")
        await detail_shot(page, ".hs-banner", "detail_02_dashboard_banner")
        await detail_shot(page, ".hs-stats-grid", "detail_02_stats_grid")
        await detail_shot(page, "#hs-queue-panel", "detail_02_patient_queue")

        # --- SCREEN 3: Step 1 patient lookup ---
        await page.locator("#hs-start-visit").click()
        await page.wait_for_selector("#step-panel-1:not(.hidden)", timeout=15_000)
        await page.locator("#phone").fill(TORRES_PHONE)
        await page.locator("#load-patient").click()
        await page.wait_for_selector("#patient-success:not(.hidden)", timeout=30_000)
        await page.wait_for_selector("#tenant-patients-list .patient-pill", timeout=15_000)
        await wait_for_api_idle(page)
        await full_shot(page, "03_step1_patient_lookup")
        await detail_shot(page, "#step-panel-1 .wizard-card", "detail_03_patient_lookup_card")
        await detail_shot(page, "#patient-success", "detail_03_patient_found_badge")

        # --- SCREEN 4: Step 2 forms list ---
        await page.locator("#btn-continue-patient").click()
        await page.wait_for_selector("#step-panel-2:not(.hidden)", timeout=15_000)
        await page.wait_for_function(
            """() => document.querySelectorAll('#form-list .form-row-card').length >= 5""",
            timeout=30_000,
        )
        await page.wait_for_function(
            """() => {
              const el = document.getElementById('step2-patient-text');
              return el && (el.textContent || '').includes('Torres');
            }""",
            timeout=15_000,
        )
        await wait_for_api_idle(page)
        await full_shot(page, "04_step2_forms_list")
        await detail_shot(page, "#step-panel-2 .wizard-card", "detail_04_forms_list_card")
        await detail_shot(page, "#form-list", "detail_04_form_items")

        # --- SCREEN 5: Step 3 intake hero ---
        await page.locator(".form-row-card").filter(
            has_text="Patient Intake Form"
        ).locator("[data-open-form]").click()
        await page.wait_for_selector("#step-panel-3:not(.hidden)", timeout=30_000)
        await page.wait_for_selector("#form-fields .field-block", timeout=30_000)
        await page.wait_for_function(
            """() => {
              const t = document.getElementById('fill-form-title');
              return t && (t.textContent || '').trim().length > 0;
            }""",
            timeout=15_000,
        )
        await page.wait_for_selector(".fill-sticky-bar:not(.hidden)", timeout=15_000)
        await wait_for_api_idle(page)
        await full_shot(page, "05_step3_form_fill_hero")
        await detail_shot(page, "#editor-section", "detail_05_form_fill_card")
        await detail_shot(page, "#form-fields", "detail_05_form_fields_filled")
        await detail_shot(page, ".fill-sticky-bar", "detail_05_sticky_action_bar")

        prev_toggle = page.locator("#btn-template-preview-toggle")
        if await prev_toggle.is_visible():
            await prev_toggle.click()
            await page.wait_for_timeout(600)
            img = page.locator("#form-template-preview")
            try:
                await page.wait_for_function(
                    """() => {
                      const i = document.getElementById('form-template-preview');
                      return i && i.getAttribute('src') && i.getAttribute('src').length > 10;
                    }""",
                    timeout=5000,
                )
                wrap = page.locator("#form-preview-wrap")
                if await wrap.is_visible():
                    await detail_shot(page, "#form-preview-wrap", "detail_05_template_preview_overlay")
            except Exception:
                print(
                    "Note: template preview image not available (schema-only template).",
                    file=sys.stderr,
                )

        # --- SCREEN 6: Insurance form ---
        await page.locator("#btn-back-to-forms").click()
        await page.wait_for_selector("#step-panel-2:not(.hidden)", timeout=15_000)
        await page.locator(".form-row-card").filter(
            has_text="Insurance & Billing Information"
        ).locator("[data-open-form]").click()
        await page.wait_for_selector("#step-panel-3:not(.hidden)", timeout=30_000)
        await page.wait_for_selector("#form-fields .field-block", timeout=30_000)
        await wait_for_api_idle(page)
        await full_shot(page, "06_step3_insurance_form")
        await detail_shot(page, "#form-fields", "detail_06_insurance_fields_filled")

        # --- SCREEN 7: Sync + toast ---
        await page.locator("#sync-form").click()
        await page.wait_for_selector("#sync-toast.show", timeout=30_000)
        await page.wait_for_function(
            """() => {
              const t = document.getElementById('sync-toast');
              return t && (t.textContent || '').trim().length > 3;
            }""",
            timeout=10_000,
        )
        await detail_shot(page, "#sync-toast", "detail_07_sync_success_toast")
        await full_shot(page, "07_step3_pdf_export_moment")

        # --- SCREEN 8: Templates panel ---
        await page.locator("#btn-manage-templates").click()
        await page.wait_for_selector("#templates-panel-root:not(.hidden)", timeout=15_000)
        await page.wait_for_function(
            """() => {
              const el = document.getElementById('pdf-template-list');
              return el && el.children.length > 0;
            }""",
            timeout=30_000,
        )
        await wait_for_api_idle(page)
        await full_shot(page, "08_templates_panel")
        await detail_shot(page, "#pdf-template-list", "detail_08_template_library")

        # --- SCREEN 9 & 10: Fresh navigation to step 2 Torres ---
        await page.goto(FRONTEND_URL, wait_until="domcontentloaded")
        await inject_token(page, token)
        await wait_dashboard_ready(page)
        await page.locator("#hs-start-visit").click()
        await page.wait_for_selector("#step-panel-1:not(.hidden)", timeout=15_000)
        await page.locator("#phone").fill(TORRES_PHONE)
        await page.locator("#load-patient").click()
        await page.wait_for_selector("#patient-success:not(.hidden)", timeout=30_000)
        await page.locator("#btn-continue-patient").click()
        await page.wait_for_selector("#step-panel-2:not(.hidden)", timeout=15_000)
        await wait_for_api_idle(page)
        await detail_shot(page, ".patient-chip-row", "detail_09_patient_context_chip")
        await detail_shot(page, "#step-panel-2 .wizard-card", "detail_09_step2_full_card")

        await page.locator(".form-row-card").filter(
            has_text="Patient Intake Form"
        ).locator("[data-open-form]").click()
        await page.wait_for_selector("#step-panel-3:not(.hidden)", timeout=15_000)
        await detail_shot(page, "#step-track", "detail_10_step_progress_bar")

        await browser.close()

    print("All screenshots saved.")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
