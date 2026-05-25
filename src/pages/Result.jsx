import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

// API 失敗時に画面に出す予備の文言。ここを書き換えればフォールバック文言を差し替えられる
const FALLBACK_COMMENTARY = '実況の召喚に失敗…でもお会計よろしくね！'

function Result() {
  const { loser, cart, setCart } = useContext(AppContext)
  const navigate = useNavigate()

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // AI実況のための state を3つ用意する
  // commentary: 生成された実況テキスト（最初は空文字）
  // isLoading:  生成中フラグ（最初は true で始める。マウント直後すぐAPIを叩くから）
  // hasError:   エラーが起きたか
  const [commentary, setCommentary] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // マウント時に1回だけ /api/jikkyo を叩く
  useEffect(() => {
    // 直接アクセスで loser が無いケースは fetch しない
    if (!loser) {
      setIsLoading(false)
      return
    }

    // useEffect の中で async を直接使えないので、内部関数を定義してから呼ぶ
    const fetchCommentary = async () => {
      try {
        const response = await fetch('/api/jikkyo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            loserName: loser.name || 'Player',
            cartItems: cart.map((item) => ({
              name: item.name,
              price: item.price,
              qty: item.qty,
            })),
            totalPrice,
          }),
        })

        if (!response.ok) {
          throw new Error(`status ${response.status}`)
        }

        const data = await response.json()
        if (!data.commentary) {
          throw new Error('empty commentary')
        }
        setCommentary(data.commentary)
      } catch (err) {
        console.error('jikkyo fetch failed:', err)
        setHasError(true)
        setCommentary(FALLBACK_COMMENTARY)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommentary()
    // loser は奢り役が決まった後は不変なので、依存配列に入れても1回しか走らない
  }, [loser, cart, totalPrice])

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

      {/* AI実況コメント */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <h3 className="text-sm text-gray-400 mb-2">📣 AI実況</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500 animate-pulse">実況を考えています…</p>
        ) : (
          <p className={`text-sm leading-relaxed ${hasError ? 'text-gray-400' : 'text-white'}`}>
            {commentary}
          </p>
        )}
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
