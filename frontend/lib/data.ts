export type ProviderType = 'fiber' | 'cable' | '5g' | 'geo' | 'dsl' | 'satellite';

export interface Provider {
  name: string;
  type: ProviderType;
  maxSpeed: number;
  speedLabel: string;
  price: number;
  equipment: number;
  latencyLabel: string;
  latencyMs: number;
  reliability: number;
  contract: boolean;
  abbr: string;
}

export interface Coords {
  lat: number;
  lon: number;
  region: string;
}

export const PROVIDERS: Record<string, Provider> = {
  'att-fiber':      { name: 'AT&T Fiber',           type: 'fiber',     maxSpeed: 5000, speedLabel: '300–5000 Mbps',  price: 55,  equipment: 0,   latencyLabel: '5–15ms',     latencyMs: 10,  reliability: 94, contract: false, abbr: 'ATF' },
  'att-dsl':        { name: 'AT&T Internet',         type: 'dsl',       maxSpeed: 100,  speedLabel: '10–100 Mbps',    price: 55,  equipment: 10,  latencyLabel: '20–50ms',    latencyMs: 35,  reliability: 72, contract: false, abbr: 'ATT' },
  'verizon-fios':   { name: 'Verizon Fios',          type: 'fiber',     maxSpeed: 2300, speedLabel: '300–2300 Mbps',  price: 50,  equipment: 0,   latencyLabel: '4–10ms',     latencyMs: 7,   reliability: 96, contract: false, abbr: 'FiOS' },
  'comcast':        { name: 'Xfinity',               type: 'cable',     maxSpeed: 2000, speedLabel: '75–2000 Mbps',   price: 30,  equipment: 15,  latencyLabel: '10–30ms',    latencyMs: 20,  reliability: 82, contract: false, abbr: 'XFN' },
  'spectrum':       { name: 'Spectrum',              type: 'cable',     maxSpeed: 1000, speedLabel: '300–1000 Mbps',  price: 50,  equipment: 0,   latencyLabel: '10–30ms',    latencyMs: 22,  reliability: 80, contract: false, abbr: 'SPC' },
  'cox':            { name: 'Cox',                   type: 'cable',     maxSpeed: 2000, speedLabel: '100–2000 Mbps',  price: 50,  equipment: 10,  latencyLabel: '10–25ms',    latencyMs: 18,  reliability: 83, contract: false, abbr: 'COX' },
  'mediacom':       { name: 'Mediacom',              type: 'cable',     maxSpeed: 1000, speedLabel: '60–1000 Mbps',   price: 40,  equipment: 10,  latencyLabel: '12–30ms',    latencyMs: 24,  reliability: 75, contract: true,  abbr: 'MDC' },
  'frontier-fiber': { name: 'Frontier Fiber',        type: 'fiber',     maxSpeed: 5000, speedLabel: '500–5000 Mbps',  price: 50,  equipment: 0,   latencyLabel: '4–12ms',     latencyMs: 8,   reliability: 91, contract: false, abbr: 'FTR' },
  'frontier-dsl':   { name: 'Frontier DSL',          type: 'dsl',       maxSpeed: 115,  speedLabel: '6–115 Mbps',     price: 30,  equipment: 10,  latencyLabel: '20–60ms',    latencyMs: 40,  reliability: 65, contract: false, abbr: 'FDS' },
  'tmobile-home':   { name: 'T-Mobile Home Internet', type: '5g',       maxSpeed: 245,  speedLabel: '35–245 Mbps',    price: 50,  equipment: 0,   latencyLabel: '30–60ms',    latencyMs: 45,  reliability: 78, contract: false, abbr: 'TMO' },
  'verizon-5g':     { name: 'Verizon 5G Home',       type: '5g',        maxSpeed: 1000, speedLabel: '85–1000 Mbps',   price: 60,  equipment: 0,   latencyLabel: '20–50ms',    latencyMs: 35,  reliability: 80, contract: false, abbr: 'V5G' },
  'hughesnet':      { name: 'HughesNet',             type: 'geo',       maxSpeed: 100,  speedLabel: '15–100 Mbps',    price: 50,  equipment: 0,   latencyLabel: '600–900ms',  latencyMs: 750, reliability: 68, contract: true,  abbr: 'HNT' },
  'viasat':         { name: 'Viasat',                type: 'geo',       maxSpeed: 150,  speedLabel: '12–150 Mbps',    price: 70,  equipment: 0,   latencyLabel: '600–900ms',  latencyMs: 750, reliability: 70, contract: true,  abbr: 'VST' },
  'starlink':       { name: 'Starlink',              type: 'satellite', maxSpeed: 220,  speedLabel: '50–220 Mbps',    price: 120, equipment: 599, latencyLabel: '20–60ms',    latencyMs: 40,  reliability: 85, contract: false, abbr: 'STL' },
};

export const TYPE_COLORS: Record<string, string> = {
  fiber:     '#4ade80',
  cable:     '#60a5fa',
  '5g':      '#fbbf24',
  geo:       '#f87171',
  dsl:       '#a78bfa',
  satellite: '#ffffff',
};

export const ZIP_COORDS: Record<string, Coords> = {
  '10001': { lat: 40.748, lon: -73.997,  region: 'New York, NY' },
  '90210': { lat: 34.090, lon: -118.413, region: 'Beverly Hills, CA' },
  '60601': { lat: 41.882, lon: -87.628,  region: 'Chicago, IL' },
  '77001': { lat: 29.750, lon: -95.367,  region: 'Houston, TX' },
  '85001': { lat: 33.448, lon: -112.074, region: 'Phoenix, AZ' },
  '98101': { lat: 47.606, lon: -122.332, region: 'Seattle, WA' },
  '30301': { lat: 33.749, lon: -84.388,  region: 'Atlanta, GA' },
  '02101': { lat: 42.360, lon: -71.058,  region: 'Boston, MA' },
  '19101': { lat: 39.952, lon: -75.165,  region: 'Philadelphia, PA' },
  '33101': { lat: 25.775, lon: -80.208,  region: 'Miami, FL' },
  '78201': { lat: 29.424, lon: -98.494,  region: 'San Antonio, TX' },
  '75201': { lat: 32.776, lon: -96.797,  region: 'Dallas, TX' },
  '94102': { lat: 37.779, lon: -122.415, region: 'San Francisco, CA' },
  '80201': { lat: 39.739, lon: -104.984, region: 'Denver, CO' },
  '37201': { lat: 36.162, lon: -86.774,  region: 'Nashville, TN' },
  '97201': { lat: 45.520, lon: -122.681, region: 'Portland, OR' },
  '89101': { lat: 36.175, lon: -115.137, region: 'Las Vegas, NV' },
  '73101': { lat: 35.468, lon: -97.516,  region: 'Oklahoma City, OK' },
  '87101': { lat: 35.085, lon: -106.651, region: 'Albuquerque, NM' },
  '68101': { lat: 41.257, lon: -95.995,  region: 'Omaha, NE' },
  '55401': { lat: 44.977, lon: -93.265,  region: 'Minneapolis, MN' },
  '53201': { lat: 43.038, lon: -87.906,  region: 'Milwaukee, WI' },
  '44101': { lat: 41.499, lon: -81.695,  region: 'Cleveland, OH' },
  '48201': { lat: 42.332, lon: -83.050,  region: 'Detroit, MI' },
  '46201': { lat: 39.769, lon: -86.158,  region: 'Indianapolis, IN' },
  '63101': { lat: 38.627, lon: -90.197,  region: 'St. Louis, MO' },
  '40201': { lat: 38.252, lon: -85.759,  region: 'Louisville, KY' },
  '28201': { lat: 35.227, lon: -80.843,  region: 'Charlotte, NC' },
  '23219': { lat: 37.541, lon: -77.434,  region: 'Richmond, VA' },
  '21201': { lat: 39.290, lon: -76.611,  region: 'Baltimore, MD' },
  '15201': { lat: 40.440, lon: -79.996,  region: 'Pittsburgh, PA' },
  '43201': { lat: 39.961, lon: -82.999,  region: 'Columbus, OH' },
  '35201': { lat: 33.520, lon: -86.802,  region: 'Birmingham, AL' },
  '39201': { lat: 32.298, lon: -90.184,  region: 'Jackson, MS' },
  '70112': { lat: 29.951, lon: -90.071,  region: 'New Orleans, LA' },
  '72201': { lat: 34.746, lon: -92.289,  region: 'Little Rock, AR' },
  '65201': { lat: 38.952, lon: -92.334,  region: 'Columbia, MO' },
  '50301': { lat: 41.590, lon: -93.620,  region: 'Des Moines, IA' },
  '57101': { lat: 43.545, lon: -96.731,  region: 'Sioux Falls, SD' },
  '58501': { lat: 46.808, lon: -100.783, region: 'Bismarck, ND' },
  '59101': { lat: 45.783, lon: -108.501, region: 'Billings, MT' },
  '83701': { lat: 43.613, lon: -116.202, region: 'Boise, ID' },
  '84101': { lat: 40.760, lon: -111.891, region: 'Salt Lake City, UT' },
  '82001': { lat: 41.140, lon: -104.820, region: 'Cheyenne, WY' },
  '80901': { lat: 38.867, lon: -104.761, region: 'Colorado Springs, CO' },
  '99501': { lat: 61.218, lon: -149.900, region: 'Anchorage, AK' },
  '96801': { lat: 21.306, lon: -157.858, region: 'Honolulu, HI' },
  '59801': { lat: 46.872, lon: -113.994, region: 'Missoula, MT' },
};

export const PREFIX_COORDS: Record<string, Coords> = {
  '100': { lat: 40.748, lon: -73.997,  region: 'New York metro' },
  '101': { lat: 40.748, lon: -73.997,  region: 'New York metro' },
  '900': { lat: 34.052, lon: -118.244, region: 'Los Angeles area' },
  '902': { lat: 33.941, lon: -118.408, region: 'Los Angeles area' },
  '606': { lat: 41.878, lon: -87.629,  region: 'Chicago area' },
  '770': { lat: 29.760, lon: -95.369,  region: 'Houston area' },
  '850': { lat: 33.448, lon: -112.074, region: 'Phoenix area' },
  '981': { lat: 47.607, lon: -122.333, region: 'Seattle area' },
  '303': { lat: 33.749, lon: -84.387,  region: 'Atlanta area' },
  '021': { lat: 42.360, lon: -71.058,  region: 'Boston area' },
  '191': { lat: 39.953, lon: -75.163,  region: 'Philadelphia area' },
  '331': { lat: 25.774, lon: -80.194,  region: 'Miami area' },
  '782': { lat: 29.425, lon: -98.494,  region: 'San Antonio area' },
  '752': { lat: 32.783, lon: -96.806,  region: 'Dallas area' },
  '941': { lat: 37.779, lon: -122.419, region: 'San Francisco area' },
  '802': { lat: 39.739, lon: -104.984, region: 'Denver area' },
  '372': { lat: 36.166, lon: -86.784,  region: 'Nashville area' },
  '972': { lat: 45.523, lon: -122.676, region: 'Portland area' },
  '891': { lat: 36.178, lon: -115.134, region: 'Las Vegas area' },
  '731': { lat: 35.467, lon: -97.519,  region: 'Oklahoma City area' },
  '871': { lat: 35.084, lon: -106.651, region: 'Albuquerque area' },
  '591': { lat: 45.783, lon: -108.501, region: 'Billings MT area' },
  '598': { lat: 46.872, lon: -113.994, region: 'Missoula MT area' },
  '599': { lat: 48.211, lon: -106.641, region: 'Northern MT' },
  '595': { lat: 47.502, lon: -111.300, region: 'Great Falls MT' },
  '990': { lat: 47.658, lon: -117.426, region: 'Spokane WA' },
  '994': { lat: 64.200, lon: -149.400, region: 'Interior Alaska' },
  '995': { lat: 61.218, lon: -149.900, region: 'Anchorage AK' },
  '968': { lat: 21.306, lon: -157.858, region: 'Hawaii' },
};
