function AnimatedButton({children,isVisible,variant,onClick}){
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
    <button onClick={onClick} className={`${baseClass} ${variantClass} ${animationClass} `}>
      {children}
    </button>
  )
}

export default AnimatedButton
