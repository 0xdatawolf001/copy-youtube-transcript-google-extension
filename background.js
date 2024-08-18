// Existing shortcut listener
chrome.commands.onCommand.addListener(function(command) {
    if (command === "copy-and-go") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "shortcutTriggered"});
        });
    }
});

// New listeners for tab updates and activations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
        chrome.runtime.sendMessage({action: "newYouTubeVideo", tabId: tabId});
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url && tab.url.includes('youtube.com/watch')) {
            chrome.runtime.sendMessage({action: "newYouTubeVideo", tabId: activeInfo.tabId});
        } else {
            chrome.runtime.sendMessage({action: "resetState"});
        }
    });
});