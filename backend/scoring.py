"""Python port of the OrbitCheck scoring algorithm."""

import math
from models import AnalyzeRequest

PROVIDERS = {
    'att-fiber':      dict(name='AT&T Fiber',            type='fiber',     maxSpeed=5000, speedLabel='300–5000 Mbps',  price=55,  equipment=0,   latencyLabel='5–15ms',    latencyMs=10,  reliability=94, contract=False, abbr='ATF'),
    'att-dsl':        dict(name='AT&T Internet',          type='dsl',       maxSpeed=100,  speedLabel='10–100 Mbps',    price=55,  equipment=10,  latencyLabel='20–50ms',   latencyMs=35,  reliability=72, contract=False, abbr='ATT'),
    'verizon-fios':   dict(name='Verizon Fios',           type='fiber',     maxSpeed=2300, speedLabel='300–2300 Mbps',  price=50,  equipment=0,   latencyLabel='4–10ms',    latencyMs=7,   reliability=96, contract=False, abbr='FiOS'),
    'comcast':        dict(name='Xfinity',                type='cable',     maxSpeed=2000, speedLabel='75–2000 Mbps',   price=30,  equipment=15,  latencyLabel='10–30ms',   latencyMs=20,  reliability=82, contract=False, abbr='XFN'),
    'spectrum':       dict(name='Spectrum',               type='cable',     maxSpeed=1000, speedLabel='300–1000 Mbps',  price=50,  equipment=0,   latencyLabel='10–30ms',   latencyMs=22,  reliability=80, contract=False, abbr='SPC'),
    'cox':            dict(name='Cox',                    type='cable',     maxSpeed=2000, speedLabel='100–2000 Mbps',  price=50,  equipment=10,  latencyLabel='10–25ms',   latencyMs=18,  reliability=83, contract=False, abbr='COX'),
    'mediacom':       dict(name='Mediacom',               type='cable',     maxSpeed=1000, speedLabel='60–1000 Mbps',   price=40,  equipment=10,  latencyLabel='12–30ms',   latencyMs=24,  reliability=75, contract=True,  abbr='MDC'),
    'frontier-fiber': dict(name='Frontier Fiber',         type='fiber',     maxSpeed=5000, speedLabel='500–5000 Mbps',  price=50,  equipment=0,   latencyLabel='4–12ms',    latencyMs=8,   reliability=91, contract=False, abbr='FTR'),
    'frontier-dsl':   dict(name='Frontier DSL',           type='dsl',       maxSpeed=115,  speedLabel='6–115 Mbps',     price=30,  equipment=10,  latencyLabel='20–60ms',   latencyMs=40,  reliability=65, contract=False, abbr='FDS'),
    'tmobile-home':   dict(name='T-Mobile Home Internet', type='5g',        maxSpeed=245,  speedLabel='35–245 Mbps',    price=50,  equipment=0,   latencyLabel='30–60ms',   latencyMs=45,  reliability=78, contract=False, abbr='TMO'),
    'verizon-5g':     dict(name='Verizon 5G Home',        type='5g',        maxSpeed=1000, speedLabel='85–1000 Mbps',   price=60,  equipment=0,   latencyLabel='20–50ms',   latencyMs=35,  reliability=80, contract=False, abbr='V5G'),
    'hughesnet':      dict(name='HughesNet',              type='geo',       maxSpeed=100,  speedLabel='15–100 Mbps',    price=50,  equipment=0,   latencyLabel='600–900ms', latencyMs=750, reliability=68, contract=True,  abbr='HNT'),
    'viasat':         dict(name='Viasat',                 type='geo',       maxSpeed=150,  speedLabel='12–150 Mbps',    price=70,  equipment=0,   latencyLabel='600–900ms', latencyMs=750, reliability=70, contract=True,  abbr='VST'),
    'starlink':       dict(name='Starlink',               type='satellite', maxSpeed=220,  speedLabel='50–220 Mbps',    price=120, equipment=599, latencyLabel='20–60ms',   latencyMs=40,  reliability=85, contract=False, abbr='STL'),
}

ZIP_COORDS = {
    '98101': dict(lat=47.606, lon=-122.332, region='Seattle, WA'),
    '10001': dict(lat=40.748, lon=-73.997,  region='New York, NY'),
    '90210': dict(lat=34.090, lon=-118.413, region='Beverly Hills, CA'),
    '60601': dict(lat=41.882, lon=-87.628,  region='Chicago, IL'),
    '77001': dict(lat=29.750, lon=-95.367,  region='Houston, TX'),
    '85001': dict(lat=33.448, lon=-112.074, region='Phoenix, AZ'),
    '30301': dict(lat=33.749, lon=-84.388,  region='Atlanta, GA'),
    '94102': dict(lat=37.779, lon=-122.415, region='San Francisco, CA'),
    '80201': dict(lat=39.739, lon=-104.984, region='Denver, CO'),
    '97201': dict(lat=45.520, lon=-122.681, region='Portland, OR'),
    '59801': dict(lat=46.872, lon=-113.994, region='Missoula, MT'),
    '99501': dict(lat=61.218, lon=-149.900, region='Anchorage, AK'),
    '96801': dict(lat=21.306, lon=-157.858, region='Honolulu, HI'),
}

PREFIX_COORDS = {
    '981': dict(lat=47.607, lon=-122.333, region='Seattle area'),
    '100': dict(lat=40.748, lon=-73.997,  region='New York metro'),
    '900': dict(lat=34.052, lon=-118.244, region='Los Angeles area'),
    '606': dict(lat=41.878, lon=-87.629,  region='Chicago area'),
    '770': dict(lat=29.760, lon=-95.369,  region='Houston area'),
    '850': dict(lat=33.448, lon=-112.074, region='Phoenix area'),
    '941': dict(lat=37.779, lon=-122.419, region='San Francisco area'),
    '802': dict(lat=39.739, lon=-104.984, region='Denver area'),
    '972': dict(lat=45.523, lon=-122.676, region='Portland area'),
    '995': dict(lat=61.218, lon=-149.900, region='Anchorage AK'),
    '968': dict(lat=21.306, lon=-157.858, region='Hawaii'),
}


def resolve_coords(zip_code: str) -> dict:
    if zip_code and zip_code in ZIP_COORDS:
        return ZIP_COORDS[zip_code]
    if zip_code and len(zip_code) >= 3:
        prefix = zip_code[:3]
        if prefix in PREFIX_COORDS:
            return PREFIX_COORDS[prefix]
        for k, v in PREFIX_COORDS.items():
            if k.startswith(zip_code[:2]):
                return v
    return {'lat': 39.5, 'lon': -98.35, 'region': 'United States'}


def compute_score(req: AnalyzeRequest) -> int:
    score = 50

    area_adj = {'remote': 30, 'rural': 20, 'suburban': 0, 'urban': -20}
    score += area_adj.get(req.areaType, 0)

    wire_adj = {'none': 30, 'dsl': 18, 'fixedWireless': 8, 'cable': -8, 'fiber': -28}
    score += wire_adj.get(req.wiredInternet, 0)

    fiber_isps = {'att-fiber', 'verizon-fios', 'frontier-fiber'}
    cable_isps = {'comcast', 'spectrum', 'cox', 'mediacom'}
    geo_isps   = {'hughesnet', 'viasat'}
    provider_set = set(req.providers)
    if provider_set & fiber_isps:   score -= 20
    elif provider_set & cable_isps: score -= 8
    if provider_set & geo_isps:     score += 10
    if len(req.providers) == 0:     score += 12

    if req.budget >= 130:   score += 10
    elif req.budget >= 100: score += 4
    elif req.budget < 60:   score -= 20
    elif req.budget < 80:   score -= 12

    use_adj = {'gaming': -12, 'work': -4, 'streaming': 2, 'browsing': 6, 'mixed': -2}
    score += use_adj.get(req.primaryUse, 0)

    hh_adj = {'solo': 2, 'small': 4, 'medium': 2, 'large': -2}
    score += hh_adj.get(req.householdSize, 0)

    return max(0, min(100, score))


def compute_sub_scores(req: AnalyzeRequest) -> dict:
    location = {'remote': 95, 'rural': 75, 'suburban': 45, 'urban': 15}.get(req.areaType, 50)
    coverage = {'none': 95, 'dsl': 75, 'fixedWireless': 55, 'cable': 30, 'fiber': 10}.get(req.wiredInternet, 50)
    budget = (90 if req.budget >= 130 else 70 if req.budget >= 100 else 50 if req.budget >= 80 else 35 if req.budget >= 60 else 15)
    latency = {'browsing': 90, 'streaming': 80, 'mixed': 60, 'work': 40, 'gaming': 15}.get(req.primaryUse, 60)
    return {'locationScore': location, 'coverageScore': coverage, 'budgetScore': budget, 'latencyScore': latency}


def get_verdict(score: int) -> str:
    if score >= 62: return 'yes'
    if score >= 38: return 'maybe'
    return 'no'


def get_verdict_text(verdict: str, score: int) -> dict:
    if verdict == 'yes':
        return {'headline': 'Starlink is a Strong Fit', 'body': f'Your situation scores {score}/100 for Starlink suitability. Limited local competition, your location type, and budget alignment make satellite internet a compelling choice.'}
    if verdict == 'maybe':
        return {'headline': 'Starlink Could Work', 'body': f'Your score of {score}/100 puts you in the "consider it" zone. Starlink may offer value depending on how your local providers perform in practice. Compare carefully before committing.'}
    return {'headline': 'Stick With Your ISP', 'body': f'At {score}/100, your existing or available options likely outperform Starlink for your specific needs. Faster speeds, lower latency, and better pricing are available locally.'}


def generate_pros(req: AnalyzeRequest) -> list[str]:
    pros = []
    if req.areaType == 'remote':     pros.append('Remote location — satellite is often the only viable option')
    if req.areaType == 'rural':      pros.append('Rural area with limited wired infrastructure')
    if req.wiredInternet == 'none':  pros.append('No wired alternative available in your area')
    if req.wiredInternet == 'dsl':   pros.append('DSL is slow and aging — Starlink offers far more speed')
    if {'hughesnet', 'viasat'} & set(req.providers):
        pros.append('Current geo-satellite option is much slower with higher latency')
    if req.budget >= 120: pros.append("Budget comfortably covers Starlink's $120/mo plan")
    if req.primaryUse == 'browsing':  pros.append('Light browsing use case is well-suited for satellite latency')
    elif req.primaryUse == 'streaming': pros.append('Streaming use case is well-suited for satellite latency')
    if len(req.providers) == 0: pros.append('No identified local providers — Starlink fills a real gap')
    if not pros: pros.append('Nationwide coverage regardless of location')
    pros.append('No contract, easy to cancel')
    return pros[:5]


def generate_cons(req: AnalyzeRequest) -> list[str]:
    cons = []
    if req.areaType == 'urban':       cons.append('Urban area has abundant wired competition')
    if req.wiredInternet == 'fiber':  cons.append('Fiber optic available — offers lower latency and higher speeds')
    if req.wiredInternet == 'cable':  cons.append('Cable internet provides comparable speeds at lower cost')
    if req.primaryUse == 'gaming':    cons.append('20–60ms satellite latency harms online gaming performance')
    if req.primaryUse == 'work':      cons.append('Video calls and VPNs benefit from sub-20ms latency')
    if req.budget < 100:              cons.append(f"Budget of ${req.budget}/mo is below Starlink's $120 starting price")
    if req.householdSize == 'large':  cons.append('Large households risk congestion during peak usage')
    if {'att-fiber', 'verizon-fios', 'frontier-fiber'} & set(req.providers):
        cons.append('High-reliability fiber providers available in your area')
    cons.append('$599 hardware cost required upfront')
    if len(cons) < 3: cons.append('Performance can vary during storms or peak congestion')
    return cons[:5]


def get_best_local_provider(req: AnalyzeRequest) -> str:
    selected = [k for k in req.providers if k != 'starlink']
    if selected:
        return max(selected, key=lambda k: PROVIDERS[k]['reliability'])
    defaults = {'urban': 'comcast', 'suburban': 'spectrum', 'rural': 'att-dsl', 'remote': 'viasat'}
    return defaults.get(req.areaType, 'comcast')


def get_comparison_providers(req: AnalyzeRequest) -> list[str]:
    selected = [k for k in req.providers if k != 'starlink']
    area_defaults = {
        'urban':    ['comcast', 'att-fiber'],
        'suburban': ['spectrum', 'tmobile-home'],
        'rural':    ['att-dsl', 'frontier-dsl'],
        'remote':   ['hughesnet', 'viasat'],
    }
    defaults = area_defaults.get(req.areaType, ['comcast', 'spectrum'])
    seen, result = set(), []
    for k in selected + defaults + ['starlink']:
        if k not in seen:
            seen.add(k)
            result.append(k)
        if len(result) == 6:
            break
    return result


def run_scoring(req: AnalyzeRequest, _fcc_providers: list) -> dict:
    """Run full scoring and return result dict (without resultId/shareUrl)."""
    score          = compute_score(req)
    sub_scores     = compute_sub_scores(req)
    verdict        = get_verdict(score)
    verdict_text   = get_verdict_text(verdict, score)
    best_local_key = get_best_local_provider(req)
    comp_providers = get_comparison_providers(req)
    pros           = generate_pros(req)
    cons           = generate_cons(req)
    coords         = resolve_coords(req.zip)

    return {
        'score':         score,
        'verdict':       verdict,
        'verdictText':   verdict_text,
        'subScores':     sub_scores,
        'compProviders': comp_providers,
        'bestLocalKey':  best_local_key,
        'pros':          pros,
        'cons':          cons,
        'coords':        coords,
    }
