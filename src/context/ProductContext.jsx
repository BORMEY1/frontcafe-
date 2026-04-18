import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

const DEFAULT_PRODUCTS = [
  { "_id": "1", "name": "Espresso", "price": 2.5, "category": "Coffee", "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80" },
  { "_id": "2", "name": "Americano", "price": 3, "category": "Coffee", "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80" },
  { "_id": "3", "name": "Caffe Latte", "price": 4, "category": "Coffee", "image": "https://images.unsplash.com/photo-1536939459926-301728717817?w=500&q=80" }
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('local_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All', 'Coffee', 'Tea', 'Smoothie', 'Food']);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
        localStorage.setItem('local_products', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Using local memory products.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => fetchProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, categories, loading, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
