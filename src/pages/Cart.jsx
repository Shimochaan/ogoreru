import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

function Cart() {
  const { cart, setCart } = useContext(AppContext)
  const navigate = useNavigate()

  // 合計金額の計算（Shop.jsxと同じ）
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const increaseQty = (index) => {
  const newCart = cart.map((item, i) =>
    i === index
      ? { ...item, qty: item.qty + 1 }
      : item
  )
  setCart(newCart)
}

const decreaseQty = (index) => {
  if (cart[index].qty === 1) {
    // qty が 1 の場合は、その商品を削除
    const newCart = cart.filter((item, i) => i !== index)
    setCart(newCart)
  } else {
    // qty が 2 以上なら、qty を -1
    const newCart = cart.map((item, i) =>
      i === index
        ? { ...item, qty: item.qty - 1 }
        : item
    )
    setCart(newCart)
  }
}

  return (
  <div className="min-h-screen bg-gray-100 p-4 pb-32">

  {/* ヘッダー */}
  <div className="flex items-center mb-4">
  <button onClick={() => navigate("/shop")} className="text-gray-700">← 戻る</button>
  <h2 className="text-xl font-medium ml-4 flex-1">お会計の確認</h2>
  <button
    onClick={() => setCart([])}
    className="text-xs text-red-500"
  >
    全クリア
  </button>
</div>

  {/* カゴリスト */}
  <div className="flex flex-col gap-2">
    {cart.map((item, index) => (
      <div key={index} className="bg-white border rounded-lg p-3 flex items-center gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div className="flex-1">
          <div className="text-sm">{item.name}</div>
          <div className="text-xs text-gray-500">¥{item.price} × {item.qty}</div>
        </div>

<div className="flex items-center gap-2">
      <button
        onClick={() => decreaseQty(index)}
        className="w-7 h-7 rounded-full border bg-white text-sm"
      >−</button>
      <span className="text-sm font-medium min-w-[20px] text-center">{item.qty}</span>
      <button
        onClick={() => increaseQty(index)}
        className="w-7 h-7 rounded-full border bg-white text-sm"
      >+</button>
    </div>

    <div className="text-base font-medium min-w-[60px] text-right">
      ¥{(item.price * item.qty).toLocaleString()}
    </div>
  </div>


    ))}
  </div>

  {/* 下部の合計エリア */}
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm text-gray-600">合計</span>
      <span className="text-2xl font-medium">¥{totalPrice.toLocaleString()}</span>
    </div>
    <button onClick={()=> navigate("/janken")} className="w-full bg-gray-900 text-white rounded-lg font-medium py-3">
      男気じゃんけんでお会計！
    </button>
  </div>

</div>
  )
}

export default Cart
