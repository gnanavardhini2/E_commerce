import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";
import API from "../api";
import { useLocation, useNavigate } from "react-router-dom";

import "./Home.css";
import "./UserPanel.css";

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("latest");
  const { cartItems, addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useShop();
    // Add to Cart handler with duplicate prevention and feedback
    const handleAddToCart = (product: any) => {
      const alreadyInCart = cartItems.some((item) => item.product.id === product.id);
      if (alreadyInCart) {
        setToast("Already in cart");
      } else {
        addToCart(product);
        setToast("Added to cart");
      }
      setTimeout(() => setToast(null), 1500);
    };
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await API.get('/products');
        setProducts(res.data || []);
      } catch (error) {
        console.log('Failed to load products:', error);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    if (category && category.trim()) {
      setCategoryFilter(category.trim());
    }
  }, [location.search]);

  const uniqueCategories = Array.from(
    new Set(products.map((p) => (p.category || "Uncategorized").trim()))
  ).filter(Boolean);

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.price.toString().includes(search);

      const productCategory = (p.category || "Uncategorized").trim().toLowerCase();
      const selectedCategory = categoryFilter.trim().toLowerCase();
      const matchesCategory = selectedCategory === "all" || productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortFilter === "priceLowToHigh") return Number(a.price) - Number(b.price);
      if (sortFilter === "priceHighToLow") return Number(b.price) - Number(a.price);
      if (sortFilter === "nameAToZ") return String(a.name).localeCompare(String(b.name));
      if (sortFilter === "nameZToA") return String(b.name).localeCompare(String(a.name));
      return Number(b.id) - Number(a.id);
    });

  const handleWishlist = (product: any) => {
    if (wishlistItems.some((item) => item.id === product.id)) {
      removeFromWishlist(product.id);
      setToast("Removed from Wishlist");
    } else {
      addToWishlist(product);
      setToast("Added to Wishlist");
    }
    setTimeout(() => setToast(null), 1500);
  };

  return (
    <div className="home-bg user-shell">

      <section className="products-section">
        <h2 className="user-page-title" style={{ marginBottom: 4 }}>All Products</h2>
        <p className="user-page-subtitle" style={{ marginBottom: 16 }}>Browse our full collection with instant search.</p>
        <div className="products-filters-wrap">
          <div className="products-filter-item products-filter-search">
            <label className="products-filter-label">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="navbar-search-input"
              placeholder="Search products..."
            />
          </div>
          <div className="products-filter-item">
            <label className="products-filter-label">Category</label>
            <select
              className="products-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="products-filter-item">
            <label className="products-filter-label">Sort</label>
            <select
              className="products-select"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="nameAToZ">Name: A to Z</option>
              <option value="nameZToA">Name: Z to A</option>
            </select>
          </div>
          <div className="products-filter-item products-filter-actions">
            <button
              className="ghost-link-btn"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setSortFilter("latest");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        {toast && (
          <div className="toast-message">{toast}</div>
        )}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No products found</div>
            <div className="empty-state-subtext">Try adjusting your search or check back later.</div>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleWishlist(product)}
                wishlisted={wishlistItems.some((item) => item.id === product.id)}
                onViewDetails={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
