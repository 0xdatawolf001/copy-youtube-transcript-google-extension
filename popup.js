document.addEventListener('DOMContentLoaded', function() {
    const transcriptArea = document.getElementById('transcript');
    const copyButton = document.getElementById('copyButton');
    const copyAndGoButton = document.getElementById('copyAndGoButton');
    const statusMessage = document.getElementById('statusMessage');
    const llmLinkInput = document.getElementById('llmLink');
    const prefixInput = document.getElementById('prefixInput');

    transcriptArea.value = '';
    updateUI(false, "Waiting for transcript...");

    // Load saved LLM link and prefix
    chrome.storage.sync.get(['llmLink', 'prefix'], function(data) {
        if (data.llmLink) {
            llmLinkInput.value = data.llmLink;
        }
        if (data.prefix) {
            prefixInput.value = data.prefix;
        }
    });

    let activeTabId;

    function updateUI(isSuccess, message, transcriptText = '') {
        statusMessage.textContent = message;
        transcriptArea.value = transcriptText;
        copyButton.disabled = !isSuccess;
        copyAndGoButton.disabled = !isSuccess;
    }

    function fetchTranscript(tabId) {
        chrome.tabs.sendMessage(tabId, {action: "getTranscript"}, function(response) {
            if (chrome.runtime.lastError) {
                updateUI(false, "Error: " + chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                updateUI(true, "Transcript extracted successfully!", response.transcript);
            } else {
                updateUI(false, getErrorMessage(response.error));
            }
        });
    }

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "newYouTubeVideo") {
            activeTabId = message.tabId;
            transcriptArea.value = '';
            updateUI(false, "Fetching new transcript...");
            fetchTranscript(activeTabId);
        } else if (message.action === "resetState") {
            transcriptArea.value = '';
            updateUI(false, "Ready to fetch transcript");
        }
    });

    // Initial setup when popup opens
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        activeTabId = tabs[0].id;
        if (tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
            fetchTranscript(activeTabId);
        } else {
            updateUI(false, "Navigate to a YouTube video to use this extension");
        }
    });

    copyButton.addEventListener('click', function() {
        copyTranscript().then(() => {
            updateUI(true, 'Transcript copied to clipboard!', transcriptArea.value);
        }).catch((err) => {
            updateUI(true, 'Failed to copy: ' + err, transcriptArea.value);
        });
    });

    copyAndGoButton.addEventListener('click', function() {
        copyTranscript().then(() => {
            updateUI(true, 'Transcript copied to clipboard!', transcriptArea.value);
            goToLLMPage();
        }).catch((err) => {
            updateUI(true, 'Failed to copy: ' + err, transcriptArea.value);
        });
    });

    // Save LLM link when it changes
    llmLinkInput.addEventListener('change', function() {
        chrome.storage.sync.set({llmLink: llmLinkInput.value}, function() {
            console.log('LLM link saved');
        });
    });

    // Save prefix when it changes
    prefixInput.addEventListener('change', function() {
        chrome.storage.sync.set({prefix: prefixInput.value}, function() {
            console.log('Prefix saved');
        });
    });
});