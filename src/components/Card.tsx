import React, { useEffect, useRef, useMemo } from "react";
import { renderTShirt } from "../utils/tshirt.js";
import Button from "./Button.js";
import "../styles/Card.css";

interface CardProps {
  id: string;
  color: string;
  title: string;
  currentUser: string | null;
  isInCart: boolean;
  onAddToCart: (productId: string) => Promise<void>;
  onRemoveFromCart: (productId: string) => Promise<void>;
}

const Card: React.FC<CardProps> = ({ 
  id, 
  color, 
  title, 
  currentUser, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate random size and price (memoized per card id to stay consistent)
  const { size, price } = useMemo(() => {
    const sizes = ['S', 'M', 'L', 'XL'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomPrice = Math.floor(Math.random() * 91) + 10; // 10 to 100 inclusive
    return { size: randomSize, price: randomPrice };
  }, [id]);

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
      <div className="card-details">
        <div className="card-size">Size: {size}</div>
        <div className="card-price">Price: ${price}</div>
      </div>
      <Button 
        text={isInCart ? "Remove from cart" : "Add to cart"} 
        onClick={handleCartAction} 
        disabled={!currentUser}
      />
    </div>
  );
};

export default Card;
