import os
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import get_result, init_db, store_result
from fcc_api import get_providers_by_zip
from models import AnalyzeRequest, AnalyzeResponse
from scoring import run_scoring

app = FastAPI(title='OrbitCheck API')

FRONTEND_URL = os.getenv('FRONTEND_URL', '*')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != '*' else ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
async def startup() -> None:
    init_db()


@app.get('/health')
async def health():
    return {'status': 'ok'}


@app.post('/analyze', response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    fcc_providers = await get_providers_by_zip(req.zip)
    result = run_scoring(req, fcc_providers)

    result_id = uuid4().hex[:8]
    share_url = f'{FRONTEND_URL}/results/{result_id}' if FRONTEND_URL != '*' else f'/results/{result_id}'

    result['resultId'] = result_id
    result['shareUrl'] = share_url

    store_result(result_id, result)
    return result


@app.get('/results/{result_id}', response_model=AnalyzeResponse)
async def get_result_endpoint(result_id: str):
    data = get_result(result_id)
    if not data:
        raise HTTPException(status_code=404, detail='Result not found')
    return data
