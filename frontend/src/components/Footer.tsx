import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About</h4>
          <p>VardhiniChaiCart is your trusted destination for quality products, smart pricing, and fast, reliable delivery.</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@vardhinichaicart.com</p>
          <p>Phone: +91 98765 43210</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="footer-socials">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} VardhiniChaiCart. All rights reserved.</div>
    </footer>
  );
}
