import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

function Result() {
  const { loser, cart, setCart } = useContext(AppContext)
  const navigate = useNavigate()

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // ガード：直接アクセスされた場合
  if (!loser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>結果がありません</p>
      </div>
    )
  }

  const handleBackToTop = () => {
    setCart([])  // カゴをリセット
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">

      {/* 奢り役発表 */}
      <div className="text-center mt-8 mb-6">
        <p className="text-sm text-gray-400 mb-2">奢り役は…</p>
        <div className="text-8xl mb-4">{loser.icon}</div>
        <h1 className="text-3xl font-medium">
          {loser.name || 'Player'} さん！
        </h1>
        <p className="text-sm text-gray-500 mt-2">お会計よろしく〜</p>
      </div>

      {/* お会計内容 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm text-gray-400 mb-3">お会計内容</h3>
        <div className="flex flex-col gap-2 mb-3">
          {cart.map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="text-2xl">{item.emoji}</span>
              <span className="flex-1">{item.name} × {item.qty}</span>
              <span>¥{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-400">合計</span>
          <span className="text-2xl font-medium">¥{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col gap-3 mt-auto">
        <button
          onClick={() => navigate('/history')}
          className="bg-gray-700 text-white rounded-lg py-3 font-medium"
        >
          履歴を見る
        </button>
        <button
          onClick={handleBackToTop}
          className="bg-white text-black rounded-lg py-3 font-medium"
        >
          最初に戻る
        </button>
      </div>

    </div>
  )
}

export default Result
