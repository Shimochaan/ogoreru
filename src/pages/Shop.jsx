
import { useState } from "react"
import { useNavigate } from "react-router-dom"


// 商品データ（ファイル先頭、function の外に書く）
const PRODUCTS = [
  { emoji: '🍙', name: 'おにぎり鮭', price: 150 },
  { emoji: '🍱', name: '唐揚げ弁当', price: 550 },
  { emoji: '🍣', name: 'お寿司パック', price: 680 },
  { emoji: '🥪', name: 'サンドイッチ', price: 320 },
  { emoji: '🍜', name: 'カップ麺', price: 220 },
  { emoji: '🍞', name: 'メロンパン', price: 160 },
  { emoji: '🍗', name: 'からあげ棒', price: 130 },
  { emoji: '🍢', name: 'おでん盛り', price: 480 },
  { emoji: '🥟', name: '肉まん', price: 150 },
  { emoji: '🍰', name: 'ショートケーキ', price: 380 },
  { emoji: '🍫', name: 'チョコレート', price: 220 },
  { emoji: '🍪', name: 'クッキー', price: 180 },
  { emoji: '🍿', name: 'ポップコーン', price: 200 },
  { emoji: '🥤', name: 'コーラ', price: 160 },
  { emoji: '☕', name: 'ホットコーヒー', price: 120 },
  { emoji: '🍵', name: '緑茶ペットボトル', price: 140 },
  { emoji: '🧃', name: 'オレンジジュース', price: 150 },
  { emoji: '🍺', name: 'ビール缶', price: 230 },
  { emoji: '🍷', name: 'ワイン', price: 880 },
  { emoji: '🍡', name: '団子', price: 180 },
]


function Shop() {

const [cart,setCart] = useState([])
const navigate = useNavigate()

const addToCart = (product) => {
  const existingItem = cart.find(item => item.name === product.name)

  if(existingItem) {
    const newCart = cart.map(item =>
      item.name === product.name
      ?{...item,qty:item.qty+1}
      : item
    )
    setCart(newCart)
  }else{setCart([...cart,{...product,qty:1}])
  }
  console.log('Cart updated:', product.name)
}

// 合計点数（全商品の qty を合計）
const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)

// 合計金額（全商品の price × qty を合計）
const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
   <div className="min-h-screen bg-gray-100 p-4 pb-20">

{/*ヘッダー*/}
<div className="mb-4">
  <h2 className="text-xl font-medium">いらっしゃいませ</h2>
</div>

{/*商品のグリッド*/}
<div className="grid grid-cols-2 gap-2">
  {PRODUCTS.map((product,index)=>(
    <div key={index} onClick={()=>addToCart(product)}  className="bg-white border rounded-lg p-3 text-center"><div className="text-4xl mb-1">{product.emoji}</div>
            <div className="text-sm mb-1">{product.name}</div>
            <div className="text-sm font-medium">¥{product.price}</div>
            </div>
  ))}
</div>
{/* 画面下のカゴバー */}


<div onClick={()=>navigate("/cart")}
className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center gap-3">
  <span className="text-lg">🛒 {totalQty}点</span>
  <span className="flex-1">カゴを見る</span>
  <span className="text-lg font-medium">¥{totalPrice.toLocaleString()}</span>
</div>





   </div>


  )
}

export default Shop
