import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = scriptDir;
const dataDir = path.join(workspaceRoot, 'src', 'data');
const sqlDir = path.join(workspaceRoot, 'backend', 'sql');
const resourcesSeedDir = path.join(workspaceRoot, 'backend', 'src', 'main', 'resources', 'seeds');
const productsJsonPath = path.join(dataDir, 'products.json');
const leafyPath = path.join(dataDir, 'leafyVegetables.js');
const sqlPath = path.join(sqlDir, 'products_seed.sql');
const jsonPath = path.join(sqlDir, 'products_seed.json');
const resourceJsonPath = path.join(resourcesSeedDir, 'products_seed.json');

if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

if (!fs.existsSync(resourcesSeedDir)) {
  fs.mkdirSync(resourcesSeedDir, { recursive: true });
}

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

const leafySource = fs.readFileSync(leafyPath, 'utf8');
const leafyStart = leafySource.indexOf('[');
const leafyEnd = leafySource.lastIndexOf(']');
const leafyVegetables = vm.runInNewContext(`(${leafySource.slice(leafyStart, leafyEnd + 1)})`);

const herbs = [
  { name: 'Tulsi Holy Basil', localName: 'Tulsi', price: 25, weight: '100 g', stock: 40, organic: true, imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80', description: 'Fresh holy basil leaves with a strong aroma and natural wellness appeal.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Rosemary', localName: 'Rosemary', price: 75, weight: '100 g', stock: 18, organic: true, imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', description: 'Fresh rosemary sprigs suitable for roasting, breads and sauces.', farmerLocation: 'Shamshabad, Telangana' },
  { name: 'Thyme', localName: 'Thyme', price: 70, weight: '100 g', stock: 16, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', description: 'Fragrant thyme sprigs for soups, grills and Mediterranean cooking.', farmerLocation: 'Medchal, Telangana' },
  { name: 'Oregano', localName: 'Oregano', price: 65, weight: '100 g', stock: 15, organic: true, imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80', description: 'Aromatic oregano for pizzas, pasta and baked dishes.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Parsley', localName: 'Parsley', price: 45, weight: '100 g', stock: 20, organic: true, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', description: 'Fresh parsley suitable for garnishing and seasoning dishes.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Sage', localName: 'Sage', price: 80, weight: '100 g', stock: 12, organic: true, imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80', description: 'Soft sage leaves with a warm flavour for roasts and butter sauces.', farmerLocation: 'Moinabad, Telangana' },
];

const grains = [
  { name: 'Basmati Rice', localName: 'Rice', price: 95, weight: '1 kg', stock: 120, organic: false, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', description: 'Long-grain aromatic rice ideal for biryani and daily meals.', farmerLocation: 'Nizamabad, Telangana' },
  { name: 'Sona Masoori Rice', localName: 'Rice', price: 68, weight: '1 kg', stock: 140, organic: false, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', description: 'Light and fluffy rice widely used in South Indian kitchens.', farmerLocation: 'Nalgonda, Telangana' },
  { name: 'Wheat Flour', localName: 'Atta', price: 48, weight: '1 kg', stock: 150, organic: false, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Freshly milled wheat flour for rotis, chapatis and parathas.', farmerLocation: 'Sangareddy, Telangana' },
  { name: 'Jowar Flour', localName: 'Jowar', price: 55, weight: '1 kg', stock: 70, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Millet flour with a wholesome taste and excellent nutrition.', farmerLocation: 'Zaheerabad, Telangana' },
  { name: 'Ragi Flour', localName: 'Ragi', price: 60, weight: '1 kg', stock: 65, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Nutritious finger millet flour used for porridge and rotis.', farmerLocation: 'Warangal, Telangana' },
  { name: 'Brown Rice', localName: 'Brown Rice', price: 82, weight: '1 kg', stock: 90, organic: true, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', description: 'Whole-grain rice with a nutty flavour and higher fibre content.', farmerLocation: 'Rajanna Sircilla, Telangana' },
  { name: 'Foxtail Millet', localName: 'Korra', price: 88, weight: '1 kg', stock: 82, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Foxtail millet suited for upma, rice bowls and healthy staples.', farmerLocation: 'Kamareddy, Telangana' },
  { name: 'Little Millet', localName: 'Samalu', price: 92, weight: '1 kg', stock: 76, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Little millet with a mild taste for balanced everyday meals.', farmerLocation: 'Mahabubabad, Telangana' },
  { name: 'Barnyard Millet', localName: 'Oodalu', price: 96, weight: '1 kg', stock: 64, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Barnyard millet with quick cooking time and high fibre.', farmerLocation: 'Nagarkurnool, Telangana' },
  { name: 'Poha Thick', localName: 'Atukulu', price: 42, weight: '1 kg', stock: 118, organic: false, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', description: 'Thick beaten rice for breakfast dishes, mixtures and snacks.', farmerLocation: 'Karimnagar, Telangana' },
  { name: 'Semolina', localName: 'Bombay Rava', price: 44, weight: '1 kg', stock: 132, organic: false, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Fine semolina for upma, halwa and bakery recipes.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Flattened Rice Red', localName: 'Red Atukulu', price: 54, weight: '1 kg', stock: 68, organic: true, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', description: 'Red flattened rice for fibre-rich traditional breakfast recipes.', farmerLocation: 'Jagtial, Telangana' },
];

const pulses = [
  { name: 'Toor Dal', localName: 'Pigeon Pea', price: 105, weight: '1 kg', stock: 100, organic: false, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Classic split pigeon pea for everyday cooking and dals.', farmerLocation: 'Khammam, Telangana' },
  { name: 'Moong Dal', localName: 'Green Gram', price: 110, weight: '1 kg', stock: 95, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Light and easy-to-digest split green gram for quick meals.', farmerLocation: 'Nizamabad, Telangana' },
  { name: 'Masoor Dal', localName: 'Red Lentil', price: 92, weight: '1 kg', stock: 110, organic: false, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Fast-cooking lentils for comforting dals and soups.', farmerLocation: 'Adilabad, Telangana' },
  { name: 'Chana Dal', localName: 'Split Chickpea', price: 88, weight: '1 kg', stock: 105, organic: false, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Split chickpeas used in curries, snacks and festive dishes.', farmerLocation: 'Medak, Telangana' },
  { name: 'Rajma', localName: 'Kidney Beans', price: 124, weight: '1 kg', stock: 80, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'Hearty kidney beans for rajma masala and salads.', farmerLocation: 'Ranga Reddy, Telangana' },
  { name: 'Black Chana', localName: 'Kala Chana', price: 96, weight: '1 kg', stock: 85, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Protein-rich black chickpeas for curries and sundal.', farmerLocation: 'Mahbubnagar, Telangana' },
  { name: 'Urad Dal Whole', localName: 'Minumulu', price: 118, weight: '1 kg', stock: 72, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Whole urad dal for dosa batter, dal makhani and vadas.', farmerLocation: 'Suryapet, Telangana' },
  { name: 'Urad Dal Split', localName: 'Minapa Pappu', price: 122, weight: '1 kg', stock: 74, organic: false, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Split urad dal used for batters, tempering and savory snacks.', farmerLocation: 'Vikarabad, Telangana' },
  { name: 'Horse Gram', localName: 'Ulavalu', price: 84, weight: '1 kg', stock: 66, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Traditional horse gram rich in protein and suitable for soups.', farmerLocation: 'Narayanpet, Telangana' },
  { name: 'Cowpeas', localName: 'Alasandalu', price: 90, weight: '1 kg', stock: 70, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Versatile cowpeas for curries, sundal and salads.', farmerLocation: 'Wanaparthy, Telangana' },
  { name: 'White Peas', localName: 'Tella Batani', price: 82, weight: '1 kg', stock: 88, organic: false, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0b?auto=format&fit=crop&w=600&q=80', description: 'Dried white peas for ragda, curries and street-style snacks.', farmerLocation: 'Siddipet, Telangana' },
  { name: 'Moth Beans', localName: 'Matki', price: 98, weight: '1 kg', stock: 58, organic: true, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Nutritious moth beans for sprouts, usal and dry curries.', farmerLocation: 'Jogulamba Gadwal, Telangana' },
];

const spices = [
  { name: 'Turmeric Powder', localName: 'Haldi', price: 58, weight: '250 g', stock: 90, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', description: 'Aromatic turmeric powder with a rich golden colour.', farmerLocation: 'Nizamabad, Telangana' },
  { name: 'Red Chili Powder', localName: 'Mirchi Powder', price: 75, weight: '250 g', stock: 88, organic: false, imageUrl: 'https://images.unsplash.com/photo-1505916349660-8d91a99c3e23?auto=format&fit=crop&w=600&q=80', description: 'Fiery red chili powder for spice-forward everyday cooking.', farmerLocation: 'Guntur, Andhra Pradesh' },
  { name: 'Coriander Powder', localName: 'Dhaniya Powder', price: 52, weight: '250 g', stock: 92, organic: false, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', description: 'Freshly ground coriander with a warm citrus aroma.', farmerLocation: 'Karimnagar, Telangana' },
  { name: 'Cumin Seeds', localName: 'Jeera', price: 65, weight: '250 g', stock: 86, organic: true, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', description: 'Whole cumin seeds for tempering and seasoning.', farmerLocation: 'Nalgonda, Telangana' },
  { name: 'Mustard Seeds', localName: 'Avalu', price: 48, weight: '250 g', stock: 84, organic: false, imageUrl: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=600&q=80', description: 'Pungent mustard seeds for pickles and tempering.', farmerLocation: 'Warangal, Telangana' },
  { name: 'Garam Masala', localName: 'Masala Mix', price: 90, weight: '250 g', stock: 70, organic: false, imageUrl: 'https://images.unsplash.com/photo-1505916349660-8d91a99c3e23?auto=format&fit=crop&w=600&q=80', description: 'Balanced spice blend for curries, gravies and rice dishes.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Black Pepper', localName: 'Miriyalu', price: 140, weight: '250 g', stock: 62, organic: true, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', description: 'Bold whole black pepper for seasoning and spice blends.', farmerLocation: 'Mulugu, Telangana' },
  { name: 'Cloves', localName: 'Lavangalu', price: 165, weight: '100 g', stock: 48, organic: true, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', description: 'Aromatic cloves for biryani, masala chai and festive cooking.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Cardamom', localName: 'Yalakulu', price: 220, weight: '100 g', stock: 44, organic: true, imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', description: 'Green cardamom pods for sweets, beverages and savory dishes.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Fennel Seeds', localName: 'Sompu', price: 72, weight: '250 g', stock: 68, organic: false, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', description: 'Sweet fennel seeds for seasoning, pickles and mouth fresheners.', farmerLocation: 'Nizamabad, Telangana' },
  { name: 'Fenugreek Seeds', localName: 'Mentulu', price: 46, weight: '250 g', stock: 74, organic: false, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', description: 'Fenugreek seeds for tempering, pickles and spice pastes.', farmerLocation: 'Karimnagar, Telangana' },
  { name: 'Sambar Powder', localName: 'Sambar Podi', price: 68, weight: '250 g', stock: 84, organic: false, imageUrl: 'https://images.unsplash.com/photo-1505916349660-8d91a99c3e23?auto=format&fit=crop&w=600&q=80', description: 'South Indian sambar powder blended for daily homestyle cooking.', farmerLocation: 'Hyderabad, Telangana' },
];

const dairy = [
  { name: 'Milk', localName: 'Milk', price: 60, weight: '1 litre', stock: 120, organic: false, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', description: 'Fresh pasteurised milk delivered daily from local dairies.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Curd', localName: 'Curd', price: 35, weight: '500 g', stock: 100, organic: false, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', description: 'Creamy curd made from fresh milk and cultured traditionally.', farmerLocation: 'Medchal, Telangana' },
  { name: 'Paneer', localName: 'Paneer', price: 85, weight: '250 g', stock: 75, organic: false, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', description: 'Soft paneer cubes suitable for curries and snacks.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Butter', localName: 'Butter', price: 95, weight: '250 g', stock: 60, organic: false, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80', description: 'Fresh white butter with a smooth spreadable texture.', farmerLocation: 'Malkajgiri, Telangana' },
  { name: 'Ghee', localName: 'Ghee', price: 240, weight: '500 g', stock: 55, organic: false, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', description: 'Pure desi ghee for cooking, sweets and finishing dishes.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Curd Set Yogurt', localName: 'Yogurt', price: 40, weight: '500 g', stock: 70, organic: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', description: 'Cultured yogurt with a mild tang and creamy texture.', farmerLocation: 'Ranga Reddy, Telangana' },
  { name: 'Buttermilk', localName: 'Majjiga', price: 25, weight: '1 litre', stock: 96, organic: false, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', description: 'Refreshing seasoned buttermilk suitable for hot summer days.', farmerLocation: 'Shamshabad, Telangana' },
  { name: 'Cheddar Cheese', localName: 'Cheese', price: 145, weight: '250 g', stock: 42, organic: false, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', description: 'Firm cheddar cheese block for sandwiches, pasta and snacks.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Mozzarella Cheese', localName: 'Mozzarella', price: 160, weight: '250 g', stock: 38, organic: false, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', description: 'Stretchy mozzarella cheese ideal for pizza and baked dishes.', farmerLocation: 'Medchal, Telangana' },
  { name: 'Cream', localName: 'Fresh Cream', price: 72, weight: '250 g', stock: 52, organic: false, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', description: 'Rich fresh cream for gravies, desserts and beverages.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Khova', localName: 'Kova', price: 110, weight: '250 g', stock: 34, organic: false, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', description: 'Thickened milk solids used in sweets and festive cooking.', farmerLocation: 'Nalgonda, Telangana' },
  { name: 'Flavoured Yogurt', localName: 'Fruit Yogurt', price: 48, weight: '250 g', stock: 58, organic: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', description: 'Creamy fruit yogurt for breakfast bowls and quick snacks.', farmerLocation: 'Ranga Reddy, Telangana' },
];

const dryFruits = [
  { name: 'Almonds', localName: 'Badam', price: 320, weight: '250 g', stock: 60, organic: true, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', description: 'Crunchy premium almonds for snacking and sweets.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Cashews', localName: 'Kaju', price: 290, weight: '250 g', stock: 58, organic: true, imageUrl: 'https://images.unsplash.com/photo-1504708706971-6d5a8b8f4d8f?auto=format&fit=crop&w=600&q=80', description: 'Creamy cashews ideal for cooking and festive treats.', farmerLocation: 'Medak, Telangana' },
  { name: 'Pistachios', localName: 'Pista', price: 450, weight: '250 g', stock: 40, organic: true, imageUrl: 'https://images.unsplash.com/photo-1506919258185-6073f86f6c7f?auto=format&fit=crop&w=600&q=80', description: 'Lightly salted pistachios for snacking and desserts.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Walnuts', localName: 'Akhrot', price: 520, weight: '250 g', stock: 35, organic: true, imageUrl: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=600&q=80', description: 'Fresh walnut kernels with a rich earthy flavour.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Raisins', localName: 'Kismis', price: 140, weight: '250 g', stock: 65, organic: true, imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', description: 'Sweet raisins suitable for cooking and snacking.', farmerLocation: 'Nalgonda, Telangana' },
  { name: 'Dates', localName: 'Khajoor', price: 260, weight: '500 g', stock: 50, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80', description: 'Soft dates packed with natural sweetness and fibre.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Dried Figs', localName: 'Anjeer', price: 285, weight: '250 g', stock: 46, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80', description: 'Soft dried figs with concentrated sweetness and fibre.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Apricots', localName: 'Khubani', price: 240, weight: '250 g', stock: 42, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596500350438-e67f70b74100?auto=format&fit=crop&w=600&q=80', description: 'Premium dried apricots for snacking and baking recipes.', farmerLocation: 'Secunderabad, Telangana' },
  { name: 'Brazil Nuts', localName: 'Brazil Nuts', price: 390, weight: '250 g', stock: 28, organic: true, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', description: 'Large crunchy Brazil nuts with a rich buttery taste.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Hazelnuts', localName: 'Hazelnut', price: 360, weight: '250 g', stock: 30, organic: true, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', description: 'Roast-ready hazelnuts for spreads, desserts and snacking.', farmerLocation: 'Malkajgiri, Telangana' },
  { name: 'Sunflower Seeds', localName: 'Sunflower Seeds', price: 120, weight: '250 g', stock: 54, organic: true, imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=600&q=80', description: 'Nutty sunflower seeds for topping salads and trail mixes.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Pumpkin Seeds', localName: 'Pumpkin Seeds', price: 135, weight: '250 g', stock: 50, organic: true, imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=600&q=80', description: 'Protein-rich pumpkin seeds for snacking and healthy bowls.', farmerLocation: 'Medchal, Telangana' },
];

const eggsAndPoultry = [
  { name: 'Eggs', localName: 'Eggs', price: 72, weight: 'dozen', stock: 110, organic: false, imageUrl: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=600&q=80', description: 'Fresh farm eggs delivered in hygienic packs.', farmerLocation: 'Medchal, Telangana' },
  { name: 'Brown Eggs', localName: 'Brown Eggs', price: 84, weight: 'dozen', stock: 96, organic: true, imageUrl: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=600&q=80', description: 'Brown shell eggs from healthy farm hens.', farmerLocation: 'Hyderabad, Telangana' },
  { name: 'Chicken Breast', localName: 'Chicken', price: 190, weight: '1 kg', stock: 40, organic: false, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', description: 'Fresh chicken breast cut and packed for quick cooking.', farmerLocation: 'Ranga Reddy, Telangana' },
  { name: 'Country Chicken', localName: 'Natu Kodi', price: 320, weight: '1 kg', stock: 28, organic: true, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80', description: 'Free-range country chicken with richer taste and texture.', farmerLocation: 'Mahbubnagar, Telangana' },
];

const organicProducts = [
  { name: 'Organic Jaggery', localName: 'Bellam', price: 72, weight: '500 g', stock: 80, organic: true, imageUrl: 'https://images.unsplash.com/photo-1604480132760-4d4b8d8f1f80?auto=format&fit=crop&w=600&q=80', description: 'Chemical-free jaggery made from organic sugarcane.', farmerLocation: 'Nalgonda, Telangana' },
  { name: 'Organic Honey', localName: 'Honey', price: 260, weight: '250 g', stock: 45, organic: true, imageUrl: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=600&q=80', description: 'Pure organic honey sourced from local apiaries.', farmerLocation: 'Adilabad, Telangana' },
  { name: 'Organic Coconut Oil', localName: 'Coconut Oil', price: 210, weight: '500 g', stock: 48, organic: true, imageUrl: 'https://images.unsplash.com/photo-1620820921494-7f9aaf62f4f4?auto=format&fit=crop&w=600&q=80', description: 'Cold-pressed coconut oil for cooking and wellness.', farmerLocation: 'Warangal, Telangana' },
  { name: 'Organic Turmeric Powder', localName: 'Haldi', price: 78, weight: '250 g', stock: 60, organic: true, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', description: 'Pure turmeric powder grown without synthetic inputs.', farmerLocation: 'Nizamabad, Telangana' },
  { name: 'Organic Millet Mix', localName: 'Millet Mix', price: 115, weight: '500 g', stock: 52, organic: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', description: 'A wholesome mix of millet grains for healthy meals.', farmerLocation: 'Zaheerabad, Telangana' },
  { name: 'Organic Peanut Butter', localName: 'Peanut Butter', price: 180, weight: '250 g', stock: 44, organic: true, imageUrl: 'https://images.unsplash.com/photo-1572448862528-2d3d2d3d2d3d?auto=format&fit=crop&w=600&q=80', description: 'Natural peanut butter without artificial additives.', farmerLocation: 'Hyderabad, Telangana' },
];

const categoryConfig = {
  FRUIT: { label: 'Fruits', subcategory: 'Fresh Fruit' },
  VEGETABLE: { label: 'Vegetables', subcategory: 'Fresh Vegetable' },
  LEAFY_VEGETABLE: { label: 'Leafy Vegetables', subcategory: 'Leafy Greens' },
  HERB: { label: 'Herbs', subcategory: 'Fresh Herbs' },
  GRAIN_AND_RICE: { label: 'Grains and Rice', subcategory: 'Staple Grains' },
  PULSE_AND_DAL: { label: 'Pulses and Dal', subcategory: 'Dals and Pulses' },
  SPICE: { label: 'Spices', subcategory: 'Ground and Whole Spices' },
  DAIRY_PRODUCTS: { label: 'Dairy Products', subcategory: 'Daily Dairy' },
  DRY_FRUIT_AND_NUTS: { label: 'Dry Fruits and Nuts', subcategory: 'Premium Dry Fruits' },
  EGGS_AND_POULTRY: { label: 'Eggs and Poultry', subcategory: 'Protein Foods' },
  ORGANIC_PRODUCTS: { label: 'Organic Products', subcategory: 'Certified Organic' },
};

const sources = [
  { category: 'FRUIT', items: products.filter((item) => String(item.category || '').toLowerCase() === 'fruit') },
  { category: 'VEGETABLE', items: products.filter((item) => String(item.category || '').toLowerCase() === 'vegetable') },
  { category: 'LEAFY_VEGETABLE', items: leafyVegetables },
  { category: 'HERB', items: herbs },
  { category: 'GRAIN_AND_RICE', items: grains },
  { category: 'PULSE_AND_DAL', items: pulses },
  { category: 'SPICE', items: spices },
  { category: 'DAIRY_PRODUCTS', items: dairy },
  { category: 'DRY_FRUIT_AND_NUTS', items: dryFruits },
  { category: 'EGGS_AND_POULTRY', items: eggsAndPoultry },
  { category: 'ORGANIC_PRODUCTS', items: organicProducts },
];

const unitEnumMap = new Map([
  ['kg', 'KG'],
  ['1 kg', 'KG'],
  ['500 g', 'HALF_KG'],
  ['250 g', 'QUARTER_KG'],
  ['100 g', 'GRAM'],
  ['50 g', 'GRAM'],
  ['bundle', 'BUNCH'],
  ['bunch', 'BUNCH'],
  ['piece', 'PIECE'],
  ['dozen', 'DOZEN'],
  ['1 litre', 'LITRE'],
  ['litre', 'LITRE'],
  ['packet', 'PACKET'],
]);

const defaultFarmerNames = [
  'Ramesh Reddy', 'Lakshmi Devi', 'Kiran Kumar', 'Anitha Naidu', 'Pavitra Gowda',
  'Arjun Singh', 'Divya Patel', 'Mahesh Babu', 'Sunita Choudhary', 'Naveen Rao',
  'Meena Sharma', 'Rahul Verma', 'Savita Yadav', 'Gopi Krishna', 'Nikhil Reddy',
  'Suresh Patil', 'Kavitha Reddy', 'Harish Kumar', 'Bhaskar Rao', 'Madhuri Singh',
];

const defaultLocations = [
  'Hyderabad, Telangana', 'Ranga Reddy, Telangana', 'Medchal, Telangana', 'Warangal, Telangana',
  'Nizamabad, Telangana', 'Khammam, Telangana', 'Nalgonda, Telangana', 'Mahbubnagar, Telangana',
  'Sangareddy, Telangana', 'Secunderabad, Telangana', 'Moinabad, Telangana', 'Shamshabad, Telangana',
];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeSql(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (value === 'NOW()') {
    return 'NOW()';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 10)}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function resolveUnit(unitValue) {
  const normalized = String(unitValue || '').trim().toLowerCase();
  return unitEnumMap.get(normalized) || 'PIECE';
}

function resolveAvailableUnits(unitValue) {
  const normalized = String(unitValue || '').trim();
  if (normalized === 'bundle') return 'bundle';
  return normalized || 'piece';
}

function makeProductRecord(item, category, index, sourceIndex) {
  const categoryLabel = categoryConfig[category].label;
  const baseName = item.name || item.productName || `Product ${index}`;
  const name = baseName.trim();
  const sellingPrice = Number(item.price || item.sellingPrice || 0);
  const discount = Number(item.discount || item.discountPercentage || ((index + sourceIndex) % 4) * 5);
  const marketPrice = Number((item.marketPrice || sellingPrice * (0.82 + ((index + sourceIndex) % 5) * 0.03)).toFixed(2));
  const retailPriceMin = Number((item.retailPriceMin || Math.max(marketPrice, sellingPrice * 0.95)).toFixed(2));
  const retailPriceMax = Number((item.retailPriceMax || sellingPrice * (1.08 + ((index + sourceIndex) % 3) * 0.04)).toFixed(2));
  const originalPrice = Number((item.originalPrice || retailPriceMax).toFixed(2));
  const stockQuantity = Number(item.stockQuantity || item.stock || 0);
  const farmerName = item.farmerName || defaultFarmerNames[(index + sourceIndex) % defaultFarmerNames.length];
  const farmerLocation = item.location || item.farmerLocation || defaultLocations[(index + sourceIndex) % defaultLocations.length];
  const organic = Boolean(item.organic || item.isOrganic);
  const isFeatured = (index + sourceIndex) % 9 === 0;
  const isPreOrder = false;
  const stockStatus = stockQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
  const unitEnum = resolveUnit(item.unit || item.weight);
  const availableUnits = resolveAvailableUnits(item.weight || item.unit);
  const teluguName = item.teluguName || item.localName || null;

  return {
    product_name: name,
    slug: slugify(item.slug || name),
    category,
    subcategory: item.localName || categoryConfig[category].subcategory,
    telugu_name: teluguName,
    description: item.description || `${name} sourced directly from ${farmerLocation}.`,
    image_alt_text: item.localName ? `${name} (${item.localName})` : name,
    farmer_id: item.farmerId || null,
    market_price: marketPrice,
    retail_price_min: retailPriceMin,
    retail_price_max: retailPriceMax,
    original_price: originalPrice > 0 ? originalPrice : sellingPrice,
    selling_price: sellingPrice,
    discount_percentage: discount,
    available_units: availableUnits,
    price: sellingPrice,
    stock_quantity: stockQuantity,
    quantity: stockQuantity,
    unit: unitEnum,
    image_url: item.imageUrl || item.image || null,
    farmer_name: farmerName,
    farmer_location: farmerLocation,
    minimum_order_quantity: item.minimumOrderQuantity || 1,
    maximum_order_quantity: item.maximumOrderQuantity || Math.max(5, Math.min(25, stockQuantity || 5)),
    status: stockStatus === 'AVAILABLE' ? 'ACTIVE' : 'OUT_OF_STOCK',
    is_featured: isFeatured,
    is_organic: organic,
    is_pre_order: isPreOrder,
    expected_delivery_date: null,
    last_price_updated_at: 'NOW()',
    price_source: 'Farm2Home full catalog seed',
    stock_status: stockStatus,
  };
}

const catalog = [];
sources.forEach((source, sourceIndex) => {
  source.items.forEach((item, index) => {
    catalog.push(makeProductRecord(item, source.category, index, sourceIndex));
  });
});

const insertColumns = [
  'product_name', 'slug', 'category', 'subcategory', 'telugu_name', 'description', 'image_alt_text', 'farmer_id',
  'market_price', 'retail_price_min', 'retail_price_max', 'original_price', 'selling_price', 'discount_percentage', 'available_units', 'price', 'stock_quantity',
  'quantity', 'unit', 'image_url', 'farmer_name', 'farmer_location', 'minimum_order_quantity',
  'maximum_order_quantity', 'status', 'is_featured', 'is_organic', 'is_pre_order', 'expected_delivery_date', 'last_price_updated_at', 'price_source',
  'stock_status', 'created_at', 'updated_at'
];

const timestamp = 'NOW()';
const statementChunks = [];
for (let i = 0; i < catalog.length; i += 25) {
  const chunk = catalog.slice(i, i + 25);
  const values = chunk.map((product) => {
    const row = [
      product.product_name,
      product.slug,
      product.category,
      product.subcategory,
      product.telugu_name,
      product.description,
      product.image_alt_text,
      product.farmer_id,
      product.market_price,
      product.retail_price_min,
      product.retail_price_max,
      product.original_price,
      product.selling_price,
      product.discount_percentage,
      product.available_units,
      product.price,
      product.stock_quantity,
      product.quantity,
      product.unit,
      product.image_url,
      product.farmer_name,
      product.farmer_location,
      product.minimum_order_quantity,
      product.maximum_order_quantity,
      product.status,
      product.is_featured,
      product.is_organic,
      product.is_pre_order,
      product.expected_delivery_date,
      product.last_price_updated_at,
      product.price_source,
      product.stock_status,
      timestamp,
      timestamp,
    ];
    return `(${row.map(escapeSql).join(', ')})`;
  }).join(',\n');

  statementChunks.push(`INSERT INTO products (${insertColumns.join(', ')}) VALUES\n${values};`);
}

const sql = [
  '-- Hyderabad Farm2Home seed data generated from the existing catalog sources',
  '-- Run after products_schema.sql so the extended columns exist',
  '',
  ...statementChunks,
  '',
].join('\n');

fs.writeFileSync(sqlPath, sql, 'utf8');
fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), 'utf8');
fs.writeFileSync(resourceJsonPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Wrote ${catalog.length} products to ${sqlPath}`);
