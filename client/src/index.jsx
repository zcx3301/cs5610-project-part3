import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Component imports
import Profile from "./components/Profile";
import ProductInsertion from "./components/ProductInsertion";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Cart from "./components/Cart";
import ProductSearch from "./components/ProductSearch";
import ProductDetails from "./components/ProductDetails";
import ProductReviewList from "./components/ProductReviewList";
import AppLayout from "./components/AppLayout";
import ProductsList from "./components/ProductsList";

// Security imports
import { AuthProvider } from "./security/AuthContext";
import RequireAuth from "./security/RequireAuth";

// Style imports
//import "./style/normalize.css";
import './style/variables.css';
import './style/global.css';

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<ProductsList />} />
            <Route path="product" element={<ProductDetails />} />
            {/* need to be logged in */}
            <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="cart"
              element={
                <RequireAuth>
                  <Cart />
                </RequireAuth>
              }
            />
            {/* don't need to be logged in */}
            <Route path="amazon-products" element={<ProductSearch />} />
            <Route path="products/insert" element={<ProductInsertion />} />
            <Route path="reviews" element={<ProductReviewList />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
