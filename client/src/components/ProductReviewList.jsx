import React, { useState, useEffect } from "react";
import { useAuthUser } from "../security/AuthContext";
import "../style/reviews.css";

export default function ProductReviewList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const { isAuthenticated, user } = useAuthUser();

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

  useEffect(() => {
    if (selectedProduct) {
      const fetchReviews = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${selectedProduct.id}`);
          if (response.ok) {
            const data = await response.json();
            setReviews(data.reviews || []);
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [selectedProduct]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to submit a review");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product to review");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: parseInt(newReview.rating),
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        // Refresh reviews list
        const productResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/products/${selectedProduct.id}`
        );
        
        if (productResponse.ok) {
          const data = await productResponse.json();
          setReviews(data.reviews || []);
          // Clear form
          setNewReview({ rating: 5, comment: "" });
          alert("Review submitted successfully!");
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to submit review: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  return (
    <div className="review-list-container">
      <h1>Product Reviews</h1>
      
      <div className="product-selector">
        <h2>Select a Product</h2>
        <select 
          onChange={handleProductChange}
          value={selectedProduct?.id || ""}
        >
          <option value="">Select a product...</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="reviews-section">
          <h2>Reviews for {selectedProduct.name}</h2>
          
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div>
                <label>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Comment:</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                />
              </div>
              <button type="submit">Submit Review</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-rating">Rating: {review.rating}/5</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-author">By: {review.user.name}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}