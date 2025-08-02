// Utility for making requests to the backend Hugging Face proxy
export async function fetchHuggingFace(prompt, model = 'gpt2') {
  const response = await fetch('http://localhost:3001/huggingface', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });
  if (!response.ok) throw new Error('Hugging Face proxy error');
  return response.json();
}
