'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyze } from '@/lib/api';
import { PROVIDERS, TYPE_COLORS, ZIP_COORDS, PREFIX_COORDS } from '@/lib/data';

interface FormState {
  zip: string;
  areaType: string;
  wiredInternet: string;
  primaryUse: string;
  householdSize: string;
  budget: number;
  providers: string[];
}

const INITIAL_STATE: FormState = {
  zip: '', areaType: '', wiredInternet: '',
  primaryUse: '', householdSize: '', budget: 120, providers: [],
};

export default function ToolPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [zipFeedback, setZipFeedback] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(-1);

  const progress = Array.from({ length: 7 }, (_, i) => i < step - 1 ? '100%' : '0%');

  function setField(field: keyof FormState, value: string) {
    setState(s => ({ ...s, [field]: value }));
    setErrors(e => ({ ...e, [step]: '' }));
  }

  function onZipInput(val: string) {
    setState(s => ({ ...s, zip: val }));
    const trimmed = val.trim();
    if (/^\d{5}$/.test(trimmed)) {
      if (ZIP_COORDS[trimmed]) {
        setZipFeedback(ZIP_COORDS[trimmed].region);
      } else {
        const prefix = trimmed.substring(0, 3);
        setZipFeedback(PREFIX_COORDS[prefix]?.region ?? '');
      }
    } else {
      setZipFeedback('');
    }
  }

  function getGPS() {
    if (!navigator.geolocation) { setGpsStatus('Geolocation not supported.'); return; }
    setGpsStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let best: string | null = null, bestDist = Infinity;
        for (const [zip, c] of Object.entries(ZIP_COORDS)) {
          const d = Math.hypot(lat - c.lat, lon - c.lon);
          if (d < bestDist) { bestDist = d; best = zip; }
        }
        if (best) {
          setState(s => ({ ...s, zip: best! }));
          setZipFeedback(ZIP_COORDS[best].region);
          setGpsStatus(`Located: ${ZIP_COORDS[best].region}`);
        } else {
          setGpsStatus(`Coords: ${lat.toFixed(3)}, ${lon.toFixed(3)}`);
        }
      },
      () => setGpsStatus('Location access denied.'),
    );
  }

  function toggleProvider(key: string) {
    setState(s => {
      const idx = s.providers.indexOf(key);
      return {
        ...s,
        providers: idx === -1 ? [...s.providers, key] : s.providers.filter(k => k !== key),
      };
    });
  }

  function selectNoProviders() {
    setState(s => ({ ...s, providers: [] }));
  }

  function nextStep() {
    if (step === 2 && !state.areaType)     { setErrors(e => ({ ...e, 2: 'Please select an area type.' })); return; }
    if (step === 3 && !state.wiredInternet){ setErrors(e => ({ ...e, 3: 'Please select your current connection type.' })); return; }
    if (step === 4 && !state.primaryUse)   { setErrors(e => ({ ...e, 4: 'Please select your primary use.' })); return; }
    if (step === 5 && !state.householdSize){ setErrors(e => ({ ...e, 5: 'Please select household size.' })); return; }
    setStep(s => s + 1);
  }

  function prevStep() { setStep(s => s - 1); }

  async function submit() {
    setLoading(true);
    const loadingSteps = [0, 1, 2, 3, 4, 5];
    for (const i of loadingSteps) {
      setLoadingStep(i);
      await new Promise(r => setTimeout(r, 320));
    }
    try {
      const result = await analyze({
        zip:          state.zip,
        areaType:     state.areaType,
        wiredInternet: state.wiredInternet,
        primaryUse:   state.primaryUse,
        householdSize: state.householdSize,
        budget:       state.budget,
        providers:    state.providers,
      });
      router.push(`/results/${result.resultId}`);
    } catch {
      setLoading(false);
      setLoadingStep(-1);
      setErrors(e => ({ ...e, 7: 'Something went wrong. Please try again.' }));
    }
  }

  if (loading) {
    const steps = [
      'Checking location data',
      'Mapping nearby providers',
      'Pulling coverage & pricing',
      'Running scoring algorithm',
      'Building comparison table',
      'Generating recommendation',
    ];
    return (
      <section id="loading">
        <div className="loading-title">Analyzing<br />Your Setup</div>
        <div className="spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        <ul className="loading-steps">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`loading-step${i === loadingStep ? ' active' : i < loadingStep ? ' done' : ''}`}
            >
              <span className="step-indicator" />
              {s}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const providerKeys = Object.keys(PROVIDERS).filter(k => k !== 'starlink');

  return (
    <>
      <nav>
        <a href="/" className="nav-logo">OrbitCheck</a>
        <ul className="nav-links">
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/tool">Run Check</a></li>
          <li><a href="https://broadbandmap.fcc.gov/" target="_blank" rel="noopener noreferrer">FCC Map</a></li>
        </ul>
      </nav>

      <section id="tool">
        {/* Progress bar */}
        <div className="form-progress">
          {progress.map((w, i) => (
            <div key={i} className="progress-seg">
              <div className="progress-fill" style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Step 1: ZIP */}
        {step === 1 && (
          <div>
            <p className="step-label">Step 1 of 7</p>
            <h2 className="step-title">Where<br />Are You?</h2>
            <div className="form-field">
              <label className="form-label" htmlFor="zip-input">ZIP Code</label>
              <div className="zip-row">
                <input
                  type="text"
                  id="zip-input"
                  placeholder="e.g. 59801"
                  maxLength={5}
                  inputMode="numeric"
                  value={state.zip}
                  onChange={e => onZipInput(e.target.value)}
                />
                <button className="btn-gps" onClick={getGPS} type="button">Use GPS</button>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff', marginTop: '6px', minHeight: '16px' }}>
                {zipFeedback}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                {gpsStatus}
              </p>
            </div>
            <div className="form-nav">
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Area Type */}
        {step === 2 && (
          <div>
            <p className="step-label">Step 2 of 7</p>
            <h2 className="step-title">What Kind<br />of Area?</h2>
            <div className="option-grid">
              {AREA_OPTIONS.map(o => (
                <div
                  key={o.value}
                  className={`option-card${state.areaType === o.value ? ' selected' : ''}`}
                  onClick={() => setField('areaType', o.value)}
                >
                  <div className="option-card-title">{o.label}</div>
                  <div className="option-card-sub">{o.sub}</div>
                </div>
              ))}
            </div>
            <p className="step-error">{errors[2] || ''}</p>
            <div className="form-nav">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Wired Internet */}
        {step === 3 && (
          <div>
            <p className="step-label">Step 3 of 7</p>
            <h2 className="step-title">Current<br />Connection?</h2>
            <div className="option-grid">
              {WIRE_OPTIONS.map(o => (
                <div
                  key={o.value}
                  className={`option-card${state.wiredInternet === o.value ? ' selected' : ''}`}
                  onClick={() => setField('wiredInternet', o.value)}
                >
                  <div className="option-card-title">{o.label}</div>
                  <div className="option-card-sub">{o.sub}</div>
                </div>
              ))}
            </div>
            <p className="step-error">{errors[3] || ''}</p>
            <div className="form-nav">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Primary Use */}
        {step === 4 && (
          <div>
            <p className="step-label">Step 4 of 7</p>
            <h2 className="step-title">Main Use<br />Case?</h2>
            <div className="option-grid">
              {USE_OPTIONS.map(o => (
                <div
                  key={o.value}
                  className={`option-card${state.primaryUse === o.value ? ' selected' : ''}`}
                  onClick={() => setField('primaryUse', o.value)}
                >
                  <div className="option-card-title">{o.label}</div>
                  <div className="option-card-sub">{o.sub}</div>
                </div>
              ))}
            </div>
            <p className="step-error">{errors[4] || ''}</p>
            <div className="form-nav">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 5: Household Size */}
        {step === 5 && (
          <div>
            <p className="step-label">Step 5 of 7</p>
            <h2 className="step-title">Household<br />Size?</h2>
            <div className="option-grid">
              {HH_OPTIONS.map(o => (
                <div
                  key={o.value}
                  className={`option-card${state.householdSize === o.value ? ' selected' : ''}`}
                  onClick={() => setField('householdSize', o.value)}
                >
                  <div className="option-card-title">{o.label}</div>
                  <div className="option-card-sub">{o.sub}</div>
                </div>
              ))}
            </div>
            <p className="step-error">{errors[5] || ''}</p>
            <div className="form-nav">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 6: Budget */}
        {step === 6 && (
          <div>
            <p className="step-label">Step 6 of 7</p>
            <h2 className="step-title">Monthly<br />Budget?</h2>
            <div className="form-field">
              <div className="budget-display">${state.budget}</div>
              <div className="slider-wrap">
                <input
                  type="range"
                  min={30}
                  max={250}
                  value={state.budget}
                  onChange={e => setState(s => ({ ...s, budget: parseInt(e.target.value) }))}
                />
                <div className="slider-labels"><span>$30</span><span>$250</span></div>
              </div>
            </div>
            <div className="form-nav">
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 7: Providers */}
        {step === 7 && (
          <div>
            <p className="step-label">Step 7 of 7</p>
            <h2 className="step-title">Available<br />Providers?</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Select all that serve your area. Skip if unsure.
            </p>
            <div
              className={`none-option${state.providers.length === 0 ? ' selected' : ''}`}
              onClick={selectNoProviders}
            >
              None / I&apos;m not sure
            </div>
            <div className="provider-grid">
              {providerKeys.map(key => {
                const p = PROVIDERS[key];
                const selected = state.providers.includes(key);
                return (
                  <div
                    key={key}
                    className={`provider-card${selected ? ' selected' : ''}`}
                    onClick={() => toggleProvider(key)}
                  >
                    <div className="provider-card-name">{p.name}</div>
                    <div className="provider-card-detail">
                      <span className="provider-type-dot" style={{ background: TYPE_COLORS[p.type] }} />
                      {p.type.toUpperCase()}<br />
                      {p.speedLabel}<br />
                      From ${p.price}/mo
                    </div>
                  </div>
                );
              })}
            </div>
            {errors[7] && <p className="step-error">{errors[7]}</p>}
            <div className="form-nav" style={{ marginTop: '28px' }}>
              <button className="btn" onClick={prevStep}>Back</button>
              <button className="btn btn-primary" onClick={submit}>Get My Score</button>
            </div>
          </div>
        )}
      </section>

      <footer>
        <div className="footer-logo">OrbitCheck</div>
        <p className="footer-text">
          Data sourced from FCC, provider websites, and public speed test aggregates.
        </p>
      </footer>
    </>
  );
}

const AREA_OPTIONS = [
  { value: 'urban',    label: 'Urban',    sub: 'City / dense suburb' },
  { value: 'suburban', label: 'Suburban', sub: 'Towns & outer suburbs' },
  { value: 'rural',    label: 'Rural',    sub: 'Farmland, small towns' },
  { value: 'remote',   label: 'Remote',   sub: 'Off-grid, wilderness' },
];

const WIRE_OPTIONS = [
  { value: 'none',          label: 'None',          sub: 'No service available' },
  { value: 'dsl',           label: 'DSL',           sub: 'Phone-line internet' },
  { value: 'fixedWireless', label: 'Fixed Wireless', sub: 'Tower-based signal' },
  { value: 'cable',         label: 'Cable',         sub: 'Coax / HFC' },
  { value: 'fiber',         label: 'Fiber',         sub: 'FTTH / fiber optic' },
];

const USE_OPTIONS = [
  { value: 'browsing',  label: 'Browsing',  sub: 'Email, web, social' },
  { value: 'streaming', label: 'Streaming', sub: 'Netflix, YouTube, etc.' },
  { value: 'work',      label: 'Work',      sub: 'Video calls, VPN' },
  { value: 'gaming',    label: 'Gaming',    sub: 'Online multiplayer' },
  { value: 'mixed',     label: 'Mixed',     sub: 'A bit of everything' },
];

const HH_OPTIONS = [
  { value: 'solo',   label: 'Solo',   sub: 'Just me' },
  { value: 'small',  label: 'Small',  sub: '2–3 people' },
  { value: 'medium', label: 'Medium', sub: '4–5 people' },
  { value: 'large',  label: 'Large',  sub: '6+ people' },
];
