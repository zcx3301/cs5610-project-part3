import React, { useEffect, useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import "../style/carts.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = useAuthUser();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="empty-cart">
          Your cart is empty
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
      </div>
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <div className="cart-item-info">
            <span className="product-name">{item.product.name}</span>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          <button 
            className="remove-btn"
            onClick={() => handleDeleteItem(item.id)}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="checkout-section">
        <button className="btn-checkout">
          Checkout
        </button>
      </div>
    </div>
  );
}