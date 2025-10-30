import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Card from "./components/Card.js";
import Weather from "./components/Weather.js";
import Login from "./components/Login.js";
import "./styles/App.css";

const KICKER_TEXT = "The best tees in town. ";
const KICKER_TEXT_ANIMATION_ENABLED = true;

interface Product {
  id: string;
  title: string;
  color: string;
  size?: "S" | "M" | "L" | "XL";
  price?: number;
}

const getCurrentUser = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/auth/user", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

const login = async (name: string): Promise<void> => {
  try {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kickerText, setKickerText] = useState<string>(KICKER_TEXT);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Error fetching products:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCart = async () => {
  };

  const addToCart = async (productId: string) => {
  };

  const removeFromCart = async (productId: string) => {
  };

  const rotateKickerText = () => {
    demo0Rotate();
    // demo1Alert();
    // demo2Loop();
    // demo3Bug();
  };

  const demo0Rotate = () => {
    if (isRotating || !KICKER_TEXT_ANIMATION_ENABLED) return;
    setIsRotating(true);
    setKickerText((prevText) => {
      if (prevText.length <= 1) return prevText;
      return prevText.slice(1) + prevText[0];
    });
    setTimeout(() => {
      setIsRotating(false);
    }, 300);
  };

  const demo1Alert = () => {
    alert("Hello world");
  }

  const demo2Loop = () => {
    const numLoops = 5;
    let counter = 0;
    
    const countUp = () => {
      setKickerText(counter.toString());
      setIsRotating(true);
      
      if (counter < numLoops) {
        counter++;
        setTimeout(() => {
          setIsRotating(false);
          setTimeout(countUp, 1000);
        }, 300);
      } else {
        setTimeout(() => {
          setIsRotating(false);
          setTimeout(() => {
            setKickerText(KICKER_TEXT);
          }, 1000);
        }, 300);
      }
    };
    
    if (!isRotating && KICKER_TEXT_ANIMATION_ENABLED) {
      countUp();
    }
  }

  const demo3Bug = () => {
    const numerators = [100, 50, 75, 60, 80];
    const denominators = [10, 5, 3, 0, 4];
    const results: number[] = [];
    for (let i = 0; i < numerators.length; i++) {
      const result = numerators[i] / denominators[i];
      const percentage = (result * 100).toFixed(2);
      const formattedResult = percentage.split('.')[0];
      results.push(parseInt(formattedResult));
    }
    setKickerText(results.join(', '));
  }

  useEffect(() => {
    (async () => {
      await fetchProducts();
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        await fetchCart();
      }
    })();
  }, []);

  const handleLogin = async (name: string) => {
    await login(name);
    setCurrentUser(name);
    await fetchCart();
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setCart([]);
  };

  const cards = products.map((product, index) => (
    <Card
      key={product.id}
      id={product.id}
      color={product.color}
      title={product.title}
      size={product.size}
      price={product.price}
      currentUser={currentUser}
      isInCart={cart.includes(product.id)}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
    />
  ));

  return (
    <div>
      <h1> Welcome to our <b>My Tee Shop</b></h1>
      <div className="button-container">
        <a href="https://info.techup.today" target="_blank" className="button-techup">Learn more about our sponsor, TechUp, here!</a>
      </div>
      <h2 
        id="kicker" 
        onClick={rotateKickerText}
        className={isRotating ? "rotating" : ""}
        style={{ cursor: "pointer" }}
      >
        {kickerText}
      </h2>
      <Weather />
      <Login
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartItemCount={currentUser ? cart.length : null}
      />
      <div className="cards-container">{cards}</div>
    </div>
  );
};

if (typeof window !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}



export default App;
