/**
 * Standalone background.js
 * Talks directly to Gemini API.
 */

async function refinePrompt(rawPrompt) {
  // Get key from storage
  const result = await chrome.storage.local.get(['gemini_api_key']);
  const apiKey = result.gemini_api_key;

  if (!apiKey) {
    throw new Error('Please set your Gemini API Key in the extension settings.');
  }

  // Updated to gemini-2.5-flash for better compatibility
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a world-class Prompt Engineer. 
          Task: Refine the following vague idea into a professional, highly detailed, and structured engineering prompt.
          
          User Idea: ${rawPrompt}
          
          Return ONLY the polished prompt text.`
        }]
      }]
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'Gemini API Error');
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini. Check your prompt or API key.');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'REFINE_PROMPT') {
    refinePrompt(request.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; 
  }
});
