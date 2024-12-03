import React, { useState } from "react";
import "../style/product-search.css";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    if (!query) return;

    setLoading(true);
    setError("");

    const apiKey = process.env.REACT_APP_AMAZON_API_KEY;
    const apiHost = process.env.REACT_APP_AMAZON_API_HOST;

    try {
      const response = await fetch(
        `https://${apiHost}/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": apiHost,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Products:", JSON.stringify(data, null, 2)); // 打印获取到的数据，检查数据结构

        // 根据返回的数据结构进行适配
        if (data && data.products) {
          setProducts(data.products);
        } else if (data && data.data && data.data.products) {
          setProducts(data.data.products);
        } else {
          console.warn("Unexpected data structure:", data);
          setProducts([]);
        }
      } else {
        setError("Failed to fetch products");
        console.error("Failed to fetch products", response.statusText);
      }
    } catch (error) {
      setError("An error occurred while fetching products.");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-search">
      <h1>Amazon Product Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter product keyword"
      />
      <button onClick={fetchProducts} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {products.length > 0 ? (
          products.map((product, index) => (
            <li key={product.asin || product.id || index}>
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.product_photo ? (
                  <img
                    src={product.product_photo}
                    alt={product.product_title || "Product Image"}
                    style={{ width: "100px" }}
                  />
                ) : (
                  <p>No image available</p>
                )}
                <h3>{product.product_title || "No Title Available"}</h3>
              </a>
              <p>
                Price: {product.product_price ? `$${product.product_price}` : "N/A"}
              </p>
            </li>
          ))
        ) : (
          !loading && <p>No products found.</p>
        )}
      </ul>
    </div>
  );
}
