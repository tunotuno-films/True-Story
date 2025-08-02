import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// 不適切な単語をフィルタリングするライブラリ
import Filter from 'https://esm.sh/bad-words'

const filter = new Filter()

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    const message = record.message

    if (!message) {
      return new Response(JSON.stringify({ message: 'No message content' }), { status: 200 })
    }

    // メッセージが不適切でないかチェック
    const isClean = !filter.isProfane(message)

    if (isClean) {
      // 問題なければ、is_approvedをtrueに更新
      await supabaseClient
        .from('votes')
        .update({ is_approved: true })
        .eq('phone_number', record.phone_number) // 主キーでレコードを特定
    }

    return new Response(JSON.stringify({ moderated: isClean }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
