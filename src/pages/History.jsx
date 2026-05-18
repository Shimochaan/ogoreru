import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

function History() {
  const { history } = useContext(AppContext)
  const navigate = useNavigate()

  // 日時を「2026年5月18日 14:30」のような形式に整形する関数
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}年${m}月${d}日 ${hh}:${mm}`
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-700">← 戻る</button>
        <h2 className="text-xl font-medium ml-4">履歴</h2>
      </div>

      {/* 履歴リスト */}
      {history.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-5xl mb-3">📋</div>
          <p>まだ履歴がありません</p>
          <p className="text-xs mt-2">じゃんけんを終えると、ここに記録されます</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((session, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border">
              {/* 日時 */}
              <p className="text-xs text-gray-500 mb-2">
                {formatDate(session.date)}
              </p>

              {/* 奢った人 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{session.loser.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">奢ったのは</p>
                  <p className="font-medium">
                    {session.loser.name || 'Player'} さん
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">合計</p>
                  <p className="text-lg font-medium">
                    ¥{session.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 買った商品の絵文字一覧（コンパクトに） */}
              <div className="flex flex-wrap gap-1 text-xl border-t pt-3">
                {session.cart.map((item, i) => (
                  <span key={i} title={`${item.name} ×${item.qty}`}>
                    {item.emoji}
                    {item.qty > 1 && <span className="text-xs text-gray-500">×{item.qty}</span>}
                  </span>
                ))}
              </div>

              {/* 参加プレイヤー（小さく） */}
              <div className="flex gap-1 mt-3 text-base">
                {session.players.map((player, i) => (
                  <span key={i}>{player.icon}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default History
