import { createContext, useState } from "react"

// Context の入れ物を作る
export const AppContext = createContext()

// アプリ全体を包むProvider コンポーネント
export function AppProvider({ children }) {
  // ここに、アプリ全体で共有したい state を全部書く
  const [players, setPlayers] = useState([
    { name: '', icon: '🐱' },
    { name: '', icon: '🐶' },
    { name: '', icon: '🐼' },
  ])

  const [cart, setCart] = useState([])

  // Provider で配信する値（state と setter のセット）
  const value = {
    players,
    setPlayers,
    cart,
    setCart,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
