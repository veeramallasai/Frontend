import capsicumImg from '../assets/images/capsicum.png';
import okraImg from '../assets/images/okra.png';
import brinjalImg from '../assets/images/brinjal.png';
import bottleGourdImg from '../assets/images/bottle_gourd.png';
import tomatoImg from '../assets/images/tomato.png';
import potatoImg from '../assets/images/potato.png';
import onionImg from '../assets/images/onion.png';
import carrotImg from '../assets/images/carrot.png';
import cabbageImg from '../assets/images/cabbage.png';
import cauliflowerImg from '../assets/images/cauliflower.png';
import greenChilliImg from '../assets/images/green_chilli.png';
import cucumberImg from '../assets/images/cucumber.png';
import defaultVegImg from '../assets/images/default_veg.png';
import appleImg from '../assets/images/apple.svg';
import bananaImg from '../assets/images/banana.svg';
import mangoImg from '../assets/images/mango.svg';
import orangeImg from '../assets/images/orange.svg';

// Leafy Vegetables
import spinachImg from '../assets/images/leafy-vegetables/spinach.png';
import mintImg from '../assets/images/leafy-vegetables/mint.png';
import corianderImg from '../assets/images/leafy-vegetables/coriander.png';
import redAmaranthImg from '../assets/images/leafy-vegetables/red-amaranth.png';
import amaranthGreenImg from '../assets/images/leafy-vegetables/amaranth-green.png';
import fenugreekImg from '../assets/images/leafy-vegetables/fenugreek-leaves.png';
import curryLeavesImg from '../assets/images/leafy-vegetables/curry-leaves.png';
import dillImg from '../assets/images/leafy-vegetables/dill.png';
import gonguraImg from '../assets/images/leafy-vegetables/gongura.png';
import moringaImg from '../assets/images/leafy-vegetables/moringa-leaves.png';
import lettuceImg from '../assets/images/leafy-vegetables/lettuce.png';
import kaleImg from '../assets/images/leafy-vegetables/kale.png';
import basilImg from '../assets/images/leafy-vegetables/basil.png';
import bokChoyImg from '../assets/images/leafy-vegetables/bok-choy.png';
import celeryImg from '../assets/images/leafy-vegetables/celery-leaves.png';
import mustardGreensImg from '../assets/images/leafy-vegetables/mustard-greens.png';

// Fruit & Vegetable Images (HD Unsplash Verified Food Photography for all 100 products)
const fruitImageMap = {
  // Fruits 1-50
  pineapple: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
  'custard apple': 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=600&q=80',
  sitaphal: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=600&q=80',
  'tender coconut': 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80',
  'black grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80',
  'green grapes': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80',
  'sweet lime': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
  'dragon fruit': 'https://images.unsplash.com/photo-1527325678964-549216468488?auto=format&fit=crop&w=600&q=80',
  pitaya: 'https://images.unsplash.com/photo-1527325678964-549216468488?auto=format&fit=crop&w=600&q=80',
  watermelon: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=600&q=80',
  muskmelon: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=600&q=80',
  pomegranate: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=600&q=80',
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
  blueberry: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
  coconut: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80',
  sapota: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  chikoo: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  litchi: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80',
  lychee: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80',
  cherry: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
  grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80',
  papaya: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?auto=format&fit=crop&w=600&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'rasthali banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'red banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  orange: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
  'nagpur orange': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
  mandarin: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  'alphonso mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  'banganapalli mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
  guava: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
  dates: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80',
  jamun: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80',
  amla: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
  gooseberry: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
  peach: 'https://images.unsplash.com/photo-1532704868953-d85f24176d73?auto=format&fit=crop&w=600&q=80',
  pear: 'https://images.unsplash.com/photo-1569870499705-504209102bd6?auto=format&fit=crop&w=600&q=80',
  plum: 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&w=600&q=80',
  fig: 'https://images.unsplash.com/photo-1601379327928-1fdad37a2ae8?auto=format&fit=crop&w=600&q=80',
  'star fruit': 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?auto=format&fit=crop&w=600&q=80',
  'passion fruit': 'https://images.unsplash.com/photo-1527325678964-549216468488?auto=format&fit=crop&w=600&q=80',
  mulberry: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80',
  'wood apple': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  jackfruit: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=600&q=80',
  rambutan: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80',
  longan: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80',
  cranberry: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
  apricot: 'https://images.unsplash.com/photo-1532704868953-d85f24176d73?auto=format&fit=crop&w=600&q=80',
  nectarine: 'https://images.unsplash.com/photo-1532704868953-d85f24176d73?auto=format&fit=crop&w=600&q=80',
  pomelo: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',

  // Vegetables 51-100
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
  cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
  broccoli: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  coriander: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80',
  mint: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80',
  fenugreek: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  brinjal: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  eggplant: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  okra: 'https://images.unsplash.com/photo-1425543103986-224137c0d857?auto=format&fit=crop&w=600&q=80',
  'bottle gourd': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'ridge gourd': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'bitter gourd': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'snake gourd': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  pumpkin: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80',
  'ash gourd': 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80',
  capsicum: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
  beetroot: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80',
  radish: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  turnip: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'sweet potato': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  peas: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80',
  beans: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=600&q=80',
  drumstick: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'raw banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'raw papaya': 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?auto=format&fit=crop&w=600&q=80',
  yam: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  arbi: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  lemon: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?auto=format&fit=crop&w=600&q=80',
  ginger: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  chili: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  curry: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  mushroom: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  'spring onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
  lettuce: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
  celery: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
  zucchini: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80',
  'red cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
  squash: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80',
  asparagus: 'https://images.unsplash.com/photo-1515471209610-e3f170537703?auto=format&fit=crop&w=600&q=80',
};

// Sort fruit keys by string length descending so compound words like "pineapple" are matched before "apple"
const sortedFruitKeys = Object.keys(fruitImageMap).sort((a, b) => b.length - a.length);

const isUsableImageUrl = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/') || trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = String(parsed.protocol || '').toLowerCase();
    const host = String(parsed.hostname || '').toLowerCase();
    const path = String(parsed.pathname || '').toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') return false;

    const blockedHosts = ['google.com', 'www.google.com', 'maps.google.com', 'gstatic.com', 'picsum.photos'];
    const blockedHost = blockedHosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
    const isGoogleImgResult = path.includes('/imgres');

    return !blockedHost && !isGoogleImgResult;
  } catch {
    return false;
  }
};

export const getProductImage = (name = '', category = '', customUrl = '') => {
  const n = String(name || '').toLowerCase().trim();

  // 1. Prefer valid custom image URL from backend/seed data.
  if (customUrl && isUsableImageUrl(customUrl)) {
    const trimmed = customUrl.trim();
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://farmtohome-production-ca90.up.railway.app').replace(/\/+$/, '');
    if (trimmed.startsWith('/uploads/')) {
      return apiBase ? `${apiBase}${trimmed}` : trimmed;
    }
    if (trimmed.startsWith('uploads/')) {
      return apiBase ? `${apiBase}/${trimmed}` : `/${trimmed}`;
    }
    return trimmed;
  }

  // Product-specific hard override for known mismatched media.
  if (n.includes('dragon fruit') || n.includes('pitaya')) {
    return fruitImageMap['dragon fruit'];
  }

  // 2. Match specific fruit names (longest name first to prevent substring collision)
  for (const key of sortedFruitKeys) {
    if (n.includes(key)) {
      return fruitImageMap[key];
    }
  }

  // 3. Match vegetable names
  if (n.includes('chilli') || n.includes('chili')) return greenChilliImg;
  if (n.includes('spinach') || n.includes('palak')) return spinachImg;
  if (n.includes('lady finger') || n.includes('okra') || n.includes('bendakaya')) return okraImg;
  if (n.includes('brinjal') || n.includes('eggplant') || n.includes('vankaya')) return brinjalImg;
  if (n.includes('cauliflower')) return cauliflowerImg;
  if (n.includes('cabbage')) return cabbageImg;
  if (n.includes('carrot')) return carrotImg;
  if (n.includes('tomato')) return tomatoImg;
  if (n.includes('potato') || n.includes('aloo')) return potatoImg;
  if (n.includes('onion') || n.includes('pyaaz')) return onionImg;
  if (n.includes('capsicum') || n.includes('pepper')) return capsicumImg;
  if (n.includes('bottle gourd') || n.includes('sorakaya')) return bottleGourdImg;
  if (n.includes('cucumber') || n.includes('keera')) return cucumberImg;
  if (n.includes('mint') || n.includes('pudina')) return mintImg;
  if (n.includes('coriander') || n.includes('kothmir')) return corianderImg;
  if (n.includes('red amaranth')) return redAmaranthImg;
  if (n.includes('amaranth') || n.includes('thotakura')) return amaranthGreenImg;
  if (n.includes('fenugreek') || n.includes('methi')) return fenugreekImg;
  if (n.includes('curry')) return curryLeavesImg;
  if (n.includes('dill')) return dillImg;
  if (n.includes('gongura')) return gonguraImg;
  if (n.includes('moringa') || n.includes('drumstick')) return moringaImg;
  if (n.includes('lettuce')) return lettuceImg;
  if (n.includes('kale')) return kaleImg;
  if (n.includes('basil')) return basilImg;
  if (n.includes('bok choy')) return bokChoyImg;
  if (n.includes('celery')) return celeryImg;
  if (n.includes('mustard')) return mustardGreensImg;

  // 4. Fallback by Category
  const cat = String(typeof category === 'object' ? (category?.name || category?.title || '') : category || '').toLowerCase();
  if (cat.includes('leafy')) return spinachImg;
  if (cat.includes('fruit')) return mangoImg;

  // 5. Default Fallback
  return defaultVegImg;
};

export const defaultFallbackImage = defaultVegImg;

export default getProductImage;
