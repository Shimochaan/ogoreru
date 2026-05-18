import { useState , useEffect } from "react"
import AnimatedButton from "../components/AnimatedButton"
import { useNavigate } from "react-router-dom"

function TopScreen() {

const [isTitleVisible,setIsTitileVisible] = useState(false)
const [areButtonVisible,setAreButtonVisible] = useState(false)
const navigate = useNavigate()


useEffect(()=>{
  setTimeout(()=>{
    setIsTitileVisible(true)
  },1000)

  setTimeout(()=>{
    setAreButtonVisible(true)
  },2400)
},[])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center flex-col gap-6">
<h1 className={`text-white text-5xl font-bold tracking-widest transition-all duration-1000 ${isTitleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
  オゴレル
</h1>

<AnimatedButton isVisible={areButtonVisible} variant="primary" onClick={()=>navigate("/setup")} >スタート</AnimatedButton>
<AnimatedButton onClick={()=>navigate("/history")} isVisible={areButtonVisible} variant="secondary">履歴</AnimatedButton>



  </div>
  )
}

export default TopScreen
