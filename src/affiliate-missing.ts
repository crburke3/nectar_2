// // Add an event listener for messages from other windows
// chrome.runtime.onMessage.addListener((
//     message: { type: string, affiliateUrl: string },
//     _sender: chrome.runtime.MessageSender,
//     sendResponse: (response: { received: boolean }) => void
// ) => {
//     if (message.type === "SET_AFFILIATE_URL") {
//         console.log("affiliate missing Received message:", event);
//         const activateLink = document.getElementById('activate-link') as HTMLAnchorElement | null;
//         if (activateLink) {
//             activateLink.href = message.affiliateUrl;
//             activateLink.target = "_parent";
//             sendResponse({ received: true });
//         }
//     }
// });




document.getElementById('activate-link')!.addEventListener('click', () => {
    console.log("Activating affiliate clicked");
    window.parent.postMessage({ type: "ACTIVATE_AFFILIATE" }, "*");
    // chrome.runtime.sendMessage({ type: "ACTIVATE_AFFILIATE" });
});