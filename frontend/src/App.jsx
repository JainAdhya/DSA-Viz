import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import HeroPage from "./pages/HeroPage";

function App() {
  return (
    <div className="App min-h-screen flex bg-black text-white">
      <Routes>
        <Route path="/" element={<HeroPage />} /> {/* default page */}
        <Route path="/HomePage" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
