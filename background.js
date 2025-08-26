// Background script for LinkedIn Comment Generator
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open welcome page or set default settings
        console.log('LinkedIn Comment Generator installed successfully!');
        
        // Set default settings
        chrome.storage.sync.set({
            commentStyle: 'professional',
            commentLength: 'medium',
            customInstructions: ''
        });
    }
});

// Handle messages from content script if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateComment') {
        // Handle any background processing if needed
        sendResponse({ success: true });
    }
});

// Optional: Add context menu item
chrome.contextMenus.create({
    id: 'generateAIComment',
    title: 'Generate AI Comment',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.linkedin.com/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'generateAIComment') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'generateCommentFromSelection',
            selectedText: info.selectionText
        });
    }
});