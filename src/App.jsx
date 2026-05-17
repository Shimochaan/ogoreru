import { Routes,Route } from "react-router-dom"
import TopScreen from "./pages/TopScreen"
import PlayerSetup from "./pages/PlayerSetup"


function App() {
  return(
  <Routes>
    <Route path="/" element={<TopScreen />}/>
     <Route path="/setup" element={<PlayerSetup />}/>
  </Routes>
  )
}

export default App
