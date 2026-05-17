import { useState } from "react"
import { useNavigate } from "react-router-dom"

// 動物絵文字のリスト
const ANIMAL_ICONS = ['🐱','🐶','🐼','🦁','🐯','🐰','🦊','🐻','🐨','🐮','🐷','🐸','🐵','🐔','🐧','🦉','🐺','🦄','🐴','🦝','🐹','🐭']

function PlayerSetup() {

const navigate = useNavigate()


  const [players, setPlayers] = useState([
    { name: '', icon: '🐱' },
    { name: '', icon: '🐶' },
    { name: '', icon: '🐼' },
  ])

  // 「今どのプレイヤーのアイコンを編集中か」を表すstate
  // null = モーダル非表示、数値 = そのindexのプレイヤーを編集中
  const [editingIconIndex, setEditingIconIndex] = useState(null)

  // アイコン選択時の処理
  const handleSelectIcon = (icon) => {
    const newPlayers = [...players]
    newPlayers[editingIconIndex].icon = icon
    setPlayers(newPlayers)
    setEditingIconIndex(null)  // モーダルを閉じる
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <button onClick= {()=> navigate("/")}  className="text-gray-700">← 戻る</button>
        <h2 className="text-xl font-medium ml-4">プレイヤー設定</h2>
      </div>

      {/* 人数調整エリア */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-3">参加人数を選んでね</p>
        <div className="flex items-center justify-center gap-5">
          <button onClick={() => { if (players.length > 2) { setPlayers(players.slice(0, -1)) } }} className="w-10 h-10 rounded-full border bg-white text-xl">−</button>
          <span className="text-3xl font-medium">{players.length}</span>
          <button onClick={() => setPlayers([...players, { name: '', icon: '🐱' }])} className="w-10 h-10 rounded-full border bg-white text-xl">+</button>
        </div>
      </div>

      {/* プレイヤーリスト */}
      <div className="flex flex-col gap-2">
        {players.map((player, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white border rounded-lg p-3"
          >
            <button
              onClick={() => setEditingIconIndex(index)}
              className="w-11 h-11 rounded-full bg-gray-100 border text-2xl"
            >
              {player.icon}
            </button>
            <input
              type="text"
              placeholder={`Player ${index + 1}`}
              value={player.name}
              onChange={(e) => {
                const newPlayers = [...players]
                newPlayers[index].name = e.target.value
                setPlayers(newPlayers)
              }}
              className="flex-1 bg-transparent text-base outline-none"
            />
          </div>
        ))}
      </div>

      <button onClick={()=> navigate("/shop")}className="w-full bg-gray-900 text-white rounded-lg font-medium mt-5 py-3">買い物へLet's Go!!!</button>

      {/* アイコン選択モーダル（editingIconIndex が null じゃない時だけ表示） */}
      {editingIconIndex !== null && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-10"
          onClick={() => setEditingIconIndex(null)}
        >
          <div
            className="bg-white rounded-lg p-5 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-sm font-medium mb-3">アイコンを選ぶ</p>
            <div className="grid grid-cols-5 gap-2">
              {ANIMAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleSelectIcon(icon)}
                  className="aspect-square rounded-lg border bg-gray-50 text-2xl"
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              onClick={() => setEditingIconIndex(null)}
              className="w-full h-9 bg-gray-100 rounded mt-4 text-sm"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default PlayerSetup
