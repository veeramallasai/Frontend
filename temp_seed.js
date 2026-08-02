const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "src", "data");
const sqlDir = path.join(process.cwd(), "backend", "sql");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir, { recursive: true });

const fruits = [
  { name: "Alphonso Mango", location: "Ratnagiri, Maharashtra", unit: "dozen", basePrice: 800, slug: "alphonso-mango" },
  { name: "Kesar Mango", location: "Junagadh, Gujarat", unit: "kg", basePrice: 150, slug: "kesar-mango" },
  { name: "Robusta Banana", location: "Jalgaon, Maharashtra", unit: "dozen", basePrice: 60, slug: "robusta-banana" },
  { name: "Allahabad Safeda Guava", location: "Prayagraj, Uttar Pradesh", unit: "kg", basePrice: 80, slug: "allahabad-safeda-guava" },
  { name: "Bhagwa Pomegranate", location: "Solapur, Maharashtra", unit: "kg", basePrice: 180, slug: "bhagwa-pomegranate" },
  { name: "Red Lady Papaya", location: "Anantapur, Andhra Pradesh", unit: "piece", basePrice: 50, slug: "red-lady-papaya" },
  { name: "Kiran Watermelon", location: "Kolar, Karnataka", unit: "piece", basePrice: 80, slug: "kiran-watermelon" },
  { name: "Kajal Muskmelon", location: "Latur, Maharashtra", unit: "piece", basePrice: 60, slug: "kajal-muskmelon" },
  { name: "Chickoo Sapota", location: "Dahanu, Maharashtra", unit: "kg", basePrice: 90, slug: "chickoo-sapota" },
  { name: "Sitaphal Custard Apple", location: "Beed, Maharashtra", unit: "kg", basePrice: 140, slug: "sitaphal-custard-apple" },
  { name: "Kathal Jackfruit", location: "Thrissur, Kerala", unit: "kg", basePrice: 70, slug: "kathal-jackfruit" },
  { name: "Jamun Black Plum", location: "Muzaffarnagar, Uttar Pradesh", unit: "kg", basePrice: 200, slug: "jamun-black-plum" },
  { name: "Shahi Litchi", location: "Muzaffarpur, Bihar", unit: "kg", basePrice: 250, slug: "shahi-litchi" },
  { name: "Mosambi Sweet Lime", location: "Aurangabad, Maharashtra", unit: "kg", basePrice: 100, slug: "mosambi-sweet-lime" },
  { name: "Nagpur Orange", location: "Nagpur, Maharashtra", unit: "kg", basePrice: 120, slug: "nagpur-orange" },
  { name: "Shimla Apple", location: "Shimla, Himachal Pradesh", unit: "kg", basePrice: 180, slug: "shimla-apple" },
  { name: "Kinnaur Apple", location: "Kinnaur, Himachal Pradesh", unit: "kg", basePrice: 220, slug: "kinnaur-apple" },
  { name: "Nashpati Pear", location: "Sopore, Jammu & Kashmir", unit: "kg", basePrice: 130, slug: "nashpati-pear" },
  { name: "Aroo Peach", location: "Almora, Uttarakhand", unit: "kg", basePrice: 160, slug: "aroo-peach" },
  { name: "Aloo Bukhara Plum", location: "Amritsar, Punjab", unit: "kg", basePrice: 150, slug: "aloo-bukhara-plum" },
  { name: "Khubani Apricot", location: "Leh, Ladakh", unit: "kg", basePrice: 300, slug: "khubani-apricot" },
  { name: "Red Cherry", location: "Srinagar, Jammu & Kashmir", unit: "box", basePrice: 200, slug: "red-cherry" },
  { name: "Nariyal Coconut", location: "Pollachi, Tamil Nadu", unit: "piece", basePrice: 40, slug: "nariyal-coconut" },
  { name: "Green Grapes", location: "Nashik, Maharashtra", unit: "kg", basePrice: 110, slug: "green-grapes" },
  { name: "Sharad Seedless Black Grapes", location: "Narayangaon, Maharashtra", unit: "kg", basePrice: 140, slug: "sharad-seedless-black-grapes" },
  { name: "Flame Seedless Red Grapes", location: "Sangli, Maharashtra", unit: "kg", basePrice: 160, slug: "flame-seedless-red-grapes" },
  { name: "Anjeer Fig", location: "Pune, Maharashtra", unit: "kg", basePrice: 250, slug: "anjeer-fig" },
  { name: "Queen Pineapple", location: "Tripura", unit: "piece", basePrice: 90, slug: "queen-pineapple" },
  { name: "Mahabaleshwar Strawberry", location: "Mahabaleshwar, Maharashtra", unit: "box", basePrice: 120, slug: "mahabaleshwar-strawberry" },
  { name: "Bel Wood Apple", location: "Gaya, Bihar", unit: "piece", basePrice: 35, slug: "bel-wood-apple" },
  { name: "Kamrakh Star Fruit", location: "Cuttack, Odisha", unit: "kg", basePrice: 100, slug: "kamrakh-star-fruit" },
  { name: "Carambola", location: "Alipurduar, West Bengal", unit: "kg", basePrice: 120, slug: "carambola" },
  { name: "Amla Gooseberry", location: "Pratapgarh, Uttar Pradesh", unit: "kg", basePrice: 80, slug: "amla-gooseberry" },
  { name: "Imli Tamarind", location: "Jagdalpur, Chhattisgarh", unit: "kg", basePrice: 140, slug: "imli-tamarind" },
  { name: "Khajoor Dates", location: "Kutch, Gujarat", unit: "kg", basePrice: 350, slug: "khajoor-dates" },
  { name: "Ber Jujube", location: "Sri Ganganagar, Rajasthan", unit: "kg", basePrice: 60, slug: "ber-jujube" },
  { name: "Shahtoot Mulberry", location: "Ambala, Haryana", unit: "box", basePrice: 150, slug: "shahtoot-mulberry" },
  { name: "Phalsa Sherbet Berry", location: "Meerut, Uttar Pradesh", unit: "kg", basePrice: 180, slug: "phalsa-sherbet-berry" },
  { name: "Kamalam Dragon Fruit", location: "Bhuj, Gujarat", unit: "piece", basePrice: 110, slug: "kamalam-dragon-fruit" },
  { name: "Harfarauri Star Gooseberry", location: "Palakkad, Kerala", unit: "kg", basePrice: 130, slug: "harfarauri-star-gooseberry" },
  { name: "Ramphal", location: "Satara, Maharashtra", unit: "kg", basePrice: 150, slug: "ramphal" },
  { name: "Lakshmanphal", location: "Mysuru, Karnataka", unit: "kg", basePrice: 180, slug: "lakshmanphal" },
  { name: "Hanumanphal Soursop", location: "Wayanad, Kerala", unit: "kg", basePrice: 220, slug: "hanumanphal-soursop" },
  { name: "Arunachal Kiwi", location: "Ziro, Arunachal Pradesh", unit: "box", basePrice: 150, slug: "arunachal-kiwi" },
  { name: "Chakotra Grapefruit", location: "Coorg, Karnataka", unit: "piece", basePrice: 80, slug: "chakotra-grapefruit" },
  { name: "Pomelo", location: "Silchar, Assam", unit: "piece", basePrice: 95, slug: "pomelo" },
  { name: "Bael Fruit", location: "Ayodhya, Uttar Pradesh", unit: "piece", basePrice: 45, slug: "bael-fruit" },
  { name: "Karonda Cherry-berry", location: "Thane, Maharashtra", unit: "kg", basePrice: 120, slug: "karonda-cherry-berry" },
  { name: "Badhal Monkey Fruit", location: "Gorakhpur, Uttar Pradesh", unit: "kg", basePrice: 140, slug: "badhal-monkey-fruit" },
  { name: "Passion Fruit", location: "Nilgiris, Tamil Nadu", unit: "kg", basePrice: 240, slug: "passion-fruit" }
];

const vegetables = [
  { name: "Potato Aloo", location: "Agra, Uttar Pradesh", unit: "kg", basePrice: 30, slug: "potato-aloo" },
  { name: "Nashik Onion", location: "Lasalgaon, Maharashtra", unit: "kg", basePrice: 40, slug: "nashik-onion" },
  { name: "Local Tomato", location: "Madanapalle, Andhra Pradesh", unit: "kg", basePrice: 35, slug: "local-tomato" },
  { name: "Cauliflower Gobhi", location: "Hajipur, Bihar", unit: "piece", basePrice: 45, slug: "cauliflower-gobhi" },
  { name: "Cabbage Pattagobhi", location: "Indore, Madhya Pradesh", unit: "piece", basePrice: 35, slug: "cabbage-pattagobhi" },
  { name: "Okra Bhindi", location: "Surat, Gujarat", unit: "kg", basePrice: 50, slug: "okra-bhindi" },
  { name: "Brinjal Baingan", location: "Belagavi, Karnataka", unit: "kg", basePrice: 45, slug: "brinjal-baingan" },
  { name: "Green Peas Matar", location: "Jabalpur, Madhya Pradesh", unit: "kg", basePrice: 80, slug: "green-peas-matar" },
  { name: "Gajar Carrot", location: "Ooty, Tamil Nadu", unit: "kg", basePrice: 60, slug: "gajar-carrot" },
  { name: "Mooli Radish", location: "Sonipat, Haryana", unit: "kg", basePrice: 35, slug: "mooli-radish" },
  { name: "Palak Spinach", location: "Pune, Maharashtra", unit: "bundle", basePrice: 20, slug: "palak-spinach" },
  { name: "Methi Fenugreek", location: "Mehsana, Gujarat", unit: "bundle", basePrice: 25, slug: "methi-fenugreek" },
  { name: "Dhania Coriander", location: "Kota, Rajasthan", unit: "bundle", basePrice: 15, slug: "dhania-coriander" },
  { name: "Pudina Mint", location: "Jodhpur, Rajasthan", unit: "bundle", basePrice: 15, slug: "pudina-mint" },
  { name: "Lauki Bottle Gourd", location: "Kanpur, Uttar Pradesh", unit: "piece", basePrice: 30, slug: "lauki-bottle-gourd" },
  { name: "Karela Bitter Gourd", location: "Salem, Tamil Nadu", unit: "kg", basePrice: 55, slug: "karela-bitter-gourd" },
  { name: "Turai Ridge Gourd", location: "Guntur, Andhra Pradesh", unit: "kg", basePrice: 45, slug: "turai-ridge-gourd" },
  { name: "Nenua Sponge Gourd", location: "Varanasi, Uttar Pradesh", unit: "kg", basePrice: 40, slug: "nenua-sponge-gourd" },
  { name: "Snake Gourd Chichinda", location: "Chittoor, Andhra Pradesh", unit: "kg", basePrice: 50, slug: "snake-gourd-chichinda" },
  { name: "Parwal Pointed Gourd", location: "Patna, Bihar", unit: "kg", basePrice: 70, slug: "parwal-pointed-gourd" },
  { name: "Kundru Ivy Gourd", location: "Raipur, Chhattisgarh", unit: "kg", basePrice: 40, slug: "kundru-ivy-gourd" },
  { name: "Tinda Round Gourd", location: "Rohtak, Haryana", unit: "kg", basePrice: 50, slug: "tinda-round-gourd" },
  { name: "Kaddu Pumpkin", location: "Hooghly, West Bengal", unit: "kg", basePrice: 30, slug: "kaddu-pumpkin" },
  { name: "Petha Ash Gourd", location: "Agra, Uttar Pradesh", unit: "kg", basePrice: 35, slug: "petha-ash-gourd" },
  { name: "Beetroot Chukandar", location: "Chikmagalur, Karnataka", unit: "kg", basePrice: 50, slug: "beetroot-chukandar" },
  { name: "Shakarkand Sweet Potato", location: "Cuttack, Odisha", unit: "kg", basePrice: 45, slug: "shakarkand-sweet-potato" },
  { name: "Arbi Colocasia", location: "Ranchi, Jharkhand", unit: "kg", basePrice: 60, slug: "arbi-colocasia" },
  { name: "Jimikand Elephant Foot Yam", location: "Vijayawada, Andhra Pradesh", unit: "kg", basePrice: 80, slug: "jimikand-elephant-foot-yam" },
  { name: "Garlic Lahsun", location: "Mandsaur, Madhya Pradesh", unit: "kg", basePrice: 150, slug: "garlic-lahsun" },
  { name: "Adrak Ginger", location: "Wayanad, Kerala", unit: "kg", basePrice: 120, slug: "adrak-ginger" },
  { name: "Hari Mirch Green Chili", location: "Guntur, Andhra Pradesh", unit: "kg", basePrice: 80, slug: "hari-mirch-green-chili" },
  { name: "Shimla Mirch Capsicum", location: "Solan, Himachal Pradesh", unit: "kg", basePrice: 90, slug: "shimla-mirch-capsicum" },
  { name: "French Beans", location: "Kodaikanal, Tamil Nadu", unit: "kg", basePrice: 85, slug: "french-beans" },
  { name: "Gwar Phali Cluster Beans", location: "Barmer, Rajasthan", unit: "kg", basePrice: 55, slug: "gwar-phali-cluster-beans" },
  { name: "Lobia Phali Yardlong Beans", location: "Nanded, Maharashtra", unit: "kg", basePrice: 60, slug: "lobia-phali-yardlong-beans" },
  { name: "Sem Ki Phali Broad Beans", location: "Jabalpur, Madhya Pradesh", unit: "kg", basePrice: 65, slug: "sem-ki-phali-broad-beans" },
  { name: "Sajna Drumstick", location: "Coimbatore, Tamil Nadu", unit: "kg", basePrice: 90, slug: "sajna-drumstick" },
  { name: "Kadi Patta Curry Leaves", location: "Erode, Tamil Nadu", unit: "g", basePrice: 150, slug: "kadi-patta-curry-leaves" },
  { name: "Hara Pyaz Spring Onion", location: "Nashik, Maharashtra", unit: "bundle", basePrice: 30, slug: "hara-pyaz-spring-onion" },
  { name: "Green Broccoli", location: "Bengaluru, Karnataka", unit: "piece", basePrice: 75, slug: "green-broccoli" },
  { name: "Button Mushroom", location: "Solan, Himachal Pradesh", unit: "box", basePrice: 50, slug: "button-mushroom" },
  { name: "Chaulai Amaranth Leaves", location: "Lucknow, Uttar Pradesh", unit: "bundle", basePrice: 20, slug: "chaulai-amaranth-leaves" },
  { name: "Sarson Mustard Greens", location: "Bhatinda, Punjab", unit: "bundle", basePrice: 30, slug: "sarson-mustard-greens" },
  { name: "Shepu Dill Leaves", location: "Kolhapur, Maharashtra", unit: "bundle", basePrice: 25, slug: "shepu-dill-leaves" },
  { name: "Bathua Greens", location: "Bareilly, Uttar Pradesh", unit: "bundle", basePrice: 25, slug: "bathua-greens" },
  { name: "Kalmi Water Spinach", location: "Nadia, West Bengal", unit: "bundle", basePrice: 20, slug: "kalmi-water-spinach" },
  { name: "Chow Chow Chayote", location: "Shillong, Meghalaya", unit: "piece", basePrice: 40, slug: "chow-chow-chayote" },
  { name: "Ganth Gobhi Knol Khol", location: "Srinagar, Jammu & Kashmir", unit: "kg", basePrice: 50, slug: "ganth-gobhi-knol-khol" },
  { name: "Kacha Kela Raw Banana", location: "Tiruchirappalli, Tamil Nadu", unit: "piece", basePrice: 15, slug: "kacha-kela-raw-banana" },
  { name: "Kacha Papita Raw Papaya", location: "Krishna, Andhra Pradesh", unit: "kg", basePrice: 40, slug: "kacha-papita-raw-papaya" }
];

const farmers = [
  "Rajesh Patel", "Ramesh Kumar", "Suresh Sharma", "Anil Singh", "Vijay Yadav",
  "Sunil Dutt", "Sanjay Patil", "Devendra Mukhiya", "Mahendra Prasad", "Arjun Gowda",
  "Bhagwan Das", "Chandra Shekar", "Dinesh Reddi", "Gopal Choudhary", "Hari Prasada",
  "Jagdish Meena", "Karan Johar", "Laxman Rao", "Madan Mohan", "Nand Kishore"
];

function createRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const random = createRandom(42);

function generateProduct(item, id, category) {
  const r = random();
  const farmerIndex = Math.floor(r * farmers.length);
  const farmerName = farmers[farmerIndex];
  const stockQuantity = 50 + Math.floor(r * 401);
  const rating = Math.round((3.8 + r * 1.1) * 10) / 10;
  const discountOptions = [0, 5, 10, 15, 20];
  const discount = discountOptions[Math.floor(r * discountOptions.length)];
  const organic = r < 0.4;
  const pricePct = 0.9 + r * 0.2;
  const price = Math.round(item.basePrice * pricePct);

  const organicPrefix = organic ? "Premium organically grown" : "Fresh and nutrient-rich";
  const description = `${organicPrefix} \${item.name.toLowerCase()} sourced directly from the fields of \${item.location.split(",")[0]}.`;
  const imageUrl = `https://picsum.photos/seed/\${item.slug}/600/600`;

  return {
    id,
    name: item.name,
    category,
    description,
    price,
    unit: item.unit,
    stockQuantity,
    imageUrl,
    discount,
    rating,
    farmerName,
    location: item.location,
    organic
  };
}

const products = [];
fruits.forEach((item, index) => {
  products.push(generateProduct(item, index + 1, "Fruit"));
});
vegetables.forEach((item, index) => {
  products.push(generateProduct(item, index + 51, "Vegetable"));
});

const jsonPath = path.join(dataDir, "products.json");
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf-8");

const escapeSqlValue = (val) => {
  if (typeof val === "string") {
    return "\x27" + val.replace(/\x27/g, "\x27\x27") + "\x27";
  }
  if (typeof val === "boolean") {
    return val ? "TRUE" : "FALSE";
  }
  if (val === null || val === undefined) {
    return "NULL";
  }
  return val;
};

const sqlStatements = [
  "-- Seed data for products",
  ""
];

products.forEach(p => {
  const values = [
    p.id,
    escapeSqlValue(p.name),
    escapeSqlValue(p.category),
    escapeSqlValue(p.description),
    p.price,
    escapeSqlValue(p.unit),
    p.stockQuantity,
    escapeSqlValue(p.imageUrl),
    p.discount,
    p.rating,
    escapeSqlValue(p.farmerName),
    escapeSqlValue(p.location),
    escapeSqlValue(p.organic)
  ].join(", ");

  const sql = `INSERT INTO products (id, name, category, description, price, unit, "stockQuantity", "imageUrl", discount, rating, "farmerName", location, organic) VALUES (\${values});`;
  sqlStatements.push(sql);
});

const sqlPath = path.join(sqlDir, "products_seed.sql");
fs.writeFileSync(sqlPath, sqlStatements.join("\\n"), "utf-8");

console.log("SUCCESS");
console.log("JSONPath:", jsonPath);
console.log("SQLPath:", sqlPath);
console.log("ProductCount:", products.length);
console.log("FirstProductName:", products[0].name);
console.log("LastProductName:", products[products.length - 1].name);

