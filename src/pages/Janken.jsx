import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

// 手のラベル（絵文字＋日本語）
const HAND_LABELS = {
  rock: '✊ グー',
  scissors: '✌️ チョキ',
  paper: '✋ パー',
}

// 勝敗判定：プレイヤーたちの手を比較して、勝者の手を返す
// 戻り値: 'rock' / 'scissors' / 'paper' (勝った手) or null (アイコ)
function getWinningHand(activePlayers, hands) {
  // 出た手の種類を集める
  const usedHands = new Set()
  activePlayers.forEach((_, i) => {
    usedHands.add(hands[i])
  })

  // 3種類全部出た or 全員同じ手 → アイコ
  if (usedHands.size !== 2) {
    return null
  }

  // 2種類だけ出た → 勝者を決める
  if (usedHands.has('rock') && usedHands.has('scissors')) return 'rock'
  if (usedHands.has('scissors') && usedHands.has('paper')) return 'scissors'
  if (usedHands.has('paper') && usedHands.has('rock')) return 'paper'
  return null
}

function Janken() {
  const { players, cart, setLoser, history, setHistory, setCart } = useContext(AppContext)
  const navigate = useNavigate()

  // ============================================
  // state 定義
  // ============================================
  const [phase, setPhase] = useState('handoff')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [hands, setHands] = useState(players.map(() => null))

  // このラウンドに参加中のプレイヤー（最初は全員）
  const [activePlayers, setActivePlayers] = useState(players)

  // 現在のラウンド数
  const [round, setRound] = useState(1)

  // カウントダウンの残り秒数
  const [countdown, setCountdown] = useState(3)

  // 結果（勝者・敗者の配列）
  const [winners, setWinners] = useState([])
  const [losers, setLosers] = useState([])

  // アイコフラグ
  const [isAiko, setIsAiko] = useState(false)

  // ============================================
  // 関数
  // ============================================

  // 「準備OK」を押した時
  const handleStartSelect = () => {
    setPhase('select')
  }

  // 手を選んだ時
  const selectHand = (hand) => {
    const newHands = [...hands]
    newHands[currentPlayerIndex] = hand
    setHands(newHands)

    if (currentPlayerIndex < activePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
      setPhase('handoff')
    } else {
      setPhase('countdown')
      setCountdown(3)
    }
  }

  // 次のラウンドへ
  const goToNextRound = () => {
    setActivePlayers(winners)                       // 勝者だけが次へ
    setHands(winners.map(() => null))               // 手をリセット
    setCurrentPlayerIndex(0)                         // 最初のプレイヤーから
    setRound(round + 1)
    setWinners([])
    setLosers([])
    setIsAiko(false)
    setPhase('handoff')
  }

  // アイコの場合：全員でやり直し
  const retryAiko = () => {
    setHands(activePlayers.map(() => null))
    setCurrentPlayerIndex(0)
    setIsAiko(false)
    setPhase('handoff')
  }

  // 結果画面（仮）へ
 const goToResult = () => {
  // 奢り役を Context に保存
  setLoser(losers[0])

  // 履歴に追加
  const newSession = {
    date: new Date().toISOString(),
    players: players,
    cart: cart,
    loser: losers[0],
    totalPrice: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
  }
  setHistory([newSession, ...history])

  // 結果画面へ遷移
  navigate('/result')
}

  // ============================================
  // カウントダウンの自動進行
  // ============================================
  useEffect(() => {
    if (phase !== 'countdown') return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // カウントダウン終了 → 勝敗判定
      const winningHand = getWinningHand(activePlayers, hands)

      if (winningHand === null) {
        // アイコ
        setIsAiko(true)
        setPhase('result')
      } else {
        // 勝者と敗者を分ける
        const newWinners = activePlayers.filter((_, i) => hands[i] === winningHand)
        const newLosers = activePlayers.filter((_, i) => hands[i] !== winningHand)
        setWinners(newWinners)
        setLosers(newLosers)
        setPhase('result')
      }
    }
  }, [phase, countdown])

  // ============================================
  // 現在のプレイヤー情報
  // ============================================
  const currentPlayer = activePlayers[currentPlayerIndex]

  // ============================================
  // JSX
  // ============================================
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">

      {/* 受け渡し画面 */}
      {phase === 'handoff' && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Round {round}</p>
          <div className="text-7xl mb-6">{currentPlayer.icon}</div>
          <h2 className="text-2xl font-medium mb-2">
            {currentPlayer.name || `Player ${currentPlayerIndex + 1}`} さん
          </h2>
          <p className="text-gray-400 mb-10">スマホを受け取ってね</p>
          <button
            onClick={handleStartSelect}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium"
          >
            準備OK
          </button>
        </div>
      )}

      {/* 手の選択画面 */}
      {phase === 'select' && (
        <div className="text-center w-full">
          <p className="text-sm text-gray-400 mb-2">
            {currentPlayer.name || `Player ${currentPlayerIndex + 1}`} さんの番
          </p>
          <h2 className="text-2xl font-medium mb-10">手を選んでね</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => selectHand('rock')}
              className="text-6xl bg-gray-800 rounded-2xl p-6"
            >
              ✊
            </button>
            <button
              onClick={() => selectHand('scissors')}
              className="text-6xl bg-gray-800 rounded-2xl p-6"
            >
              ✌️
            </button>
            <button
              onClick={() => selectHand('paper')}
              className="text-6xl bg-gray-800 rounded-2xl p-6"
            >
              ✋
            </button>
          </div>
        </div>
      )}

      {/* カウントダウン画面 */}
      {phase === 'countdown' && (
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-6">漢気ジャンケン！</h2>
          <p className="text-lg text-gray-400 mb-10">Let's Go!</p>
          <div className="text-9xl font-bold">
            {countdown > 0 ? countdown : '!'}
          </div>
        </div>
      )}

      {/* 結果画面 */}
      {phase === 'result' && (
        <div className="text-center w-full max-w-md">
          {isAiko ? (
            // アイコの場合
            <>
              <h2 className="text-3xl font-medium mb-4">アイコ！</h2>
              <p className="text-gray-400 mb-8">全員でもう一度やり直し</p>
              <div className="flex flex-col gap-2 mb-8">
                {activePlayers.map((player, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-2xl">{player.icon}</span>
                    <span className="flex-1 text-left">
                      {player.name || `Player ${i + 1}`}
                    </span>
                    <span className="text-sm text-gray-400">
                      {HAND_LABELS[hands[i]]}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={retryAiko}
                className="bg-white text-black px-8 py-3 rounded-lg font-medium"
              >
                もう一度
              </button>
            </>
          ) : winners.length === 1 ? (
            // 最終結果（奢り役決定）
            <>
              <h2 className="text-2xl text-gray-400 mb-2">奢り役は…</h2>
              <div className="text-7xl mb-4">{losers[0].icon}</div>
              <h1 className="text-3xl font-medium mb-8">
                {losers[0].name || `Player`} さん！
              </h1>
              <button
                onClick={goToResult}
                className="bg-white text-black px-8 py-3 rounded-lg font-medium"
              >
                次へ
              </button>
            </>
          ) : (
            // 通常の勝敗（次のラウンドへ）
            <>
              <h2 className="text-2xl font-medium mb-6">勝敗結果</h2>
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">勝者（次のラウンドへ）</p>
                <div className="flex flex-col gap-2">
                  {winners.map((player, i) => (
                    <div key={i} className="bg-green-900/50 rounded-lg p-3 flex items-center gap-3">
                      <span className="text-2xl">{player.icon}</span>
                      <span className="flex-1 text-left">
                        {player.name || `Player`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-xs text-gray-400 mb-2">敗者（脱落）</p>
                <div className="flex flex-col gap-2">
                  {losers.map((player, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3 opacity-50">
                      <span className="text-2xl">{player.icon}</span>
                      <span className="flex-1 text-left">
                        {player.name || `Player`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={goToNextRound}
                className="bg-white text-black px-8 py-3 rounded-lg font-medium"
              >
                次のラウンドへ
              </button>
            </>
          )}
        </div>
      )}

    </div>
  )
}

export default Janken
