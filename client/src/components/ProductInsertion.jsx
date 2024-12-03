import React, { useState } from "react";
import { fetchPostWithAuth } from "../security/fetchWithAuth";
import "../style/product-insertion.css";

export default function ProductInsertion() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleInsert = async (e) => {
    e.preventDefault();
    try {
      // Make the POST request to the backend to insert a new product
      const response = await fetchPostWithAuth(
        `${process.env.REACT_APP_API_URL}/products`,
        {
          name,
          description,
          price,
          category,
        }
      );

      if (response.ok) {
        // Display success message to the user
        setMessage("Product successfully inserted!");
        // Optionally clear the form fields
        setName("");
        setDescription("");
        setPrice(0);
        setCategory("");
      } else {
        // Handle the case where the product insertion failed
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to insert product"}`);
      }
    } catch (error) {
      console.error("Error inserting product:", error);
      setMessage("An error occurred while inserting the product.");
    }
  };

  return (
    <div className="product-insertion">
      <h1>Insert New Product</h1>
      <form onSubmit={handleInsert}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <button type="submit">Insert Product</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
