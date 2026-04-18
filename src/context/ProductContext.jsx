import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

// Local Backup Data for Demo/Production if Backend is not available
const DEFAULT_PRODUCTS = [
  {
    "_id": "1",
    "name": "Espresso",
    "price": 2.5,
    "category": "Coffee",
    "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80"
  },
  {
    "_id": "2",
    "name": "Americano",
    "price": 3,
    "category": "Coffee",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80"
  },
  {
    "_id": "3",
    "name": "Caffe Latte",
    "price": 4,
    "category": "Coffee",
    "image": "https://images.unsplash.com/photo-1536939459926-301728717817?w=500&q=80"
  },
  {
    "_id": "4",
    "name": "Cappuccino",
    "price": 4,
    "category": "Coffee",
    "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80"
  },
  {
    "_id": "5",
    "name": "Caffe Mocha",
    "price": 4.5,
    "category": "Coffee",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80"
  },
  {
    "_id": "11",
    "name": "Matcha Latte",
    "price": 4.8,
    "category": "Tea",
    "image": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80"
  },
  {
    "_id": "17",
    "name": "Strawberry Yogurt",
    "price": 5.5,
    "category": "Smoothie",
    "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80"
  },
  {
    "_id": "24",
    "name": "Astra Burger",
    "price": 9.5,
    "category": "Food",
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"
  },
  {
    "_id": "26",
    "name": "French Fries (L)",
    "price": 4.5,
    "category": "Food",
    "image": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80"
  }
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS); 
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All', 'Coffee', 'Tea', 'Smoothie', 'Food']);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
        const cats = ['All', ...new Set(res.data.map(p => p.category))];
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Backend server not found, using local backup products for demo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, categories, loading, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
