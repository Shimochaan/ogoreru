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

<AnimatedButton isVisible={areButtonVisible} variant="primary">スタート</AnimatedButton>
<AnimatedButton isVisible={areButtonVisible} variant="secondary">履歴</AnimatedButton>



  </div>
  )
}


function AnimatedButton({children,isVisible,variant}){
  const baseClass = "px-8 py-3 rounded-lg text-lg font-medium transition-all duration-700"

  const variants ={
    primary: 'bg-white text-black',
    secondary: 'bg-transparent text-white border border-gray-500',
  }

  const variantClass = variants[variant]

  const animationClass = isVisible
  ? 'opacity-100 translate-y-0'
  :'opacity-0 translate-y-4'

return (
    <button className={`${baseClass} ${variantClass} ${animationClass}`}>
      {children}
    </button>
  )
}

export default App
