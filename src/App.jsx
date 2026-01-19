import { createContext, useContext, useState } from "react";

// 1. データの「箱」を作る
const ThemeContext = createContext();

export default function App() {
  // テーマの状態（light または dark）
  const [theme, setTheme] = useState("light");

  // テーマを切り替える関数
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const containerStyle = {
    backgroundColor: theme === "light" ? "#ffffff" : "#222222",
    color: theme === "light" ? "#000000" : "#ffffff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s" // じわっと色が変わる
  };

  return (
    // 2. Providerで包んで、themeと関数を「バケツ」に入れる
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={containerStyle}>
        <h1>Vite + React + useContext</h1>
        <Card />
      </div>
    </ThemeContext.Provider>
  );
}

// 子コンポーネント（Propsで何も受け取っていないことに注目！）
function Card() {
  return (
    <div style={{ border: "1px solid gray", padding: "20px", borderRadius: "8px" }}>
      <p>ここは子コンポーネントの中です</p>
      <ThemeButton />
    </div>
  );
}

// 孫コンポーネント（ここでデータを取り出す）
function ThemeButton() {
  // 3. useContextを使って、一番上のAppからデータを取り出す
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} style={{ cursor: "pointer", padding: "10px 20px" }}>
      {theme === "light" ? "ダークモードへ" : "ライトモードへ"}
    </button>
  );
}