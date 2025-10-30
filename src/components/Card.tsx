import React, { useEffect, useRef } from "react";
import { renderTShirt } from "../utils/tshirt.js";
import Button from "./Button.js";
import "../styles/Card.css";

interface CardProps {
  id: string;
  color: string;
  title: string;
  size?: string;
  price?: number;
  currentUser: string | null;
  isInCart: boolean;
  onAddToCart: (productId: string) => Promise<void>;
  onRemoveFromCart: (productId: string) => Promise<void>;
}

const Card: React.FC<CardProps> = ({ 
  id, 
  color, 
  title, 
  size,
  price,
  currentUser, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderTShirt(canvasRef.current, color);
    }
  }, [color]);

  const handleCartAction = async () => {
    if (isInCart) {
      await onRemoveFromCart(id);
    } else {
      await onAddToCart(id);
    }
  };

  return (
    <div className="card">
      {isInCart && (
        <div className="cart-banner">
          Added to cart
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
      />
      <h3>{title}</h3>
      <p className="product-meta">Size: {size ?? "M"}</p>
      <p className="product-price">${price ?? 0}</p>
      <Button 
        text={isInCart ? "Remove from cart" : "Add to cart"} 
        onClick={handleCartAction} 
        disabled={!currentUser}
      />
    </div>
  );
};

export default Card;
