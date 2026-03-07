"""FCC Broadband Data API client.

Public API — no key required for basic queries.
Docs: https://broadbandmap.fcc.gov/docs
"""

import httpx
from scoring import PROVIDERS, resolve_coords

FCC_BASE = "https://broadbandmap.fcc.gov/api/public/map"

# FCC tech codes → our provider type
TECH_TYPE_MAP = {
    10: 'dsl', 11: 'dsl', 12: 'dsl',
    40: 'cable', 41: 'cable', 42: 'cable', 43: 'cable', 50: 'cable',
    70: 'fiber',
    300: 'geo',   # GSO satellite (HughesNet/Viasat)
    400: 'satellite',  # NGSO satellite (Starlink)
    60: '5g', 61: '5g',
}


def _fcc_provider_to_key(fcc_name: str, tech_code: int) -> str | None:
    """Best-effort match FCC provider name to our PROVIDERS keys."""
    name_lower = fcc_name.lower()
    if tech_code == 400 or 'starlink' in name_lower:   return 'starlink'
    if tech_code == 300:
        if 'hughes' in name_lower:  return 'hughesnet'
        if 'viasat' in name_lower:  return 'viasat'
    if 'at&t' in name_lower or 'att' in name_lower:
        return 'att-fiber' if TECH_TYPE_MAP.get(tech_code) == 'fiber' else 'att-dsl'
    if 'verizon' in name_lower:
        return 'verizon-fios' if TECH_TYPE_MAP.get(tech_code) == 'fiber' else 'verizon-5g'
    if 'comcast' in name_lower or 'xfinity' in name_lower: return 'comcast'
    if 'spectrum' in name_lower or 'charter' in name_lower: return 'spectrum'
    if 'cox' in name_lower:      return 'cox'
    if 'frontier' in name_lower:
        return 'frontier-fiber' if TECH_TYPE_MAP.get(tech_code) == 'fiber' else 'frontier-dsl'
    if 't-mobile' in name_lower or 'tmobile' in name_lower: return 'tmobile-home'
    if 'mediacom' in name_lower: return 'mediacom'
    return None


async def get_providers_by_zip(zip_code: str) -> list[dict]:
    """Return list of provider dicts available at zip_code.

    Falls back to hardcoded PROVIDERS if FCC API is unreachable.
    """
    coords = resolve_coords(zip_code)
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{FCC_BASE}/listAvailability",
                params={
                    'latitude':  coords['lat'],
                    'longitude': coords['lon'],
                    'unit':      'location',
                    'category':  'Residential Fixed Broadband',
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        # Return empty list — scoring.py will use hardcoded fallbacks
        return []

    seen_keys: set[str] = set()
    results: list[dict] = []
    for entry in data.get('data', []):
        tech_code = entry.get('technology_code', 0)
        fcc_name  = entry.get('brand_name', '') or entry.get('holding_company', '')
        key = _fcc_provider_to_key(fcc_name, tech_code)
        if key and key not in seen_keys and key in PROVIDERS:
            seen_keys.add(key)
            results.append({'key': key, **PROVIDERS[key]})

    return results
