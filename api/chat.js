export const config = { runtime: 'edge' };

const FREE_MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
];

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

  // 1단계: 무료 모델 순서대로 시도
  if (OPENROUTER_KEY) {
    for (const model of FREE_MODELS) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': new URL(req.url).origin,
          'X-Title': 'AI Cooking Class',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: 2048 }),
      });
      if (res.ok) return new Response(res.body, { headers: streamHeaders });
      if (res.status !== 429 && res.status !== 404) break;
    }
  }

  // 2단계: OpenAI 폴백
  if (OPENAI_KEY) {
    const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, stream: true, max_tokens: 2048 }),
    });
    if (res2.ok) return new Response(res2.body, { headers: streamHeaders });
    const err2 = await res2.text();
    return new Response(JSON.stringify({ error: 'OpenAI 오류: ' + res2.status + ' ' + err2 }), {
      status: res2.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: '잔시 후 다시 시도해주세요.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}
