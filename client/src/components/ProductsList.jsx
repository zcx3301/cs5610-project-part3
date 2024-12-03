import React, { useEffect, useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import { fetchPostWithAuth } from "../security/fetchWithAuth";
import "../style/products.css";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
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
      setMessage("Please login to add items to cart");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await fetchPostWithAuth(`${process.env.REACT_APP_API_URL}/cart`, {
        productId,
        quantity: 1,
      });
      if (response.ok) {
        setMessage("Product added to cart successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      setMessage("Error adding product to cart");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (products.length === 0) {
    return (
      <div className="products-container">
        <h1>Products</h1>
        <p>No products available.</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h1>Products</h1>
      {message && <div className="message-toast">{message}</div>}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <span className="product-name">{product.name}</span>
              <span className="product-price">${product.price.toFixed(2)}</span>
            </div>
            {product.description && (
              <p className="product-description">{product.description}</p>
            )}
            {product.category && (
              <span className="product-category">Category: {product.category}</span>
            )}
            <button 
              className="add-to-cart-button"
              onClick={() => handleAddToCart(product.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}