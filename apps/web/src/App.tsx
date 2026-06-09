import { Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home/HomePage.js";

export const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
);
