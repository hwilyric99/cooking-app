export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let messages;
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  const streamHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
  };

  if (OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': new URL(req.url).origin,
          'X-Title': 'AI Cooking Class',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v4-flash:free',
          messages,
          stream: true,
          max_tokens: 2048,
        }),
      });
      if (res.ok) return new Response(res.body, { headers: streamHeaders });
    } catch (_) {
      // fall through to OpenAI
    }
  }

  if (OPENAI_KEY) {
    const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        max_tokens: 2048,
      }),
    });
    if (res2.ok) return new Response(res2.body, { headers: streamHeaders });
    return new Response(JSON.stringify({ error: 'OpenAI 오류: ' + res2.status }), {
      status: res2.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'API 키가 Vercel 환경 변수에 설정되지 않았습니다.' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
