import { useState } from "react"


function PlayerSetup() {


    const [players,setPlayers] = useState([
        {name:'',icon:'🐱'},
        { name: '', icon: '🐶' },
        { name: '', icon: '🐼' },
   ] )
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <button className="text-gray-700">← 戻る</button>
        <h2 className="text-xl font-medium ml-4">プレイヤー設定</h2>
      </div>

      {/* 人数調整エリア */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-3">参加人数を選んでね</p>
        <div className="flex items-center justify-center gap-5">
          <button onClick={() =>{if(players.length>2){setPlayers(players.slice(0,-1))}  }}  className="w-10 h-10 rounded-full border bg-white text-xl">−</button>
          <span className="text-3xl font-medium">{players.length}</span>
          <button  onClick={() => setPlayers([...players,{name:``,icon:'🐱'}])} className="w-10 h-10 rounded-full border bg-white text-xl">+</button>
        </div>
      </div>

{/* プレイヤーリスト */}
<div className="flex flex-col gap-2">
  {players.map((player, index) => (
    <div
      key={index}
      className="flex items-center gap-3 bg-white border rounded-lg p-3"
    >
      <button className="w-11 h-11 rounded-full bg-gray-100 border text-2xl">
        {player.icon}
      </button>
      <input
        type="text"
        placeholder={`player ${index + 1}`}
        value={player.name}
        onChange={(e)=>{
            const newPlayers = [...players]
            newPlayers[index].name = e.target.value
            setPlayers(newPlayers)
        }}
        className="flex-1 bg-transparent text-base outline-none"
      />
    </div>
  ))}
</div>




    </div>
  )
}

export default PlayerSetup
