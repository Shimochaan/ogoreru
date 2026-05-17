import { Routes,Route } from "react-router-dom"
import TopScreen from "./pages/TopScreen"
import PlayerSetup from "./pages/PlayerSetup"
import Shop  from "./pages/Shop"


function App() {
  return(
  <Routes>
    <Route path="/" element={<TopScreen />}/>
     <Route path="/setup" element={<PlayerSetup />}/>
     <Route path="/shop" element={<Shop />} />
  </Routes>
  )
}

export default App
