import "./App.css";
import DenomTable from "./components/DenomTable";

const denomRows = [
  { denom: "10,000", count: "12", subtotal: "¥120,000" },
  { denom: "5,000", count: "8", subtotal: "¥40,000" },
  { denom: "2,000", count: "4", subtotal: "¥8,000" },
  { denom: "1,000", count: "52", subtotal: "¥52,000" },
  { denom: "500", count: "48", subtotal: "¥24,000" },
  { denom: "100", count: "260", subtotal: "¥26,000" },
  { denom: "50", count: "80", subtotal: "¥4,000" },
  { denom: "10", count: "120", subtotal: "¥1,200" },
  { denom: "5", count: "60", subtotal: "¥300" },
  { denom: "1", count: "200", subtotal: "¥200" },
];
const expectedActualTotal = 260000;

function App() {
  return (
    <div className="app">
      <DenomTable rows={denomRows} expectedActualTotal={expectedActualTotal} />
    </div>
  );
}

export default App;
