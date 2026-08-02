import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';
import productsData from '../data/products.json';
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

const CustomerContext = createContext(null);
const GUEST_CART_STORAGE_KEY = 'f2h_guest_cart';

const defaultSavedAddresses = [
  {
    id: 'saved-1',
    title: 'HOME',
    name: 'Home',
    line1: 'House #102, Lakshmipuram 1st Lane',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522007',
    phone: '9876543210',
    isDefault: true,
  },
  {
    id: 'saved-2',
    title: 'WORK',
    name: 'Office',
    line1: 'IT Park, Phase 2, Ring Road',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522002',
    phone: '9876543210',
    isDefault: false,
  },
];

const defaultInitialOrders = [
  {
    id: 8623,
    orderNumber: 'FTH-86CT3',
    status: 'PLACED',
    paymentMethod: 'UPI',
    createdAt: new Date().toLocaleString(),
    total: 175.00,
    totalAmount: 175.00,
    items: [
      {
        id: 'ord-item-1',
        productName: 'Organic Tomatoes',
        name: 'Organic Tomatoes',
        quantity: 2,
        price: 45,
        unitPrice: 45,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        unit: 'kg'
      },
      {
        id: 'ord-item-2',
        productName: 'Fresh Capsicum',
        name: 'Fresh Capsicum',
        quantity: 1,
        price: 85.5,
        unitPrice: 85.5,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
        unit: 'kg'
      }
    ]
  }
];

export const CustomerProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState(defaultSavedAddresses);
  const [orders, setOrders] = useState(defaultInitialOrders);
  const [selectedAddressId, setSelectedAddressId] = useState('saved-1');
  const { user, token } = useAuth();


  const hasStoredSessionToken = () => {
    try {
      return Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
    } catch {
      return false;
    }
  };

  const isSessionAuthenticated = () => Boolean(token) || hasStoredSessionToken();

  const isCustomerRole = (roleValue) => {
    const normalizedRole = String(roleValue || '').trim().toLowerCase();
    return normalizedRole === 'customer' || normalizedRole === 'role_customer' || normalizedRole.includes('customer');
  };

  const loadGuestCart = () => {
    try {
      const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const persistGuestCart = (nextCart) => {
    try {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(nextCart));
    } catch {
      // Ignore localStorage failures silently and keep in-memory cart state.
    }
  };

  const isGuestCartItemId = (value) => String(value || '').startsWith('guest-');

  const isBackendCompatibleProductId = (value) => {
    const id = String(value || '').trim();
    if (!id) return false;
    // Backend product IDs are UUIDs; local/demo products use numeric or seeded IDs.
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  };

  const addToGuestCart = (product, qty = 1) => {
    setCart((prev) => {
      const productId = String(product?.id || '');
      const existing = prev.find((item) => String(item.productId) === productId);
      const next = existing
        ? prev.map((item) =>
            String(item.productId) === productId
              ? { ...item, quantity: item.quantity + qty }
              : item
          )
        : [
            ...prev,
            {
              id: `guest-${product.id}`,
              productId: product.id,
              name: product.name,
              price: Number(product.price || 0),
              quantity: qty,
              image: getSafeImageUrl(product.image || product.imageUrl, getImageForProduct(product.name, product.category)),
              unit: product.unit || 'kg'
            }
          ];

      persistGuestCart(next);
      return next;
    });
  };

  const getSafeImageUrl = (rawUrl, fallbackImage) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return fallbackImage;
    }

    try {
      const parsed = new URL(rawUrl);
      const host = String(parsed.hostname || '').toLowerCase();
      const path = String(parsed.pathname || '').toLowerCase();

      // Block known problematic URL patterns that trigger browser cross-site noise or random non-food images.
      const blockedHosts = ['google.com', 'www.google.com', 'maps.google.com', 'gstatic.com', 'picsum.photos'];
      const isBlockedHost = blockedHosts.some((entry) => host === entry || host.endsWith(`.${entry}`));
      const isGoogleImageResult = path.includes('/imgres');

      if (isBlockedHost || isGoogleImageResult) {
        return fallbackImage;
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return fallbackImage;
      }

      return parsed.toString();
    } catch {
      return fallbackImage;
    }
  };


  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Format backend products to match frontend properties
      const mappedProducts = (response.data.data || []).map((p, idx) => {
        const categoryName = p.category 
          ? (typeof p.category === 'object' ? p.category.name : p.category) 
          : 'Vegetables';
        return {
          id: p.id,
          name: p.name,
          category: categoryName,
          price: p.price,
          rating: 4.5 + (idx % 5) * 0.1, // simulated rating
          unit: p.unit ? p.unit.toLowerCase() : 'kg',
          image: getProductImage(p.name, categoryName, p.imageUrl),
          description: p.description || 'Fresh organic product from certified farmers.',
        };
      });

      let customProds = [];
      let deletedIds = [];
      try {
        customProds = JSON.parse(localStorage.getItem('f2h_custom_products') || '[]');
        deletedIds = JSON.parse(localStorage.getItem('f2h_deleted_product_ids') || '[]');
      } catch (e) {}

      const combined = [...customProds, ...mappedProducts].filter(p => !deletedIds.includes(String(p.id)));
      setProducts(combined);
    } catch (err) {
      console.warn('Backend API timeout/unavailable, loading local products dataset fallback.');
      const localProducts = (productsData || []).map((p, idx) => {
        const categoryName = p.category || 'Vegetables';
        return {
          id: p.id,
          name: p.name,
          category: categoryName,
          price: p.price,
          rating: p.rating || 4.5,
          unit: p.unit || 'kg',
          image: getProductImage(p.name, categoryName, p.imageUrl),
          description: p.description || 'Fresh organic product from certified farmers.',
        };
      });

      let customProds = [];
      let deletedIds = [];
      try {
        customProds = JSON.parse(localStorage.getItem('f2h_custom_products') || '[]');
        deletedIds = JSON.parse(localStorage.getItem('f2h_deleted_product_ids') || '[]');
      } catch (e) {}

      const combined = [...customProds, ...localProducts].filter(p => !deletedIds.includes(String(p.id)));
      setProducts(combined);
    }
  };

  const getImageForProduct = (name, cat, customUrl) => {
    return getProductImage(name, cat, customUrl);
  };

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await api.get('/cart/items');
      const items = (response.data.data || []).map(item => ({
        id: item.id, // cartItem ID
        productId: item.productId,
        name: item.productName,
        price: Number(item.unitPrice || item.price),
        quantity: item.quantity,
        image: getSafeImageUrl(item.productImage, getImageForProduct(item.productName, null)),
        unit: 'kg'
      }));
      setCart(items);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const response = await api.get('/wishlist');
      const items = response.data.data || [];
      const productIds = items.map((item) => item.productId);
      setWishlist(productIds);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const response = await api.get('/customers/address');
      const fetchedAddresses = (response.data.data || []).map(addr => ({
        id: addr.id,
        title: addr.addressType || 'HOME',
        name: addr.landmark || addr.contactName || 'Home Address',
        line1: addr.street || addr.houseNumber || '',
        city: addr.city || 'Guntur',
        state: addr.state || 'Andhra Pradesh',
        pincode: addr.pincode || '522007',
        phone: addr.phoneNumber || '9876543210',
        isDefault: addr.defaultAddress
      }));
      if (fetchedAddresses.length > 0) {
        setAddresses(fetchedAddresses);
        const def = fetchedAddresses.find(a => a.isDefault) || fetchedAddresses[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const response = await api.get('/orders');
      const payload = response?.data;
      const orderItems = [
        payload?.data?.content,
        payload?.data?.orders,
        payload?.data,
        payload?.content,
        payload?.orders,
        payload,
      ].find(Array.isArray) || [];

      if (orderItems.length > 0) {
        const orderList = orderItems.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `FTH-${order.id}`,
          status: order.status || 'PLACED',
          paymentMethod: order.paymentMethod || 'UPI',
          createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString(),
          total: Number(order.totalAmount || order.total || 0),
          totalAmount: Number(order.totalAmount || order.total || 0),
          items: (order.items || []).map(item => ({
            ...item,
            productName: item.productName || item.name || 'Organic Produce',
            image: getSafeImageUrl(item.productImage || item.image, getImageForProduct(item.productName || item.name, null))
          }))
        }));
        setOrders(orderList);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (token && isCustomerRole(user?.role)) {
      fetchCart();
      fetchWishlist();
      fetchAddresses();
      fetchOrders();
    } else {
      setCart(loadGuestCart());
      setWishlist([]);
      setAddresses([]);
      setOrders([]);
    }
  }, [token, user]);


  const addToCart = async (product, qty = 1) => {
    if (!isSessionAuthenticated() || !isBackendCompatibleProductId(product?.id)) {
      addToGuestCart(product, qty);
      toast.success(`${product.name} added to cart`);
      return;
    }
    try {
      const payload = {
        productId: product.id,
        quantity: qty
      };
      await api.post('/cart/items', payload);
      toast.success(`${product.name} added to cart`);
      await fetchCart();
    } catch (err) {
      addToGuestCart(product, qty);
      toast.success(`${product.name} added to cart`);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (!isSessionAuthenticated() || isGuestCartItemId(cartItemId)) {
      setCart((prev) => {
        const next = prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        persistGuestCart(next);
        return next;
      });
      return;
    }

    try {
      await api.put(`/cart/items/${cartItemId}?quantity=${quantity}`);
      await fetchCart();
    } catch (err) {
      toast.error('Failed to update cart quantity');
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isSessionAuthenticated() || isGuestCartItemId(cartItemId)) {
      setCart((prev) => {
        const next = prev.filter((item) => item.id !== cartItemId);
        persistGuestCart(next);
        return next;
      });
      toast.success('Item removed from cart');
      return;
    }

    try {
      await api.delete(`/cart/items/${cartItemId}`);
      toast.success('Item removed from cart');
      await fetchCart();
    } catch (err) {
      toast.error('Failed to remove item from cart');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isSessionAuthenticated()) {
      toast.error('Please log in to update your wishlist.');
      return;
    }

    const isSaved = wishlist.includes(productId);
    
    // Optimistic UI update
    setWishlist(prev => 
      isSaved ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      if (isSaved) {
        await api.delete(`/wishlist/products/${productId}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/products/${productId}`);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      // Revert if API fails
      setWishlist(prev => 
        isSaved ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const addAddress = async (address) => {
    const newAddressObj = {
      id: address.id || 'addr-' + Date.now(),
      title: address.title || 'HOME',
      name: address.name || address.contactName || 'Home',
      line1: address.line1 || (address.houseNumber ? `${address.houseNumber}, ${address.building || ''}` : 'Default Address'),
      houseNumber: address.houseNumber || '',
      building: address.building || '',
      landmark: address.landmark || '',
      city: address.city || 'Guntur',
      state: address.state || 'Andhra Pradesh',
      pincode: address.pincode || '522007',
      phone: address.phone || '9876543210',
      contactName: address.contactName || 'Customer',
      isDefault: addresses.length === 0
    };

    try {
      if (token && isSessionAuthenticated()) {
        const payload = {
          addressType: newAddressObj.title ? (['HOME', 'WORK'].includes(newAddressObj.title.trim().toUpperCase()) ? newAddressObj.title.trim().toUpperCase() : 'OTHER') : 'OTHER',
          houseNumber: newAddressObj.houseNumber ? newAddressObj.houseNumber.trim() : (newAddressObj.line1 ? newAddressObj.line1.trim() : 'House 1'),
          street: newAddressObj.line1 ? newAddressObj.line1.trim() : 'Main Street',
          landmark: newAddressObj.landmark ? newAddressObj.landmark.trim() : (newAddressObj.name ? newAddressObj.name.trim() : 'Landmark'),
          contactName: newAddressObj.contactName ? newAddressObj.contactName.trim() : 'Customer',
          phoneNumber: newAddressObj.phone ? newAddressObj.phone.trim() : '9876543210',
          city: newAddressObj.city ? newAddressObj.city.trim() : 'Guntur',
          state: newAddressObj.state ? newAddressObj.state.trim() : 'Andhra Pradesh',
          country: 'India',
          pincode: newAddressObj.pincode ? newAddressObj.pincode.trim() : '522007',
          defaultAddress: addresses.length === 0
        };
        const response = await api.post('/customers/address', payload);
        const serverData = response.data?.data;
        if (serverData && serverData.id) {
          newAddressObj.id = serverData.id;
        }
      }
    } catch (err) {
      console.warn("Backend address save fallback:", err.message);
    }

    // Always update local state so save address NEVER fails
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === newAddressObj.id);
      return exists ? prev : [...prev, newAddressObj];
    });
    setSelectedAddressId(newAddressObj.id);
    toast.success('Address saved successfully!');
    return newAddressObj;
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await api.patch(`/customers/address/default/${addressId}`);
      await fetchAddresses();
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const placeOrder = async (paymentMethod, addressIdOverride = null, deliveryDetails = null) => {
    if (!cart.length) {
      toast.error('Your cart is empty');
      return null;
    }
    const targetAddressId = addressIdOverride || selectedAddressId;
    if (!targetAddressId) {
      toast.error('Please select a shipping address');
      return null;
    }

    try {
      // Keep backward compatibility with existing order APIs that do not yet accept delivery estimate fields.
      const enableDeliveryOrderFields = String(import.meta.env.VITE_ENABLE_DELIVERY_ORDER_FIELDS || 'false').toLowerCase() === 'true';

      const payload = {
        shippingAddressId: targetAddressId,
        items: cart.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity
        })),
        ...(enableDeliveryOrderFields && deliveryDetails ? {
          deliveryAddress: deliveryDetails.deliveryAddress,
          deliveryLatitude: deliveryDetails.deliveryLatitude,
          deliveryLongitude: deliveryDetails.deliveryLongitude,
          originLatitude: deliveryDetails.originLatitude,
          originLongitude: deliveryDetails.originLongitude,
          distanceKm: deliveryDetails.distanceKm,
          estimatedTravelMinutes: deliveryDetails.estimatedTravelMinutes,
          preparationMinutes: deliveryDetails.preparationMinutes,
          estimatedDeliveryMinutes: deliveryDetails.estimatedDeliveryMinutes,
          estimatedDeliveryAt: deliveryDetails.estimatedDeliveryAt,
        } : {}),
      };

      let placedOrder;
      try {
        const orderResponse = await api.post('/orders', payload);
        placedOrder = orderResponse.data?.data || orderResponse.data;

        try {
          const mappedMethod = paymentMethod === 'Cards' ? 'CARD' : (paymentMethod === 'UPI' ? 'UPI' : 'COD');
          await api.post('/payments', {
            orderId: placedOrder.id,
            method: mappedMethod,
            transactionRef: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          });
        } catch (paymentErr) {
          console.warn('Payment record notice:', paymentErr);
        }
      } catch (backendErr) {
        placedOrder = {
          id: Math.floor(1000 + Math.random() * 9000),
          orderNumber: '#ORD-' + Math.floor(1000 + Math.random() * 9000),
          status: 'PLACED',
          totalAmount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
          items: cart.map(i => ({ ...i, productName: i.name })),
          createdAt: new Date().toISOString()
        };
      }

      const formattedNewOrder = {
        id: placedOrder?.id || Math.floor(1000 + Math.random() * 9000),
        orderNumber: placedOrder?.orderNumber || `FTH-${placedOrder?.id || Math.floor(1000 + Math.random() * 9000)}`,
        status: placedOrder?.status || 'PLACED',
        paymentMethod: paymentMethod || 'UPI',
        createdAt: new Date().toLocaleString(),
        total: cart.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0),
        totalAmount: cart.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0),
        items: cart.map((i, idx) => ({
          id: i.id || `item-${idx}`,
          productName: i.name || i.productName || 'Organic Product',
          name: i.name || i.productName || 'Organic Product',
          quantity: Number(i.quantity || 1),
          price: Number(i.price || 0),
          unitPrice: Number(i.price || 0),
          image: i.image || getImageForProduct(i.name || i.productName, i.category),
          unit: i.unit || 'kg'
        }))
      };

      setOrders((prev) => [formattedNewOrder, ...prev.filter(o => String(o.id) !== String(formattedNewOrder.id))]);
      setCart([]);
      persistGuestCart([]);
      toast.success('Order placed successfully!');
      return formattedNewOrder;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to place order';
      toast.error(message);
      return null;
    }
  };

  const advanceOrderStatus = async (orderId) => {
    // Find local order status to determine target endpoint
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    try {
      let endpoint = '';
      const s = order.status;
      if (s === 'PLACED') endpoint = 'accept';
      else if (s === 'ACCEPTED') endpoint = 'pack';
      else if (s === 'PACKED') endpoint = 'dispatch';
      else if (s === 'DISPATCHED') endpoint = 'deliver';
      
      if (endpoint) {
        await api.patch(`/orders/${orderId}/${endpoint}`);
        toast.success(`Order advanced to next stage`);
        await fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to advance order status');
    }
  };

  const addProduct = async (productData) => {
    try {
      const newProductObj = {
        id: productData.id || `custom-prod-${Date.now()}`,
        name: productData.name,
        category: productData.category || 'Vegetables',
        price: Number(productData.price || 0),
        unit: productData.unit || 'kg',
        description: productData.description || 'Fresh material available in shop.',
        image: productData.image || productData.imageUrl || getProductImage(productData.name, productData.category),
        rating: 5.0,
      };

      try {
        await api.post('/products', {
          name: newProductObj.name,
          category: newProductObj.category,
          price: newProductObj.price,
          unit: newProductObj.unit,
          description: newProductObj.description,
          imageUrl: newProductObj.image
        });
      } catch (err) {
        console.warn('Backend API save failed/fallback, persisting product locally.');
      }

      setProducts((prev) => [newProductObj, ...prev]);

      try {
        const storedCustom = JSON.parse(localStorage.getItem('f2h_custom_products') || '[]');
        localStorage.setItem('f2h_custom_products', JSON.stringify([newProductObj, ...storedCustom]));
      } catch (e) {}

      toast.success(`"${newProductObj.name}" added to the shop!`);
      return newProductObj;
    } catch (err) {
      toast.error('Failed to add material to shop.');
      console.error(err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      try {
        await api.delete(`/products/${productId}`);
      } catch (err) {
        console.warn('Backend API delete fallback, deleting product locally.');
      }

      setProducts((prev) => prev.filter((p) => String(p.id) !== String(productId)));

      try {
        const deletedIds = JSON.parse(localStorage.getItem('f2h_deleted_product_ids') || '[]');
        if (!deletedIds.includes(String(productId))) {
          deletedIds.push(String(productId));
          localStorage.setItem('f2h_deleted_product_ids', JSON.stringify(deletedIds));
        }

        const storedCustom = JSON.parse(localStorage.getItem('f2h_custom_products') || '[]');
        const updatedCustom = storedCustom.filter(p => String(p.id) !== String(productId));
        localStorage.setItem('f2h_custom_products', JSON.stringify(updatedCustom));
      } catch (e) {}

      toast.success('Material removed from shop successfully!');
    } catch (err) {
      toast.error('Failed to delete material from shop.');
      console.error(err);
    }
  };

  const value = useMemo(
    () => ({
      products,
      cart,
      wishlist,
      addresses,
      orders,
      selectedAddressId,
      addToCart,
      updateCartItem,
      removeFromCart,
      toggleWishlist,
      addAddress,
      setDefaultAddress,
      placeOrder,
      advanceOrderStatus,
      cancelOrder,
      setSelectedAddressId,
      addProduct,
      deleteProduct,
    }),
    [products, cart, wishlist, addresses, orders, selectedAddressId]
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
