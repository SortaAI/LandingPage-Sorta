#!/usr/bin/env python3
"""
HTTP-only API seeding for marketing screenshots.
Run from project root after: python seed.py
Requires: pip install httpx
Backend: http://localhost:8000
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
STATE_PATH = HERE / ".seed_state.json"

BASE = "http://localhost:8000"
REGISTER_BODY = {
    "tenant_name": "El Paso Physical Therapy",
    "email": "admin@elpasoft.io",
    "password": "SortaDemo2025!",
}
LOGIN_BODY = {
    "email": "admin@elpasoft.io",
    "password": "SortaDemo2025!",
}

TORRES_PHONE = "9155550142"
NGUYEN_PHONE = "9155550198"
REYES_PHONE = "9155550231"

TEMPLATES_TORRES = [
    "intake_basic",
    "consent_form",
    "hipaa_ack",
    "vision_history",
    "insurance_billing",
]


def main() -> None:
    client = httpx.Client(timeout=60.0)
    token: str | None = None

    r = client.post(f"{BASE}/auth/register", json=REGISTER_BODY)
    if r.status_code == 200:
        token = r.json().get("access_token")
    else:
        r2 = client.post(f"{BASE}/auth/login", json=LOGIN_BODY)
        r2.raise_for_status()
        token = r2.json().get("access_token")

    if not token:
        print("Failed to obtain access_token", file=sys.stderr)
        sys.exit(1)

    h = {"Authorization": f"Bearer {token}"}

    tr = client.get(f"{BASE}/templates", headers=h)
    tr.raise_for_status()
    tmpl_ids = {t["id"] for t in tr.json()}
    for tid in TEMPLATES_TORRES:
        if tid not in tmpl_ids:
            print(f"Warning: template {tid} not in GET /templates", file=sys.stderr)

    def post_patient(phone: str, last_name: str) -> dict:
        pr = client.post(
            f"{BASE}/patients",
            headers=h,
            json={"phone": phone, "last_name": last_name},
        )
        pr.raise_for_status()
        return pr.json()

    patient_torres = post_patient(TORRES_PHONE, "Torres")
    patient_nguyen = post_patient(NGUYEN_PHONE, "Nguyen")
    patient_reyes = post_patient(REYES_PHONE, "Reyes")

    pid_t = patient_torres["id"]
    pid_n = patient_nguyen["id"]
    pid_r = patient_reyes["id"]

    forms_torres: dict[str, str] = {}
    for tid in TEMPLATES_TORRES:
        fr = client.post(
            f"{BASE}/forms",
            headers=h,
            json={"patient_id": pid_t, "template_id": tid, "answers": {}},
        )
        fr.raise_for_status()
        forms_torres[tid] = fr.json()["id"]

    form_intake_id = forms_torres["intake_basic"]
    form_insurance_id = forms_torres["insurance_billing"]
    form_consent_id = forms_torres["consent_form"]

    intake_answers = {
        "first_name": "Maria",
        "last_name": "Torres",
        "dob": "1987-03-22",
        "phone": "9155550142",
        "email": "m.torres@email.com",
        "address": "4821 Sunbowl Dr, El Paso, TX 79902",
        "allergies": "Penicillin",
        "current_medications": "Lisinopril 10mg, Metformin 500mg",
        "chronic_conditions": "Type 2 Diabetes, Hypertension",
        "emergency_name": "Carlos Torres",
        "emergency_phone": "9155550187",
    }
    client.put(
        f"{BASE}/forms/{form_intake_id}",
        headers=h,
        json={"answers": intake_answers},
    ).raise_for_status()

    insurance_answers = {
        "first_name": "Maria",
        "last_name": "Torres",
        "dob": "1987-03-22",
        "address": "4821 Sunbowl Dr, El Paso, TX 79902",
        "insurance_provider": "BlueCross BlueShield of Texas",
        "policy_number": "BCB774920311",
        "group_number": "GRP-88452",
        "billing_authorized": True,
        "signature": "Maria Torres",
        "signature_date": "2025-04-07",
    }
    client.put(
        f"{BASE}/forms/{form_insurance_id}",
        headers=h,
        json={"answers": insurance_answers},
    ).raise_for_status()

    consent_answers = {
        "first_name": "Maria",
        "last_name": "Torres",
        "dob": "1987-03-22",
        "procedure_name": "Physical Therapy Evaluation",
        "risks_explained": True,
        "consent_acknowledged": True,
        "signature": "Maria Torres",
        "signature_date": "2025-04-07",
    }
    client.put(
        f"{BASE}/forms/{form_consent_id}",
        headers=h,
        json={"answers": consent_answers},
    ).raise_for_status()

    # Nguyen: intake + consent
    fi_n = client.post(
        f"{BASE}/forms",
        headers=h,
        json={"patient_id": pid_n, "template_id": "intake_basic", "answers": {}},
    )
    fi_n.raise_for_status()
    form_nguyen_intake_id = fi_n.json()["id"]
    nguyen_intake = {
        "first_name": "Linh",
        "last_name": "Nguyen",
        "dob": "1994-07-08",
        "phone": "9155550198",
        "email": "linh.nguyen@email.com",
        "address": "712 Resler Canyon Dr, El Paso, TX 79912",
        "allergies": "None known",
        "current_medications": "None",
        "chronic_conditions": "None",
        "emergency_name": "Tran Nguyen",
        "emergency_phone": "9155550204",
    }
    client.put(
        f"{BASE}/forms/{form_nguyen_intake_id}",
        headers=h,
        json={"answers": nguyen_intake},
    ).raise_for_status()

    fc_n = client.post(
        f"{BASE}/forms",
        headers=h,
        json={"patient_id": pid_n, "template_id": "consent_form", "answers": {}},
    )
    fc_n.raise_for_status()
    form_nguyen_consent_id = fc_n.json()["id"]
    client.put(
        f"{BASE}/forms/{form_nguyen_consent_id}",
        headers=h,
        json={
            "answers": {
                "first_name": "Linh",
                "last_name": "Nguyen",
                "dob": "1994-07-08",
                "procedure_name": "Initial evaluation",
                "risks_explained": True,
                "consent_acknowledged": True,
                "signature": "Linh Nguyen",
                "signature_date": "2025-04-07",
            }
        },
    ).raise_for_status()

    # Reyes: intake only
    fi_r = client.post(
        f"{BASE}/forms",
        headers=h,
        json={"patient_id": pid_r, "template_id": "intake_basic", "answers": {}},
    )
    fi_r.raise_for_status()
    form_reyes_intake_id = fi_r.json()["id"]
    client.put(
        f"{BASE}/forms/{form_reyes_intake_id}",
        headers=h,
        json={
            "answers": {
                "first_name": "Claudia",
                "last_name": "Reyes",
                "dob": "1979-11-15",
                "phone": "9155550231",
                "email": "c.reyes@email.com",
                "address": "2200 N Mesa St, El Paso, TX 79902",
                "allergies": "Sulfa drugs",
                "current_medications": "Atorvastatin 20mg",
                "chronic_conditions": "High Cholesterol",
                "emergency_name": "Hector Reyes",
                "emergency_phone": "9155550245",
            }
        },
    ).raise_for_status()

    state = {
        "backend_url": BASE,
        "token": token,
        "patient_torres_id": pid_t,
        "patient_nguyen_id": pid_n,
        "patient_reyes_id": pid_r,
        "form_intake_id": form_intake_id,
        "form_insurance_id": form_insurance_id,
        "form_consent_id": form_consent_id,
        "forms_torres": forms_torres,
    }
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")

    print("Seed complete.")
    print(f"Token: {token[:24]}...")
    print(f"patient_torres.id: {pid_t}")
    print(f"form_intake_id: {form_intake_id}")
    print(f"form_insurance_id: {form_insurance_id}")
    print(f"form_consent_id: {form_consent_id}")
    print(f"Wrote {STATE_PATH}")


if __name__ == "__main__":
    main()
