import { Routes,Route } from "react-router-dom"
import TopScreen from "./pages/TopScreen"
import PlayerSetup from "./pages/PlayerSetup"
import Shop  from "./pages/Shop"
import Cart from"./pages/Cart"


function App() {
  return(
  <Routes>
    <Route path="/" element={<TopScreen />}/>
     <Route path="/setup" element={<PlayerSetup />}/>
     <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
  </Routes>
  )
}

export default App
