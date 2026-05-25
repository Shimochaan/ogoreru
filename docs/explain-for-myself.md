# オコレル × AI実況 — 1ヶ月後の自分への解説書

このドキュメントは「コードを書いた直後の俺」から「1ヶ月後の俺」への手紙です。
React は基礎、バックエンドは未経験、というレベルで読み返しても理解できるように書きました。

---

## 1. このアプリで何ができるようになったか（30秒で読める）

じゃんけんで奢り役が決まると、**Claude AI が「ご愁傷さま実況コメント」をその場で生成**して結果画面に表示するようになった。

- ビフォー：奢り役の名前と会計内容が出るだけ
- アフター：それに加えて「太郎さん、唐揚げ弁当3つで¥2,180、お疲れ様！」みたいな実況テキストが毎回違う文章で表示される

つまり「結果発表のオチ」を AI に毎回考えてもらえるようになった。

---

## 2. 全体の流れ（データの旅路）

ボタンを押してから実況が画面に出るまで、データが旅する順番:

```
[1] Janken.jsx で奢り役が確定
        ↓ navigate('/result')
[2] Result.jsx がマウント（画面表示）
        ↓ useEffect で fetch
[3] ブラウザ → /api/jikkyo (Vercel Function) へ POST
        ↓ サーバ側で APIキーを取り出してプロンプト組み立て
[4] Vercel Function → https://api.anthropic.com/v1/messages
        ↓ Anthropic がコメント生成
[5] Anthropic → Vercel Function （JSON で返却）
        ↓ 必要な text だけ抜き出す
[6] Vercel Function → ブラウザ （`{ commentary: "..." }`）
        ↓ setCommentary で state 更新
[7] Result.jsx が再描画して画面に実況テキスト表示
```

### なぜ Vercel Function を経由するのか？

理由は2つ:

**理由①: APIキーをブラウザに置きたくない**
APIキーは「お金を払ってAPIを使う権利の証明書」。ブラウザのJSに書くと、ユーザがF12を押して開発者ツールを開いた瞬間に丸見えになる。バレるとキーが悪用されてAnthropicの請求が爆発する。だからキーは**サーバ側にだけ置く**。Vercel Function はサーバなので、`process.env.ANTHROPIC_API_KEY` がブラウザに漏れない。

**理由②: CORS問題**
ブラウザは「自分が今いるドメイン以外のAPIを直接叩くと、勝手にブロックする」というセキュリティ機能（=CORS, Cross-Origin Resource Sharing）を持っている。`api.anthropic.com` は別ドメインだから、ブラウザから直接 fetch しても弾かれる。でも**自分のサーバ（同ドメインの `/api/jikkyo`）経由なら、ブラウザは怒らない**。サーバ同士の通信にはCORS制約がないので、Vercel Function から Anthropic へは普通に叩ける。

---

## 3. 触ったファイル一覧と、それぞれで何をしたか

### 新規作成

| ファイル | 役割 | 今回やったこと |
|---|---|---|
| `api/jikkyo.js` | Vercel Function（サーバ関数）。Anthropic API への中継役 | ファイル全部を新規で書いた |
| `.env.local` | APIキーを書く場所。git管理外 | `ANTHROPIC_API_KEY=...` を書いた |
| `.env.example` | キー名の見本（中身は空）。チームメイトや未来の自分が「あ、このキーが要るのね」と分かるためのファイル | キー名だけ書いた |
| `docs/explain-for-myself.md` | このファイル | 解説を書いた |

### 修正

| ファイル | 今回どこを足したか |
|---|---|
| `src/pages/Result.jsx` | `useEffect` で `/api/jikkyo` を叩く処理を追加。state を3つ（`commentary` / `isLoading` / `hasError`）追加。AI実況カードのJSXを追加 |
| `.gitignore` | `.env`、`.env.local`、`.env.*.local`、`.vercel` を明示的に追加（既存の `*.local` でもカバーされてたが、可読性のため明示） |

---

## 4. 重要コードの解説（1行ずつコメント形式）

### 4-1. 心臓部：`api/jikkyo.js` 全文

```js
// export default するとVercelが「これがエンドポイント関数だ」と認識してくれる
// async が付いてるのは、中で await（待つやつ）を使うから
export default async function handler(req, res) {

  // req は「ブラウザから来たリクエスト情報」、res は「ブラウザへ返事を書くための道具」
  // method はGET/POST/PUTなどの種類。今回は POST 以外は受け付けない（GET で叩かれてもやる仕事がない）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
    // ↑ 405 は「そのHTTPメソッド許してない」というステータスコード
  }

  // process.env は「環境変数の入った辞書」。.env.local や Vercel管理画面で設定した値が入る
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // キー未設定なら 500（サーバ側の設定ミス）を返して終了
    return res.status(500).json({ error: 'API key is not configured' })
  }

  // req.body はフロントから送られてきたデータ（JSON）。分割代入で必要な3項目を取り出す
  const { loserName, cartItems, totalPrice } = req.body || {}

  // バリデーション。フロントを信用しすぎないため、サーバ側でも形をチェックする
  if (!loserName || !Array.isArray(cartItems) || typeof totalPrice !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' })
    // ↑ 400 は「お前の送ってきたデータがおかしい」というステータスコード
  }

  // カゴの中身を「- 唐揚げ弁当 × 3 (¥1,500)」のような改行付き文字列に整形
  // map: 配列の各要素を加工して新しい配列を作る、join: それを文字列でつなぐ
  const itemLines = cartItems
    .map((item) => `- ${item.name} × ${item.qty} (¥${(item.price * item.qty).toLocaleString()})`)
    .join('\n')

  // Claude に渡すプロンプト（指示文）。トーンと制約をきっちり書いて暴走させない
  const userPrompt = `あなたはじゃんけんアプリ「オコレル」の実況者です。
今回のお会計で「奢り役」になった人に向けて、ユーモアのある実況コメントを書いてください。
...（中略：実際のプロンプト本文はファイル参照）...`

  try {
    // fetch は「URLにHTTPリクエストを送る」JavaScript標準の関数
    // await は「fetch が終わるまで待つ」マーク（async/await 構文）
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      // ↑ Anthropic API は POST しか受け付けない
      headers: {
        'content-type': 'application/json',
        // ↑ 送るデータが JSON 形式だよ、と先方に伝えるヘッダ
        'x-api-key': apiKey,
        // ↑ APIキーをここで渡す。ブラウザに見せたくないのでサーバ側でだけ付ける
        'anthropic-version': '2023-06-01',
        // ↑ Anthropic APIのバージョン指定。固定値でOK
      },
      body: JSON.stringify({
        // ↑ JS のオブジェクトを「JSON文字列」に変換して送る
        model: 'claude-sonnet-4-6',
        // ↑ 使うモデルの名前。Sonnet 4.6 = 賢さと速度のバランス型
        max_tokens: 300,
        // ↑ 返答の上限トークン数（=単語の細切れの数）。多すぎても無駄なのでケチる
        messages: [{ role: 'user', content: userPrompt }],
        // ↑ Anthropic は「会話の履歴」を配列で渡す形式。今回は1ターンだけ
      }),
    })

    // response.ok は「2xx番台ステータスが返ってきたか」のショートカット
    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errText)
      // ↑ Vercel のログに出る。デバッグ用
      return res.status(502).json({ error: 'Upstream API failed' })
      // ↑ 502 は「上流のAPIがコケた」を意味するステータスコード
    }

    // .json() でレスポンスボディを JS オブジェクトに変換
    const data = await anthropicResponse.json()

    // Anthropic のレスポンス構造は { content: [{ type:'text', text:'...' }] }
    // ?. はオプショナルチェーン：途中で undefined になっても落ちない
    const commentary = data?.content?.[0]?.text?.trim() || ''

    if (!commentary) {
      return res.status(502).json({ error: 'Empty commentary' })
    }

    // 200 = 成功。フロントには { commentary: "..." } というJSONだけ返す
    return res.status(200).json({ commentary })
  } catch (err) {
    // try の中で例外が出たらここに飛ぶ（fetch自体が失敗したケースなど）
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
```

### 4-2. フロント側：`Result.jsx` の fetch 部分

```jsx
// useState で3つの state を作る。これが画面に映る「いまの状態」
const [commentary, setCommentary] = useState('')      // 生成されたテキスト
const [isLoading, setIsLoading] = useState(true)      // ロード中か（最初はtrue）
const [hasError, setHasError] = useState(false)       // エラー発生したか

// useEffect: 「画面がマウントされた時／指定の値が変わった時」に実行されるフック
useEffect(() => {
  if (!loser) {
    setIsLoading(false)
    return
    // ↑ 直接 /result にアクセスされた等で奢り役が無い場合は何もしないで終了
  }

  // useEffect の第1引数に直接 async function は渡せない（React の仕様）
  // → 中に async 関数を作って即呼ぶパターンを使う
  const fetchCommentary = async () => {
    try {
      const response = await fetch('/api/jikkyo', {
        // ↑ 「同じドメインの /api/jikkyo」を叩く。ローカルなら vercel dev の差配で動く
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          loserName: loser.name || 'Player',
          cartItems: cart.map((item) => ({
            name: item.name,
            price: item.price,
            qty: item.qty,
          })),
          // ↑ サーバ側で必要な3項目だけ抜き出して送る。emoji 等の余計なフィールドは渡さない
          totalPrice,
        }),
      })

      if (!response.ok) {
        throw new Error(`status ${response.status}`)
        // ↑ 200 番台以外なら自分でエラーを投げて catch に飛ばす
      }

      const data = await response.json()
      if (!data.commentary) {
        throw new Error('empty commentary')
      }
      setCommentary(data.commentary)
      // ↑ 成功。state を更新するとReactが画面を勝手に再描画してくれる
    } catch (err) {
      console.error('jikkyo fetch failed:', err)
      setHasError(true)
      setCommentary(FALLBACK_COMMENTARY)
      // ↑ 失敗時はフォールバック文言を表示。アプリ全体が落ちないようにする
    } finally {
      setIsLoading(false)
      // ↑ 成功でも失敗でもローディングは終わるので finally で切る
    }
  }

  fetchCommentary()
}, [loser, cart, totalPrice])
// ↑ 依存配列。これらが変わった時に再実行される。
//    奢り役が決まった後はこれらの値が変わらないので、実質マウント時1回しか走らない
```

### 「ここが分かれば全部分かる」ポイント

**この2つだけ理解すれば全部追える:**

1. **`/api/jikkyo.js` の `fetch('https://api.anthropic.com/v1/messages', ...)`**
   → サーバ側で Anthropic を叩いてる本体。ここを読めば「実況がどう生成されるか」が分かる。

2. **`Result.jsx` の `useEffect` 内 `fetch('/api/jikkyo', ...)`**
   → ブラウザから自分のサーバ関数を叩く部分。ここを読めば「どのタイミングで何を送ってるか」が分かる。

---

## 5. 新しく出てきた技術用語ミニ辞書

このアプリで実際に使った用語に絞って解説。

- **APIキー**: Anthropic の有料サービスを使う際の「会員証」。これがあれば誰でも俺の財布から課金できるので絶対にネットに公開しない。
- **環境変数**: コードに直書きしたくない秘密情報を、外から渡す仕組み。ローカルでは `.env.local`、Vercel本番ではダッシュボードで設定。`process.env.ANTHROPIC_API_KEY` で読む。
- **Vercel Functions**: Vercel が用意してくれる「小さなサーバ関数」の仕組み。`api/*.js` を置くだけで自動的にデプロイされ、`https://(俺のドメイン)/api/jikkyo` で叩けるようになる。
- **CORS**: ブラウザの安全装置で「別ドメインのAPIを直接叩くな」と止めるルール。自前サーバ経由なら関係ない。
- **fetch**: ブラウザ／Node.js 標準の「HTTPリクエストを送る関数」。URLとオプションを渡すと Promise を返す。
- **Promise**: 「いつか結果が返ってくる約束」。例: `fetch()` を呼んでも結果は即時には返らず、Promise が返る。
- **async / await**: Promise を「あたかも普通の同期処理のように」書ける糖衣構文。`await fetch(...)` で fetch が終わるまで待ち、戻り値を受け取れる。
- **JSON**: `{"key": "value"}` 形式のデータの書式。サーバとフロント間でデータを送るときの共通言語。`JSON.stringify()` でJS→JSON、`response.json()` でJSON→JS。
- **リクエスト / レスポンス**: ブラウザがサーバに送るのがリクエスト、サーバが返すのがレスポンス。両方とも「ヘッダ + ボディ」で構成。
- **ヘッダ**: リクエスト／レスポンスの「メタ情報」。`content-type: application/json`（中身はJSONです）や `x-api-key: ...`（認証用のキー）など。
- **ステータスコード**: レスポンスの結果を示す3桁の番号。200=成功、400=お前のリクエストが変、401=認証失敗、404=見つからない、500=サーバが死んだ、502=上流APIが死んだ。
- **プロンプト**: AIに渡す指示文。今回は「敗者にユーモアあるコメントを120字以内で」みたいなテキスト。
- **トークン**: AIが文字を扱う最小単位（≒数文字や単語の細切れ）。`max_tokens: 300` で「返答は300トークンまで」と制限してる。日本語だと300トークンで大体200〜300字くらい。
- **useEffect**: React のフック。コンポーネントがマウントされた時や、指定値が変わった時に副作用（fetch、タイマー、購読など）を走らせる。
- **useState**: React のフック。「画面に映る状態」を持つ箱を作る。`setXxx` で更新すると Reactが自動で再描画してくれる。

---

## 6. ハマりやすいポイント（未来の俺への手紙）

実装中・本番運用で踏みうる罠を列挙。バグった時はまずここを疑え。

1. **`.env.local` を変更しても `npm run dev` を再起動しないと反映されない**
   Vite は起動時にしか `.env.local` を読まない。「キー入れたのにエラーが出る」ときはサーバ再起動。

2. **`VITE_` プレフィックスを付けると即漏洩**
   `VITE_ANTHROPIC_API_KEY` みたいに `VITE_` を付けると、Vite が「これはフロントに含めていい変数だ」と判断してビルドに埋め込んでしまう。**絶対に付けるな**。

3. **Vercel の環境変数を追加・変更したら再デプロイ必須**
   Vercel ダッシュボードで環境変数を更新しても、既存のデプロイには反映されない。Deployments → 最新のデプロイ → Redeploy を押す（または `git push` で再デプロイ）。

4. **`npm run dev`（Vite単体）では `/api/jikkyo` が動かない**
   Vite は静的フロントを配信するだけで、サーバ関数は動かさない。ローカルで実況を動かすには `vercel dev` を使うこと。`vercel dev` をしないと `/api/jikkyo` は 404 になり、`hasError` が true になってフォールバック文言が出る。

5. **`vercel dev` 初回は `vercel link` でプロジェクト紐付けが要る**
   ターミナルが対話で聞いてくるので、矢印キーで選ぶ。1回設定すれば `.vercel/` フォルダができて以降は不要。

6. **モデル名のタイポ**
   `claude-sonnet-4-6` を `claude-sonnet-4.6` などと間違えると 404 が返る。`api/jikkyo.js` の `model:` を確認。

7. **`content` の取り出し方を間違えがち**
   Anthropic のレスポンスは `data.content[0].text` の場所にテキストが入っている。`data.text` や `data.message` ではない。

8. **Vercel Function はリージョン・コールドスタートの影響で初回数秒かかることがある**
   初回起動時に「実況を考えています…」が長めに出るのは正常。

9. **Vercel の Free プランは Function 実行時間に上限あり**
   `claude-sonnet-4-6` でも数秒で返るので通常は問題ないが、`opus` 系に変えるなら注意。

---

## 7. 自分で改造するなら？（次の一歩）

簡単な順に。

### Lv.1 — トーン変更（5分）
`api/jikkyo.js` の `userPrompt` を書き換える。「軽い煽り」→「優しい褒め」「関西弁の説教」「ナレーター風」など。プロンプトの「条件」部分の文言を変えるだけ。

### Lv.2 — フォールバック文言の差し替え（3分）
`Result.jsx` の `FALLBACK_COMMENTARY` 定数を変える。

### Lv.3 — モデルを切り替える（5分）
`api/jikkyo.js` の `model:` を `claude-haiku-4-5-20251001` に変えると、早くて安いHaikuに切り替わる。費用節約用。

### Lv.4 — 履歴画面でもAI実況を残す（30分）
`Janken.jsx` の `goToResult` で履歴を作る時、最初は `commentary: null` で保存しておく。Result.jsx でフェッチ成功後に `setHistory` で該当セッションを更新（idで紐付け）。`History.jsx` で `commentary` があれば表示。

### Lv.5 — AI呼び出しを別ファイル化（45分）
他のページからもAI機能を使うなら、`src/lib/jikkyo.js` のような汎用関数を作って `fetchJikkyo(payload)` で再利用可能に。Result.jsx の fetch ブロックをそこに移して `await fetchJikkyo({...})` だけ呼ぶ形に。

### Lv.6 — 結果を画像化してシェア（数時間）
`html2canvas` や Vercel OG Image で結果カードを画像にして、Twitter/LINE シェアできるようにする。バズり要素。

---

## 8. もし全部忘れて 1ヶ月後にこのコードを見たら？

**30秒思い出し用 要点メモ:**

- 実況機能は **2ファイルしか触ってない**: `api/jikkyo.js`（サーバ）と `src/pages/Result.jsx`（フロント）
- フロントは `useEffect` で `/api/jikkyo` を POST → state にセット → 表示
- サーバは `req.body` を組んで Anthropic に投げ、返ってきた `data.content[0].text` をフロントに返すだけ
- APIキーは `.env.local`（ローカル）と Vercel ダッシュボード（本番）の2箇所に登録が要る
- ローカル動作確認は `vercel dev`。Vite単体（`npm run dev`）では `/api` が動かない

**最初に開くファイル:**
1. `api/jikkyo.js` — サーバ処理の全部
2. `src/pages/Result.jsx` の `useEffect` ブロック — フロントの呼び出し処理

この2つを5分眺めれば、なぜどう動いているか全部思い出せる。
