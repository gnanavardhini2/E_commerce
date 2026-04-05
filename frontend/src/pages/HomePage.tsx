import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useShop, Product } from "../context/ShopContext";
import API from "../api";
import "./Home.css";
import "./HomeExtra.css";

const categories = [
  { name: "Electronics", image: "https://cdn-icons-png.flaticon.com/512/1041/1041372.png", key: "Electronics" },
  { name: "Fashion", image: "https://cdn-icons-png.flaticon.com/512/892/892458.png", key: "Fashion" },
  { name: "Accessories", image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png", key: "Accessories" },
];
const offers = [
  { title: "Up to 50% OFF", desc: "On select electronics & gadgets", color: "#fbbf24" },
  { title: "Today's Deals", desc: "Best prices on trending products", color: "#38bdf8" },
  { title: "Extra 10% Cashback", desc: "With select cards & wallets", color: "#34d399" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { wishlistItems, addToCart, addToWishlist } = useShop();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await API.get('/products');
        setFeatured(res.data || []);
      } catch (error) {
        console.log('Failed to load featured products:', error);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="home-bg">
      {/* Hero Section */}
      <section className="hero fade-in">
        <h1 className="hero-title">Welcome to VardhiniChaiCart</h1>
        <p className="hero-subtitle">Discover quality products, everyday value, and fast delivery.</p>
        <button className="hero-btn" onClick={() => navigate("/products")}>Shop Now</button>
      </section>

      {/* Featured Products */}
      <section className="products-section fade-in home-featured-section">
        <h2 className="section-title">Featured Products</h2>
        <div className="products-grid-horizontal">
          {featured.map((product: Product) => (
            <div key={product.id} className="featured-product-slot">
              <ProductCard
                product={product}
                onAddToCart={() => addToCart?.(product)}
                onAddToWishlist={addToWishlist ? () => addToWishlist(product) : undefined}
                wishlisted={wishlistItems?.some((item) => item.id === product.id)}
                onViewDetails={() => navigate(`/products/${product.id}`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section fade-in">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className="category-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.key)}`)}
              tabIndex={0}
              role="button"
              aria-label={`Browse ${cat.name}`}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/products?category=${encodeURIComponent(cat.key)}`); }}
            >
              <img src={cat.image} alt={cat.name} className="category-image" />
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers-section fade-in">
        <h2 className="section-title">Latest Offers</h2>
        <div className="offers-grid">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className="offer-card"
              style={{ background: offer.color, color: '#fff' }}
            >
              <div className="offer-title">{offer.title}</div>
              <div className="offer-desc">{offer.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
