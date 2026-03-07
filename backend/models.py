from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    zip: str
    areaType: str       # urban | suburban | rural | remote
    wiredInternet: str  # none | dsl | fixedWireless | cable | fiber
    primaryUse: str     # browsing | streaming | work | gaming | mixed
    householdSize: str  # solo | small | medium | large
    budget: int
    providers: list[str]


class SubScores(BaseModel):
    locationScore: int
    coverageScore: int
    budgetScore: int
    latencyScore: int


class CoordResult(BaseModel):
    lat: float
    lon: float
    region: str


class VerdictText(BaseModel):
    headline: str
    body: str


class AnalyzeResponse(BaseModel):
    resultId: str
    score: int
    verdict: str          # yes | maybe | no
    verdictText: VerdictText
    subScores: SubScores
    compProviders: list[str]
    bestLocalKey: str
    pros: list[str]
    cons: list[str]
    coords: CoordResult
    shareUrl: str
