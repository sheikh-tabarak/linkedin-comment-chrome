document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const commentStyleSelect = document.getElementById('commentStyle');
    const commentLengthSelect = document.getElementById('commentLength');
    const customInstructionsTextarea = document.getElementById('customInstructions');
    const extraInstructionsTextarea = document.getElementById('extraInstructions');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const statusDiv = document.getElementById('status');
    const availableApiDiv = document.querySelector('.available-api');

    // Load saved settings
    loadSettings();

    // Save API key
    saveApiKeyBtn.addEventListener('click', function () {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ 'geminiApiKey': apiKey }, function () {
                showStatus('API key saved successfully!', 'success');
                apiKeyInput.value = ''; // Clear the input for security
            });
        } else {
            showStatus('Please enter a valid API key', 'error');
        }
    });

    // Save all settings
    saveSettingsBtn.addEventListener('click', function () {
        const settings = {
            commentStyle: commentStyleSelect.value,
            commentLength: commentLengthSelect.value,
            customInstructions: customInstructionsTextarea.value.trim(),
            extraInstructions: extraInstructionsTextarea.value.trim()
        };

        chrome.storage.sync.set(settings, function () {
            showStatus('Settings saved successfully!', 'success');
        });
    });

    function loadSettings() {
        // Load comment settings
        chrome.storage.sync.get(['commentStyle', 'commentLength', 'customInstructions','extraInstructions','geminiApiKey'], function (result) {
            if (result.commentStyle) {
                commentStyleSelect.value = result.commentStyle;
            }
            if (result.commentLength) {
                commentLengthSelect.value = result.commentLength;
            }
            if (result.customInstructions) {
                customInstructionsTextarea.value = result.customInstructions;
            }
            if (result.extraInstructions) {
                extraInstructionsTextarea.value = result.extraInstructions;
            }

            if (result.geminiApiKey) {
                availableApiDiv.innerHTML = result.geminiApiKey;
            }
        });

        // Check if API key exists (don't load the actual key for security)
        chrome.storage.sync.get(['geminiApiKey'], function (result) {
            if (result.geminiApiKey) {
                apiKeyInput.placeholder = 'API key is saved';
            }
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 3000);
    }
});