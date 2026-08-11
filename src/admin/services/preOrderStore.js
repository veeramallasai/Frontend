const PRE_ORDERS_KEY = 'ftm_admin_pre_orders';
const CONVERTED_ORDERS_KEY = 'ftm_admin_converted_orders';

const clone = (value) => JSON.parse(JSON.stringify(value));

const initialPreOrders = [
  {
    id: 'PO-2026-1001',
    preOrderId: 'PO-2026-1001',
    customerName: 'Priya Sharma',
    mobileNumber: '+91 99887 11223',
    productDetails: 'Leafy Greens Combo, Organic Tomatoes',
    quantity: '6 kg',
    estimatedOrderValue: 1280,
    preferredDeliveryDate: '2026-08-08',
    preferredDeliveryTime: '09:00 - 11:00 AM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    preOrderStatus: 'Pending',
    createdDate: '2026-08-04',
    deliveryLocation: 'Banjara Hills, Hyderabad',
    farmerName: 'Green Valley Farms',
    history: [{ action: 'Pre-order created', at: '2026-08-04T09:15:00Z' }]
  },
  {
    id: 'PO-2026-1002',
    preOrderId: 'PO-2026-1002',
    customerName: 'Ramesh Kumar',
    mobileNumber: '+91 98765 43210',
    productDetails: 'Spinach, Coriander, Methi',
    quantity: '4 kg',
    estimatedOrderValue: 760,
    preferredDeliveryDate: '2026-08-09',
    preferredDeliveryTime: '02:00 - 04:00 PM',
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    preOrderStatus: 'Confirmed',
    createdDate: '2026-08-03',
    deliveryLocation: 'Madhapur, Hyderabad',
    farmerName: 'Nashik Fresh Growers',
    history: [
      { action: 'Pre-order created', at: '2026-08-03T10:20:00Z' },
      { action: 'Pre-order confirmed', at: '2026-08-03T12:05:00Z' }
    ]
  },
  {
    id: 'PO-2026-1003',
    preOrderId: 'PO-2026-1003',
    customerName: 'Sneha Patel',
    mobileNumber: '+91 98123 44556',
    productDetails: 'Organic Apples, Pears, Grapes',
    quantity: '8 kg',
    estimatedOrderValue: 2150,
    preferredDeliveryDate: '2026-08-10',
    preferredDeliveryTime: '11:30 AM - 01:30 PM',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    preOrderStatus: 'Scheduled',
    createdDate: '2026-08-02',
    deliveryLocation: 'Jubilee Hills, Hyderabad',
    farmerName: 'Surya Organic Farm',
    history: [
      { action: 'Pre-order created', at: '2026-08-02T08:45:00Z' },
      { action: 'Delivery schedule planned', at: '2026-08-03T08:30:00Z' }
    ]
  },
  {
    id: 'PO-2026-1004',
    preOrderId: 'PO-2026-1004',
    customerName: 'Vikram Joshi',
    mobileNumber: '+91 91234 88776',
    productDetails: 'Tomatoes, Okra, Cabbage',
    quantity: '5 kg',
    estimatedOrderValue: 940,
    preferredDeliveryDate: '2026-08-11',
    preferredDeliveryTime: '04:00 - 06:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    preOrderStatus: 'Pending',
    createdDate: '2026-08-02',
    deliveryLocation: 'Kondapur, Hyderabad',
    farmerName: 'Telangana Fresh Growers',
    history: [{ action: 'Pre-order created', at: '2026-08-02T14:00:00Z' }]
  },
  {
    id: 'PO-2026-1005',
    preOrderId: 'PO-2026-1005',
    customerName: 'Ananya Rao',
    mobileNumber: '+91 94455 66778',
    productDetails: 'Mint Leaves, Curry Leaves, Coriander',
    quantity: '3 kg',
    estimatedOrderValue: 520,
    preferredDeliveryDate: '2026-08-07',
    preferredDeliveryTime: '08:00 - 10:00 AM',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    preOrderStatus: 'Cancelled',
    createdDate: '2026-08-01',
    deliveryLocation: 'Kukatpally, Hyderabad',
    farmerName: 'Organic Greens Co.',
    history: [
      { action: 'Pre-order created', at: '2026-08-01T07:35:00Z' },
      { action: 'Pre-order cancelled', at: '2026-08-02T09:00:00Z' }
    ]
  }
];

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const readList = (key, fallback) => {
  const storage = getStorage();
  if (!storage) return clone(fallback);

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      storage.setItem(key, JSON.stringify(fallback));
      return clone(fallback);
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : clone(fallback);
  } catch {
    return clone(fallback);
  }
};

const writeList = (key, list) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(list));
};

const createHistoryEntry = (action, note = '') => ({
  action,
  note,
  at: new Date().toISOString()
});

export const getPreOrders = () => readList(PRE_ORDERS_KEY, initialPreOrders);

export const setPreOrders = (list) => {
  writeList(PRE_ORDERS_KEY, Array.isArray(list) ? list : []);
};

export const getConvertedOrders = () => readList(CONVERTED_ORDERS_KEY, []);

export const setConvertedOrders = (list) => {
  writeList(CONVERTED_ORDERS_KEY, Array.isArray(list) ? list : []);
};

export const confirmPreOrder = (preOrderId) => {
  const preOrders = getPreOrders();
  const index = preOrders.findIndex((item) => item.preOrderId === preOrderId || item.id === preOrderId);
  if (index === -1) return null;

  const next = { ...preOrders[index] };
  next.preOrderStatus = 'Confirmed';
  next.history = [...(next.history || []), createHistoryEntry('Pre-order confirmed')];
  preOrders[index] = next;
  setPreOrders(preOrders);
  return next;
};

export const updatePreOrderSchedule = (preOrderId, preferredDeliveryDate, preferredDeliveryTime) => {
  const preOrders = getPreOrders();
  const index = preOrders.findIndex((item) => item.preOrderId === preOrderId || item.id === preOrderId);
  if (index === -1) return null;

  const next = {
    ...preOrders[index],
    preferredDeliveryDate,
    preferredDeliveryTime,
    preOrderStatus: 'Scheduled',
    history: [...(preOrders[index].history || []), createHistoryEntry('Delivery schedule updated', `${preferredDeliveryDate} ${preferredDeliveryTime}`)]
  };

  preOrders[index] = next;
  setPreOrders(preOrders);
  return next;
};

export const cancelPreOrder = (preOrderId) => {
  const preOrders = getPreOrders();
  const index = preOrders.findIndex((item) => item.preOrderId === preOrderId || item.id === preOrderId);
  if (index === -1) return null;

  const next = {
    ...preOrders[index],
    preOrderStatus: 'Cancelled',
    history: [...(preOrders[index].history || []), createHistoryEntry('Pre-order cancelled')]
  };

  preOrders[index] = next;
  setPreOrders(preOrders);
  return next;
};

export const deletePreOrder = (preOrderId) => {
  const preOrders = getPreOrders();
  const next = preOrders.filter((item) => item.preOrderId !== preOrderId && item.id !== preOrderId);
  setPreOrders(next);
  return next;
};

export const convertPreOrderToOrder = (preOrderId) => {
  const preOrders = getPreOrders();
  const index = preOrders.findIndex((item) => item.preOrderId === preOrderId || item.id === preOrderId);
  if (index === -1) return null;

  const preOrder = preOrders[index];
  const convertedOrders = getConvertedOrders();
  const convertedOrder = {
    id: preOrder.preOrderId,
    orderCode: preOrder.preOrderId,
    customerName: preOrder.customerName,
    customer: preOrder.customerName,
    mobile: preOrder.mobileNumber,
    phone: preOrder.mobileNumber,
    items: preOrder.productDetails,
    products: preOrder.productDetails,
    totalItems: preOrder.quantity,
    quantity: preOrder.quantity,
    amount: `₹${Number(preOrder.estimatedOrderValue || 0).toLocaleString()}`,
    totalAmount: Number(preOrder.estimatedOrderValue || 0),
    paymentMethod: preOrder.paymentMethod,
    paymentStatus: preOrder.paymentStatus,
    orderStatus: 'Confirmed',
    status: 'Confirmed',
    deliveryStatus: 'Scheduled',
    orderDate: preOrder.createdDate,
    date: `${preOrder.createdDate}T09:00:00`,
    dateObj: new Date(preOrder.createdDate),
    address: {
      street: preOrder.deliveryLocation,
      area: '',
      city: '',
      pincode: ''
    },
    history: [...(preOrder.history || []), createHistoryEntry('Converted to active order', 'Moved from Pre-Order List')],
    sourcePreOrderId: preOrder.preOrderId,
    preferredDeliveryDate: preOrder.preferredDeliveryDate,
    preferredDeliveryTime: preOrder.preferredDeliveryTime,
    farmerName: preOrder.farmerName || 'Assigned Farmer'
  };

  const nextPreOrders = preOrders.filter((item) => item.preOrderId !== preOrderId && item.id !== preOrderId);
  setPreOrders(nextPreOrders);
  setConvertedOrders([convertedOrder, ...convertedOrders]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin_orders_changed', { detail: { sourcePreOrderId: preOrderId } }));
  }

  return convertedOrder;
};
