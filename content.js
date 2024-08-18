function getTranscript() {
    return new Promise((resolve, reject) => {
        // Check if we're on a YouTube video page
        if (!window.location.pathname.startsWith('/watch')) {
            reject('Not a YouTube video page');
            return;
        }

        // Try to find the transcript button
        const transcriptButton = document.querySelector('button[aria-label="Show transcript"]');
        if (!transcriptButton) {
            reject('Transcript button not found');
            return;
        }

        // Click the transcript button to open the transcript panel
        transcriptButton.click();

        // Wait for the transcript to load
        setTimeout(() => {
            const transcriptElements = document.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
            if (transcriptElements.length === 0) {
                reject('Transcript not available');
                return;
            }

            // Extract the text from each transcript segment
            const transcriptText = Array.from(transcriptElements)
                .map(el => el.textContent.trim())
                .join('\n');

            resolve(transcriptText);
        }, 2000); // Adjust this timeout as needed
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getTranscript") {
        getTranscript()
            .then(transcript => sendResponse({success: true, transcript: transcript}))
            .catch(error => sendResponse({success: false, error: error}));
        return true; // Indicates that the response is asynchronous
    }
});