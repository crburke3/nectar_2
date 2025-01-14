console.log("content.js loaded");
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });
let affiliateFrame = null;

window.addEventListener('message', function(event) {
    console.log("content.js received message:", event);
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    if (message.type === "SHOW_AFFILIATE_POPUP") {
        showAffiliatePopup(message.message);
        sendResponse({ received: true });
    }
    if (message.type === "CONTENT_SCRIPT_LOADED") {
        console.log("Content script is ready.");
        sendResponse({ received: true });
    }
});

// Function to create and show the affiliate popup
function showAffiliatePopup(message) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '10px';
    popup.style.right = '10px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '2px solid #007bff';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.padding = '20px';
    popup.style.zIndex = '10000'; // Ensure it appears above other content
    popup.innerText = message;

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        document.body.removeChild(popup); // Remove the popup when closed
    };

    popup.appendChild(closeButton);
    document.body.appendChild(popup);

    // Automatically remove the popup after a certain time (optional)
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, 5000); // Remove after 5 seconds
}

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "Hello from app.tsx") {
        console.log("Message received in content.js");
        sendResponse({ response: "Hello from content.js" });
    }
});