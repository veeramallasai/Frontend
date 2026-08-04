import api from './api';
import { getProductImage } from '../utils/productImageMapper';
import seedProducts from '../data/products.json';
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

// Uses the centralized `api` axios instance (src/services/api.js) so all
// catalog requests share the same base URL, auth interceptors, and error
// handling as the rest of the app. Configure the backend URL via
// VITE_API_BASE_URL / VITE_API_URL (see .env.example).

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCategoryName = (cat) => {
  if (!cat) return 'Vegetables';
  if (typeof cat === 'object') return cat.name || cat.slug || 'Vegetables';
  return String(cat);
};

const pickLocalProductImage = (name, category) => {
  const normalizedName = String(name || '').toLowerCase();

  if (normalizedName.includes('capsicum')) return capsicumImg;
  if (normalizedName.includes('ladies finger') || normalizedName.includes('okra')) return ladiesFingerImg;
  if (normalizedName.includes('brinjal') || normalizedName.includes('eggplant')) return brinjalImg;
  if (normalizedName.includes('bottle gourd')) return bottleGourdImg;
  if (normalizedName.includes('tomato')) return tomatoImg;
  if (normalizedName.includes('potato')) return potatoImg;
  if (normalizedName.includes('onion')) return onionImg;
  if (normalizedName.includes('carrot')) return carrotImg;
  if (normalizedName.includes('cabbage')) return cabbageImg;
  if (normalizedName.includes('cauliflower')) return cauliflowerImg;
  if (normalizedName.includes('chilli') || normalizedName.includes('chili')) return greenChilliImg;
  if (normalizedName.includes('cucumber')) return cucumberImg;
  if (normalizedName.includes('banana')) return bananaImg;
  if (normalizedName.includes('apple')) return appleImg;
  if (normalizedName.includes('mango')) return mangoImg;
  if (normalizedName.includes('orange')) return orangeImg;
  if (normalizedName.includes('mosambi') || normalizedName.includes('sweet lime')) return orangeImg;
  if (normalizedName.includes('citrus')) return orangeImg;

  const normalizedCategory = String(parseCategoryName(category)).toLowerCase();
  if (normalizedCategory.includes('vegetable')) return defaultVegImg;
  if (normalizedCategory.includes('fruit')) return mangoImg;
  return defaultVegImg;
};

const isHttpUrl = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

const resolveCatalogImage = (product) => {
  return getProductImage(product?.name, product?.category, product?.imageUrl || product?.image);
};

const normalizeProduct = (product) => ({
  id: product.id,
  name: product.name,
  category: parseCategoryName(product.category),
  description: product.description,
  price: toNumber(product.price),
  unit: product.unit,
  stockQuantity: toNumber(product.stockQuantity),
  imageUrl: resolveCatalogImage(product),
  discount: toNumber(product.discount),
  rating: toNumber(product.rating),
  farmerName: product.farmerName,
  location: product.location,
  organic: Boolean(product.organic),
});

const mapApiResponseToList = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData.map(normalizeProduct);
  }

  if (responseData?.content && Array.isArray(responseData.content)) {
    return responseData.content.map(normalizeProduct);
  }

  if (responseData?.data && Array.isArray(responseData.data)) {
    return responseData.data.map(normalizeProduct);
  }

  return [];
};

const filterLocalProducts = ({
  keyword = '',
  category = 'All',
  minPrice = '',
  maxPrice = '',
  organic = 'all',
}) => {
  const query = keyword.trim().toLowerCase();
  const min = minPrice === '' ? null : toNumber(minPrice, 0);
  const max = maxPrice === '' ? null : toNumber(maxPrice, Number.MAX_SAFE_INTEGER);

  return seedProducts
    .map(normalizeProduct)
    .filter((item) => {
      const matchesKeyword =
        query.length === 0
        || item.name.toLowerCase().includes(query)
        || item.description.toLowerCase().includes(query)
        || item.farmerName.toLowerCase().includes(query);

      const matchesCategory = category === 'All' || item.category === category;
      const matchesMin = min === null || item.price >= min;
      const matchesMax = max === null || item.price <= max;
      const matchesOrganic = organic === 'all' || item.organic === (organic === 'true');

      return matchesKeyword && matchesCategory && matchesMin && matchesMax && matchesOrganic;
    });
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

export const productService = {
  async getProducts(filters = {}) {
    const {
      page = 1,
      pageSize = 12,
      keyword = '',
      category = 'All',
      minPrice = '',
      maxPrice = '',
      organic = 'all',
    } = filters;

    try {
      const response = await api.get('/products/filter', {
        params: {
          keyword: keyword || null,
          category: category === 'All' ? null : category,
          minPrice: minPrice === '' ? null : toNumber(minPrice),
          maxPrice: maxPrice === '' ? null : toNumber(maxPrice),
          organic: organic === 'all' ? null : organic === 'true',
          page: Math.max(0, page - 1),
          size: pageSize,
        },
      });

      const body = response.data;
      const list = mapApiResponseToList(body);

      if (Array.isArray(body?.content)) {
        return {
          items: list,
          totalItems: toNumber(body.totalElements, list.length),
          totalPages: Math.max(1, toNumber(body.totalPages, 1)),
          page: toNumber(body.number, 0) + 1,
          pageSize: toNumber(body.size, pageSize),
        };
      }

      return paginate(list, page, pageSize);
    } catch (error) {
      const fallbackList = filterLocalProducts({ keyword, category, minPrice, maxPrice, organic });
      return paginate(fallbackList, page, pageSize);
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      const fallback = seedProducts.find((item) => String(item.id) === String(id));
      if (fallback) {
        return normalizeProduct(fallback);
      }
      throw unwrapError(error, 'Product not found');
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
      const response = await api.post('/products', payload);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      throw unwrapError(error, 'Failed to create product');
    }
  },

  async updateProduct(id, payload) {
    try {
      const response = await api.put(`/products/${id}`, payload);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      throw unwrapError(error, 'Failed to update product');
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      throw unwrapError(error, 'Failed to delete product');
    }
  },
};
