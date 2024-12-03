import React, { useEffect, useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import '../style/products.css';

export default function ProductDetails() {
  const [products, setProducts] = useState([]);
  const { isAuthenticated } = useAuthUser();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to the cart.');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 }),
        credentials: 'include'
      });
      if (response.ok) {
        alert('Product added to cart!');
      } else {
        alert('Failed to add product to cart.');
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div className="product-details-container">
      <h1 className="title">Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <span>${product.price.toFixed(2)}</span>
            <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}