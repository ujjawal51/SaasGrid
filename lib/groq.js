/**
 * High-Speed Groq AI Integration for SaaTerra.
 * Models available on current plan:
 *   - groq/compound        (most capable — best for chat & recommendations)
 *   - openai/gpt-oss-120b  (large GPT-class model)
 *   - openai/gpt-oss-20b   (fast, lightweight)
 *   - qwen/qwen3.6-27b     (multilingual — good for Hindi/English)
 */

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateGroqCompletion({
  messages = [],
  systemPrompt = '',
  model = 'groq/compound',
  temperature = 0.5,
  maxTokens = 1000,
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in .env.local');
  }

  const payloadMessages = [];

  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }

  if (Array.isArray(messages)) {
    messages.forEach((msg) => {
      payloadMessages.push({
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.text || '',
      });
    });
  }

  const response = await fetch(GROQ_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: payloadMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API error (${response.status})`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    text: choice?.message?.content || '',
    usage: data.usage,
    model: data.model,
  };
}
