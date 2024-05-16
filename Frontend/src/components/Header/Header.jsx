import React, { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const fetchRandomQuote = async () => {
      try {
        const response = await axios.get("https://api.quotable.io/random");
        const { content } = response.data;
        setQuote(content);
      } catch (error) {
        console.error("Error fetching quote:", error);
      }
    };

    fetchRandomQuote();
  }, []);

  return (
    <header className="bg-blue-600 text-white py-4 text-center">
      <h1 className="text-lg font-bold" >{quote}</h1>
    </header>
  );
};

export default Header;
