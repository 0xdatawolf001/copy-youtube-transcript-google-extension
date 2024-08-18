chrome.commands.onCommand.addListener(function(command) {
    if (command === "copy-and-go") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "shortcutTriggered"});
        });
    }
});