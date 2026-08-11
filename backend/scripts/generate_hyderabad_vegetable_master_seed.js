import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(scriptDir, '..');
const sqlDir = path.join(backendRoot, 'sql');
const outputSqlPath = path.join(sqlDir, 'hyderabad_vegetable_master_seed.sql');
const outputJsonPath = path.join(sqlDir, 'hyderabad_vegetable_master_seed.json');

if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

const catalog = [
  { name: 'Onion Big', teluguName: 'Pedda Ullipaya', category: 'Vegetables', subcategory: 'Onion', unit: 'kg', marketPrice: 31, retailPriceMin: 34, retailPriceMax: 40, sellingPrice: 38, imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80', imageAltText: 'Big onion bulbs', stockQuantity: 140, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Onion Small', teluguName: 'Chinna Ullipaya', category: 'Vegetables', subcategory: 'Onion', unit: 'kg', marketPrice: 53, retailPriceMin: 58, retailPriceMax: 69, sellingPrice: 64, imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80', imageAltText: 'Small onions', stockQuantity: 120, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Tomato', teluguName: 'Tamata', category: 'Vegetables', subcategory: 'Fruit Vegetable', unit: 'kg', marketPrice: 21, retailPriceMin: 23, retailPriceMax: 27, sellingPrice: 25, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', imageAltText: 'Fresh tomatoes', stockQuantity: 160, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Green Chilli', teluguName: 'Pachhi Mirapakayalu', category: 'Vegetables', subcategory: 'Chilli', unit: 'kg', marketPrice: 62, retailPriceMin: 68, retailPriceMax: 81, sellingPrice: 75, imageUrl: 'https://images.unsplash.com/photo-1600595563935-7f1bbd1330a9?auto=format&fit=crop&w=600&q=80', imageAltText: 'Green chillies', stockQuantity: 90, minimumOrderQuantity: 0.5, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Beetroot', teluguName: 'Beetroot', category: 'Vegetables', subcategory: 'Root Vegetable', unit: 'kg', marketPrice: 41, retailPriceMin: 45, retailPriceMax: 53, sellingPrice: 49, imageUrl: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80', imageAltText: 'Fresh beetroot', stockQuantity: 110, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Potato', teluguName: 'Bangala Dumpa', category: 'Vegetables', subcategory: 'Tuber', unit: 'kg', marketPrice: 24, retailPriceMin: 26, retailPriceMax: 31, sellingPrice: 29, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', imageAltText: 'Potatoes', stockQuantity: 200, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Raw Banana', teluguName: 'Arati Kaya', category: 'Vegetables', subcategory: 'Plantain', unit: 'kg', marketPrice: 11, retailPriceMin: 12, retailPriceMax: 14, sellingPrice: 13, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', imageAltText: 'Raw bananas', stockQuantity: 85, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Amaranth Leaves', teluguName: 'Thotakura', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 9, retailPriceMin: 10, retailPriceMax: 12, sellingPrice: 11, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', imageAltText: 'Amaranth leaves', stockQuantity: 70, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Amla', teluguName: 'Usiri', category: 'Vegetables', subcategory: 'Fruit Vegetable', unit: 'kg', marketPrice: 80, retailPriceMin: 88, retailPriceMax: 104, sellingPrice: 95, imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80', imageAltText: 'Amla gooseberry', stockQuantity: 60, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Ash Gourd', teluguName: 'Boodida Gummadi', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 19, retailPriceMin: 21, retailPriceMax: 25, sellingPrice: 23, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Ash gourd', stockQuantity: 95, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Baby Corn', teluguName: 'Baby Corn', category: 'Vegetables', subcategory: 'Corn', unit: 'kg', marketPrice: 40, retailPriceMin: 44, retailPriceMax: 52, sellingPrice: 48, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', imageAltText: 'Baby corn', stockQuantity: 75, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Banana Flower', teluguName: 'Arati Puvvu', category: 'Vegetables', subcategory: 'Flower Vegetable', unit: 'piece', marketPrice: 16, retailPriceMin: 18, retailPriceMax: 21, sellingPrice: 20, imageUrl: 'https://images.unsplash.com/photo-1604478058004-5f9f2f5d8fd2?auto=format&fit=crop&w=600&q=80', imageAltText: 'Banana flower', stockQuantity: 42, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Capsicum', teluguName: 'Simla Mirapakayalu', category: 'Vegetables', subcategory: 'Bell Pepper', unit: 'kg', marketPrice: 44, retailPriceMin: 48, retailPriceMax: 57, sellingPrice: 53, imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80', imageAltText: 'Capsicum peppers', stockQuantity: 88, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Bitter Gourd', teluguName: 'Kakarakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 39, retailPriceMin: 43, retailPriceMax: 51, sellingPrice: 47, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Bitter gourd', stockQuantity: 78, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Bottle Gourd', teluguName: 'Sorakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 30, retailPriceMin: 33, retailPriceMax: 39, sellingPrice: 36, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Bottle gourd', stockQuantity: 90, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Butter Beans', teluguName: 'Butter Beans', category: 'Vegetables', subcategory: 'Beans', unit: 'kg', marketPrice: 39, retailPriceMin: 43, retailPriceMax: 51, sellingPrice: 47, imageUrl: 'https://images.unsplash.com/photo-1566953952062-6d47dfd6c2f5?auto=format&fit=crop&w=600&q=80', imageAltText: 'Butter beans', stockQuantity: 58, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Broad Beans', teluguName: 'Chikkudu Beans', category: 'Vegetables', subcategory: 'Beans', unit: 'kg', marketPrice: 38, retailPriceMin: 42, retailPriceMax: 49, sellingPrice: 46, imageUrl: 'https://images.unsplash.com/photo-1566953952062-6d47dfd6c2f5?auto=format&fit=crop&w=600&q=80', imageAltText: 'Broad beans', stockQuantity: 64, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Cabbage', teluguName: 'Cabbage', category: 'Vegetables', subcategory: 'Leafy Head', unit: 'kg', marketPrice: 30, retailPriceMin: 33, retailPriceMax: 39, sellingPrice: 36, imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', imageAltText: 'Cabbage head', stockQuantity: 130, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Carrot', teluguName: 'Carrot', category: 'Vegetables', subcategory: 'Root Vegetable', unit: 'kg', marketPrice: 50, retailPriceMin: 55, retailPriceMax: 65, sellingPrice: 60, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Carrots', stockQuantity: 115, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Cauliflower', teluguName: 'Cauliflower', category: 'Vegetables', subcategory: 'Flower Vegetable', unit: 'piece', marketPrice: 34, retailPriceMin: 37, retailPriceMax: 44, sellingPrice: 41, imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80', imageAltText: 'Cauliflower', stockQuantity: 100, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Cluster Beans', teluguName: 'Goru Chikkudu', category: 'Vegetables', subcategory: 'Beans', unit: 'kg', marketPrice: 43, retailPriceMin: 47, retailPriceMax: 56, sellingPrice: 52, imageUrl: 'https://images.unsplash.com/photo-1566953952062-6d47dfd6c2f5?auto=format&fit=crop&w=600&q=80', imageAltText: 'Cluster beans', stockQuantity: 68, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Coconut', teluguName: 'Kobbari Kaya', category: 'Vegetables', subcategory: 'Nut', unit: 'piece', marketPrice: 62, retailPriceMin: 68, retailPriceMax: 81, sellingPrice: 74, imageUrl: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80', imageAltText: 'Coconut', stockQuantity: 90, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Colocasia Leaves', teluguName: 'Chamagadda Aaku', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 14, retailPriceMin: 15, retailPriceMax: 18, sellingPrice: 17, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Colocasia leaves', stockQuantity: 45, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Colocasia', teluguName: 'Chamagadda', category: 'Vegetables', subcategory: 'Root Vegetable', unit: 'kg', marketPrice: 25, retailPriceMin: 28, retailPriceMax: 33, sellingPrice: 30, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Colocasia roots', stockQuantity: 62, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Coriander Leaves', teluguName: 'Kothimeera', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 11, retailPriceMin: 12, retailPriceMax: 14, sellingPrice: 13, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', imageAltText: 'Coriander leaves', stockQuantity: 120, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Corn', teluguName: 'Mokka Jonna', category: 'Vegetables', subcategory: 'Corn', unit: 'piece', marketPrice: 30, retailPriceMin: 33, retailPriceMax: 39, sellingPrice: 36, imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80', imageAltText: 'Corn cobs', stockQuantity: 96, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Cucumber', teluguName: 'Dosakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 27, retailPriceMin: 30, retailPriceMax: 35, sellingPrice: 33, imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80', imageAltText: 'Cucumbers', stockQuantity: 105, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'French Beans', teluguName: 'French Beans', category: 'Vegetables', subcategory: 'Beans', unit: 'kg', marketPrice: 73, retailPriceMin: 80, retailPriceMax: 95, sellingPrice: 88, imageUrl: 'https://images.unsplash.com/photo-1566953952062-6d47dfd6c2f5?auto=format&fit=crop&w=600&q=80', imageAltText: 'French beans', stockQuantity: 74, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Garlic', teluguName: 'Vellulli', category: 'Vegetables', subcategory: 'Bulb', unit: 'kg', marketPrice: 177, retailPriceMin: 195, retailPriceMax: 230, sellingPrice: 210, imageUrl: 'https://images.unsplash.com/photo-1608805905077-f3a7c4f2bfa5?auto=format&fit=crop&w=600&q=80', imageAltText: 'Garlic bulbs', stockQuantity: 66, minimumOrderQuantity: 0.5, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Ginger', teluguName: 'Allam', category: 'Vegetables', subcategory: 'Rhizome', unit: 'kg', marketPrice: 81, retailPriceMin: 89, retailPriceMax: 105, sellingPrice: 97, imageUrl: 'https://images.unsplash.com/photo-1589870143925-0ca7a0e0d6b8?auto=format&fit=crop&w=600&q=80', imageAltText: 'Fresh ginger', stockQuantity: 82, minimumOrderQuantity: 0.5, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Spring Onion', teluguName: 'Green Onions', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 33, retailPriceMin: 36, retailPriceMax: 43, sellingPrice: 40, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', imageAltText: 'Spring onions', stockQuantity: 58, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Green Peas', teluguName: 'Pachi Batani', category: 'Vegetables', subcategory: 'Legume', unit: 'kg', marketPrice: 50, retailPriceMin: 55, retailPriceMax: 65, sellingPrice: 60, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Green peas', stockQuantity: 88, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Ivy Gourd', teluguName: 'Dondakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 33, retailPriceMin: 36, retailPriceMax: 43, sellingPrice: 40, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Ivy gourd', stockQuantity: 70, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Lemon', teluguName: 'Nimmakaya', category: 'Vegetables', subcategory: 'Citrus', unit: 'piece', marketPrice: 50, retailPriceMin: 55, retailPriceMax: 65, sellingPrice: 60, imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80', imageAltText: 'Lemons', stockQuantity: 100, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Ridge Gourd', teluguName: 'Beerakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 34, retailPriceMin: 37, retailPriceMax: 44, sellingPrice: 41, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Ridge gourd', stockQuantity: 84, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Shallot', teluguName: 'Sannagadda Ullipaya', category: 'Vegetables', subcategory: 'Onion', unit: 'kg', marketPrice: 40, retailPriceMin: 44, retailPriceMax: 52, sellingPrice: 48, imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80', imageAltText: 'Shallots', stockQuantity: 72, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Snake Gourd', teluguName: 'Potlakaya', category: 'Vegetables', subcategory: 'Gourd', unit: 'kg', marketPrice: 37, retailPriceMin: 41, retailPriceMax: 48, sellingPrice: 45, imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=600&q=80', imageAltText: 'Snake gourd', stockQuantity: 76, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: false },
  { name: 'Sorrel Leaves', teluguName: 'Gongura Aaku', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 10, retailPriceMin: 11, retailPriceMax: 13, sellingPrice: 12, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', imageAltText: 'Sorrel leaves', stockQuantity: 40, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Spinach', teluguName: 'Palakura', category: 'Leafy Vegetables', subcategory: 'Leafy Greens', unit: 'bunch', marketPrice: 11, retailPriceMin: 12, retailPriceMax: 14, sellingPrice: 13, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', imageAltText: 'Spinach leaves', stockQuantity: 80, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
  { name: 'Sweet Potato', teluguName: 'Genna Dumpa', category: 'Vegetables', subcategory: 'Root Vegetable', unit: 'kg', marketPrice: 32, retailPriceMin: 35, retailPriceMax: 42, sellingPrice: 39, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', imageAltText: 'Sweet potatoes', stockQuantity: 86, minimumOrderQuantity: 1, farmerName: 'Hyderabad Market Yard', location: 'Gaddiannaram, Hyderabad', isOrganic: true },
];

const defaultPriceSource = 'Hyderabad starter prices 06-Aug-2026';
const defaultTimestamp = '2026-08-06T09:00:00';

const escapeSql = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
};

const rows = catalog.map((item, index) => {
  const originalPrice = Number(item.marketPrice);
  const sellingPrice = Number(item.sellingPrice);
  const discount = Math.max(0, Math.round((1 - (sellingPrice / originalPrice)) * 100));
  return {
    product_name: item.name,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    category: item.category,
    subcategory: item.subcategory,
    telugu_name: item.teluguName,
    description: `${item.name} sourced from Hyderabad market yards with hand-picked grading and daily freshness control.`,
    image_alt_text: item.imageAltText,
    image_url: item.imageUrl,
    farmer_id: null,
    market_price: originalPrice,
    retail_price_min: item.retailPriceMin,
    retail_price_max: item.retailPriceMax,
    original_price: originalPrice,
    selling_price: sellingPrice,
    discount_percentage: discount,
    available_units: item.unit,
    price: sellingPrice,
    stock_quantity: item.stockQuantity,
    quantity: item.stockQuantity,
    unit: item.unit === 'piece' ? 'PIECE' : item.unit === 'bunch' ? 'BUNCH' : item.unit === 'dozen' ? 'DOZEN' : item.unit === '500 g' ? 'HALF_KG' : item.unit === '250 g' ? 'QUARTER_KG' : item.unit === 'packet' ? 'PACKET' : item.unit === 'litre' ? 'LITRE' : 'KG',
    farmer_name: item.farmerName,
    farmer_location: item.location,
    minimum_order_quantity: item.minimumOrderQuantity,
    maximum_order_quantity: Math.max(item.minimumOrderQuantity, Math.min(item.stockQuantity, item.unit === 'piece' ? 20 : 25)),
    status: 'ACTIVE',
    is_featured: index % 7 === 0,
    is_organic: Boolean(item.isOrganic),
    is_pre_order: false,
    expected_delivery_date: null,
    last_price_updated_at: defaultTimestamp,
    price_source: defaultPriceSource,
    stock_status: item.stockQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    created_at: defaultTimestamp,
    updated_at: defaultTimestamp,
  };
});

const columns = [
  'product_name', 'slug', 'category', 'subcategory', 'telugu_name', 'description', 'image_alt_text', 'image_url',
  'farmer_id', 'market_price', 'retail_price_min', 'retail_price_max', 'original_price', 'selling_price',
  'discount_percentage', 'available_units', 'price', 'stock_quantity', 'quantity', 'unit', 'farmer_name',
  'farmer_location', 'minimum_order_quantity', 'maximum_order_quantity', 'status', 'is_featured', 'is_organic',
  'is_pre_order', 'expected_delivery_date', 'last_price_updated_at', 'price_source', 'stock_status', 'created_at', 'updated_at'
];

const values = rows.map((row) => `(${columns.map((column) => escapeSql(row[column])).join(', ')})`).join(',\n');
const sql = [
  '-- Hyderabad Vegetable Master Seed generated from the user-provided starter list',
  '-- Run after products_schema.sql so the Hyderabad price columns exist',
  '',
  `INSERT INTO products (${columns.join(', ')}) VALUES`,
  values + ';',
  ''
].join('\n');

fs.writeFileSync(outputSqlPath, sql, 'utf8');
fs.writeFileSync(outputJsonPath, JSON.stringify(rows, null, 2), 'utf8');
console.log(`Wrote ${rows.length} vegetable rows to ${outputSqlPath}`);
