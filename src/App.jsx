import { Routes, Route } from "react-router-dom"
import TopScreen from "./pages/TopScreen"
import PlayerSetup from "./pages/PlayerSetup"
import Shop from "./pages/Shop"
import Cart from "./pages/Cart"
import Janken from "./pages/Janken"
import Result from "./pages/Result"
import History from "./pages/History"

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopScreen />} />
      <Route path="/setup" element={<PlayerSetup />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/janken" element={<Janken />} />
      <Route path="/result" element={<Result />} />
      <Route path="/history" element={<History />} />
    </Routes>
  )
}

export default App
