import api from './api';
import { getProductImage } from '../utils/productImageMapper';
import capsicumImg from '../assets/images/capsicum.png';
import ladiesFingerImg from '../assets/images/okra.png';
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
import bananaImg from '../assets/images/banana.svg';
import appleImg from '../assets/images/apple.svg';
import mangoImg from '../assets/images/mango.svg';
import orangeImg from '../assets/images/orange.svg';

const catalogApi = api;
const fallbackCatalogBaseUrl = (import.meta.env.VITE_FALLBACK_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api(\/v1)?$/, '');

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_PROXY_TARGET || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api(\/v1)?$/, '');

export const FALLBACK_IMAGE = "/images/product-placeholder.svg";

export const resolveImageUrl = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return `${API_ORIGIN}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

const parseCategoryName = (cat) => {
  if (!cat) return 'Vegetables';
  if (typeof cat === 'object') return cat.name || cat.slug || 'Vegetables';
  return String(cat);
};

const resolveCatalogImage = (product) => {
  const primaryNestedImage = Array.isArray(product?.images)
    ? (product.images.find((image) => image?.primaryImage)?.imageUrl || product.images[0]?.imageUrl)
    : '';

  const apiImage =
    product?.imageUrl
    || product?.image_path
    || product?.imagePath
    || primaryNestedImage
    || product?.productImage
    || product?.thumbnailUrl
    || product?.thumbnail
    || product?.primaryImage
    || product?.image;

  return getProductImage(product?.productName || product?.name, product?.category, resolveImageUrl(apiImage));
};

export const normalizeProduct = (product) => {
  if (!product) return null;
  const rawImage =
    product.imageUrl
    || product.image_path
    || product.imagePath
    || (Array.isArray(product.images) ? (product.images.find((img) => img?.primaryImage)?.imageUrl || product.images[0]?.imageUrl) : '')
    || product.productImage
    || product.thumbnailUrl
    || product.thumbnail
    || product.primaryImage
    || product.image
    || '';

  const resolvedImg = getProductImage(
    product.productName || product.name,
    product.category,
    rawImage
  );

  return {
    ...product,
    id: product.id || product.productId || product.sku,
    name: product.productName || product.name || 'Unnamed product',
    category: parseCategoryName(product.category),
    teluguName: product.teluguName,
    description: product.description,
    marketPrice: toNumber(product.marketPrice ?? product.originalPrice ?? product.price),
    price: toNumber(product.sellingPrice ?? product.price ?? 0),
    originalPrice: toNumber(product.originalPrice ?? product.marketPrice ?? product.price ?? 0),
    sellingPrice: toNumber(product.sellingPrice ?? product.price ?? 0),
    unit: product.unit || 'kg',
    stockQuantity: toNumber(product.stockQuantity ?? product.quantity ?? product.stock ?? 50),
    imageUrl: resolvedImg || FALLBACK_IMAGE,
    imagePath: resolveImageUrl(product.imagePath || product.image_path || rawImage),
    discount: toNumber(product.discountPercentage ?? product.discount),
    rating: toNumber(product.rating, 4.5),
    farmerName: product.farmerName,
    location: product.farmerLocation || product.location,
    organic: Boolean(product.isOrganic ?? product.organic),
    status: product.status || 'ACTIVE',
    imageAltText: product.imageAltText || `${product.productName || product.name || 'Product'} image`,
  };
};

const isActiveProduct = (product) => Boolean(product && (product.id || product.name));

const mapApiResponseToList = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData.map(normalizeProduct);
  }

  if (responseData?.content && Array.isArray(responseData.content)) {
    return responseData.content.map(normalizeProduct);
  }

  if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
    return responseData.data.content.map(normalizeProduct);
  }

  if (responseData?.data && Array.isArray(responseData.data)) {
    return responseData.data.map(normalizeProduct);
  }

  if (responseData?.items && Array.isArray(responseData.items)) {
    return responseData.items.map(normalizeProduct);
  }

  return [];
};

const getApiPageMeta = (responseData) => {
  const pageData = responseData?.data?.content ? responseData.data : responseData;
  return {
    totalPages: Math.max(1, toNumber(pageData?.totalPages, 1)),
    totalElements: Math.max(0, toNumber(pageData?.totalElements, 0)),
    size: Math.max(1, toNumber(pageData?.size, 10)),
    number: Math.max(0, toNumber(pageData?.number, 0)),
  };
};

const paginate = (items, page = 1, pageSize = 12) => {
  const safePage = Math.max(1, toNumber(page, 1));
  const safePageSize = Math.max(1, toNumber(pageSize, 12));
  const start = (safePage - 1) * safePageSize;
  const pagedItems = items.slice(start, start + safePageSize);

  return {
    items: pagedItems,
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safePageSize)),
    page: safePage,
    pageSize: safePageSize,
  };
};

const unwrapError = (error, fallbackMessage) => {
  const message = error?.response?.data?.message || error?.message || fallbackMessage;
  return new Error(message);
};

const fetchCatalogPage = async (params) => {
  const response = await api.get('/products', { params });
  return response.data;
};

const FALLBACK_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Fresh Organic Tomatoes',
    category: 'Vegetables',
    teluguName: 'టమోటాలు',
    description: 'Farm-fresh, naturally ripened juicy red tomatoes harvested daily.',
    marketPrice: 50,
    price: 38,
    originalPrice: 50,
    sellingPrice: 38,
    unit: 'kg',
    stockQuantity: 100,
    imageUrl: tomatoImg,
    discount: 24,
    rating: 4.8,
    farmerName: 'Ramesh Reddy',
    location: 'Medak, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-2',
    name: 'Crisp Farm Carrots',
    category: 'Vegetables',
    teluguName: 'క్యారెట్లు',
    description: 'Sweet, crunchy pesticide-free carrots packed with Beta-carotene.',
    marketPrice: 65,
    price: 48,
    originalPrice: 65,
    sellingPrice: 48,
    unit: 'kg',
    stockQuantity: 80,
    imageUrl: carrotImg,
    discount: 26,
    rating: 4.7,
    farmerName: 'Venkat Rao',
    location: 'Rangareddy, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-3',
    name: 'Fresh Green Capsicum',
    category: 'Vegetables',
    teluguName: 'బెల్ పెప్పర్',
    description: 'Vibrant green bell peppers, rich in Vitamin C.',
    marketPrice: 70,
    price: 52,
    originalPrice: 70,
    sellingPrice: 52,
    unit: 'kg',
    stockQuantity: 60,
    imageUrl: capsicumImg,
    discount: 25,
    rating: 4.6,
    farmerName: 'Lakshmi Narayana',
    location: 'Nalgonda, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-4',
    name: 'Organic Cabbage',
    category: 'Vegetables',
    teluguName: 'కాబేజీ',
    description: 'Crisp leafy cabbage grown with organic compost.',
    marketPrice: 40,
    price: 28,
    originalPrice: 40,
    sellingPrice: 28,
    unit: 'kg',
    stockQuantity: 75,
    imageUrl: cabbageImg,
    discount: 30,
    rating: 4.5,
    farmerName: 'Suresh Babu',
    location: 'Karimnagar, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-5',
    name: 'Fresh Cauliflower',
    category: 'Vegetables',
    teluguName: 'గోబీ',
    description: 'Clean white cauliflower florets direct from rural farms.',
    marketPrice: 55,
    price: 42,
    originalPrice: 55,
    sellingPrice: 42,
    unit: 'kg',
    stockQuantity: 50,
    imageUrl: cauliflowerImg,
    discount: 23,
    rating: 4.6,
    farmerName: 'Krishna Murthy',
    location: 'Warangal, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-6',
    name: 'Tender Okra (Ladies Finger)',
    category: 'Vegetables',
    teluguName: 'బెండకాయ',
    description: 'Soft tender okra harvested early morning for maximum freshness.',
    marketPrice: 60,
    price: 45,
    originalPrice: 60,
    sellingPrice: 45,
    unit: 'kg',
    stockQuantity: 90,
    imageUrl: ladiesFingerImg,
    discount: 25,
    rating: 4.8,
    farmerName: 'Ramesh Reddy',
    location: 'Medak, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-7',
    name: 'Alphonso Mangoes',
    category: 'Fruit',
    teluguName: 'మామిడి పళ్ళు',
    description: 'Sweet, aromatic premium organic mangoes.',
    marketPrice: 240,
    price: 180,
    originalPrice: 240,
    sellingPrice: 180,
    unit: 'kg',
    stockQuantity: 40,
    imageUrl: mangoImg,
    discount: 25,
    rating: 4.9,
    farmerName: 'Anil Kumar',
    location: 'Chittoor, AP',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-8',
    name: 'Farm Fresh Bananas',
    category: 'Fruit',
    teluguName: 'అరటి పళ్ళు',
    description: 'Naturally ripened sweet bananas.',
    marketPrice: 60,
    price: 44,
    originalPrice: 60,
    sellingPrice: 44,
    unit: 'dozen',
    stockQuantity: 120,
    imageUrl: bananaImg,
    discount: 26,
    rating: 4.7,
    farmerName: 'Subba Rao',
    location: 'Guntur, AP',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-9',
    name: 'Crisp Red Apples',
    category: 'Fruit',
    teluguName: 'యాపిల్స్',
    description: 'Sweet, juicy red apples.',
    marketPrice: 180,
    price: 140,
    originalPrice: 180,
    sellingPrice: 140,
    unit: 'kg',
    stockQuantity: 65,
    imageUrl: appleImg,
    discount: 22,
    rating: 4.8,
    farmerName: 'Rajesh Sharma',
    location: 'Shimla, HP',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-10',
    name: 'Juicy Nagpur Oranges',
    category: 'Fruit',
    teluguName: 'కమలా పళ్ళు',
    description: 'Rich in Vitamin-C juicy sweet oranges.',
    marketPrice: 120,
    price: 89,
    originalPrice: 120,
    sellingPrice: 89,
    unit: 'kg',
    stockQuantity: 85,
    imageUrl: orangeImg,
    discount: 25,
    rating: 4.6,
    farmerName: 'Prakash Patil',
    location: 'Nagpur, MH',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-11',
    name: 'Fresh Spinach (Palak)',
    category: 'Leafy Vegetables',
    teluguName: 'పాలకూర',
    description: 'Iron-rich, vibrant green organic spinach leaves.',
    marketPrice: 30,
    price: 20,
    originalPrice: 30,
    sellingPrice: 20,
    unit: 'bunch',
    stockQuantity: 150,
    imageUrl: defaultVegImg,
    discount: 33,
    rating: 4.9,
    farmerName: 'Sita Ramaiah',
    location: 'Khammam, Telangana',
    organic: true,
    status: 'ACTIVE'
  },
  {
    id: 'demo-12',
    name: 'Fresh Green Chilli',
    category: 'Vegetables',
    teluguName: 'పచ్చి మిర్చి',
    description: 'Spicy farm-fresh green chillies.',
    marketPrice: 50,
    price: 36,
    originalPrice: 50,
    sellingPrice: 36,
    unit: 'kg',
    stockQuantity: 110,
    imageUrl: greenChilliImg,
    discount: 28,
    rating: 4.5,
    farmerName: 'Gopal Reddy',
    location: 'Warangal, Telangana',
    organic: true,
    status: 'ACTIVE'
  }
];

export const productService = {
  async getAllActiveProducts() {
    try {
      const response = await catalogApi.get('/products');
      const products = mapApiResponseToList(response.data);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
      return FALLBACK_PRODUCTS;
    } catch (error) {
      console.warn('Network error encountered loading products from API:', error?.message);
      return FALLBACK_PRODUCTS;
    }
  },

  async getProducts(params = {}) {
    try {
      const response = await catalogApi.get('/products', { params });
      const rawData = response.data?.products ?? response.data?.data ?? response.data ?? [];
      const products = Array.isArray(rawData) ? rawData.map(normalizeProduct) : [];

      return {
        success: true,
        products: products.length > 0 ? products : FALLBACK_PRODUCTS,
        message: null,
      };
    } catch (error) {
      console.error('Failed to load products:', error?.message || error);
      return {
        success: false,
        products: FALLBACK_PRODUCTS,
        message: error.response?.data?.message || 'Products are temporarily unavailable.',
      };
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      const body = response.data?.data || response.data;
      return normalizeProduct(body);
    } catch (error) {
      console.error(`Failed to load product ${id}:`, error);
      const found = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id)) || FALLBACK_PRODUCTS[0];
      return found;
    }
  },

  async getProductsByCategory(category, page = 1, pageSize = 12) {
    const normalizedCategory = category || 'All';
    return this.getProducts({ category: normalizedCategory, page, pageSize });
  },

  async searchProducts(keyword, page = 1, pageSize = 12) {
    return this.getProducts({ keyword, page, pageSize });
  },

  async createProduct(payload) {
    try {
      const response = await catalogApi.post('/products', payload);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      throw unwrapError(error, 'Failed to create product');
    }
  },

  async updateProduct(id, payload) {
    try {
      const response = await catalogApi.put(`/products/${id}`, payload);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      throw unwrapError(error, 'Failed to update product');
    }
  },

  async deleteProduct(id) {
    try {
      await catalogApi.delete(`/products/${id}`);
      return true;
    } catch (error) {
      throw unwrapError(error, 'Failed to delete product');
    }
  },
};

export async function getProducts(params = {}) {
  return productService.getProducts(params);
}

export default productService;
