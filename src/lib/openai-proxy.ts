// Utility for making requests to the backend OpenAI proxy
export async function fetchOpenAI(prompt, options = {}) {
  const response = await fetch('http://localhost:3001/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, ...options }),
  });
  if (!response.ok) throw new Error('OpenAI proxy error');
  return response.json();
}
