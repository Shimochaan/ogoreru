import { useState , useEffect } from "react"

function App() {

const [isTitleVisible,setIsTitileVisible] = useState(false)
const [areButtonVisible,setAreButtonVisible] = useState(false)


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

      <button  className={`bg-white text-black px-8 py-3 rounded-lg text-lg font-medium transition-all duration-700 ${areButtonVisible? 'opacity-100 translate-y-0' :'opacity-0 translate-y-4'}`}>
スタート</button>

<button className={`bg-transparent text-white px-8 py-3  border border-gray-500 rounded-lg text-lg font-medium transition-all duration-700 ${areButtonVisible? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} `}>履歴</button>

  </div>
  )
}

export default App
