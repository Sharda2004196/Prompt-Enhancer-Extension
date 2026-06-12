document.addEventListener('DOMContentLoaded', () => {
  const inputArea = document.getElementById('prompt-input');
  const polishButton = document.getElementById('polish-btn');
  const outputContainer = document.getElementById('output-container');
  const settingsPanel = document.getElementById('settings-panel');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const toggleSettings = document.getElementById('toggle-settings');

  // Load existing key if any
  chrome.storage.local.get(['gemini_api_key'], (result) => {
    if (result.gemini_api_key) {
      apiKeyInput.value = result.gemini_api_key;
    }
  });

  toggleSettings.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
  });

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      chrome.storage.local.set({ 'gemini_api_key': key }, () => {
        alert('API Key saved successfully!');
        settingsPanel.style.display = 'none';
      });
    }
  });

  polishButton.addEventListener('click', async () => {
    const rawText = inputArea.value.trim();
    if (!rawText) return;

    polishButton.disabled = true;
    outputContainer.style.display = 'block';
    outputContainer.textContent = 'Polishing via Gemini...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'REFINE_PROMPT',
        payload: rawText
      });

      if (response && response.success) {
        outputContainer.textContent = response.data;
      } else {
        outputContainer.textContent = 'Error: ' + (response.error || 'Failed to polish.');
      }
    } catch (err) {
      outputContainer.textContent = 'Connection Error: Ensure the extension is reloaded and key is set.';
    } finally {
      polishButton.disabled = false;
    }
  });
});
