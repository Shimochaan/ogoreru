// ============================================================
// Vercel Function: /api/jikkyo
// ------------------------------------------------------------
// このファイルは「サーバ側で動く」コード。ブラウザでは実行されない。
// 役割：フロントから受け取った試合情報を Anthropic API に投げて、
// 敗者煽りコメントを生成して返す。
// なぜサーバ経由か：(1) APIキーをブラウザに置きたくない、
// (2) ブラウザから直接 api.anthropic.com を叩くと CORS で弾かれる。
// ============================================================

export default async function handler(req, res) {
  // POST 以外は弾く（GET で叩かれてもやることがない）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 環境変数からAPIキーを取得。Vercelダッシュボードか .env.local に置いてある値が読まれる
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' })
  }

  // フロントから渡されたデータを取り出す（奢り役・カゴ・合計）
  const { loserName, cartItems, totalPrice } = req.body || {}

  // 必要な情報が来てないなら早めに失敗させる
  if (!loserName || !Array.isArray(cartItems) || typeof totalPrice !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  // カゴの中身を「唐揚げ弁当 × 3 (¥1,500)」みたいな読みやすい1行に整える
  const itemLines = cartItems
    .map((item) => `- ${item.name} × ${item.qty} (¥${(item.price * item.qty).toLocaleString()})`)
    .join('\n')

  // プロンプト本体。Claude へ送る指示。
  // ポイント：トーン、文字数、NGをきっちり指定して暴走させない
  const userPrompt = `あなたはじゃんけんアプリ「オコレル」の実況者です。
今回のお会計で「奢り役」になった人に向けて、ユーモアのある実況コメントを書いてください。

【奢り役】${loserName} さん
【カゴの中身】
${itemLines}
【合計】¥${totalPrice.toLocaleString()}

条件:
- 120字以内（厳守）
- 軽い煽りトーン。笑える範囲で。
- 人格攻撃・差別・下品な表現は禁止
- 商品名と合計金額は必ず含める
- 「お疲れ様でした」など労いも一言入れる
- コメント本文のみ返す。前置きや「以下が実況です:」のような枕詞は不要`

  try {
    // Anthropic API を叩く
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errText)
      return res.status(502).json({ error: 'Upstream API failed' })
    }

    const data = await anthropicResponse.json()

    // Anthropic のレスポンスは content: [{ type:'text', text:'...' }] の配列
    // 先頭の text を取り出してフロントに返す
    const commentary = data?.content?.[0]?.text?.trim() || ''

    if (!commentary) {
      return res.status(502).json({ error: 'Empty commentary' })
    }

    return res.status(200).json({ commentary })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
