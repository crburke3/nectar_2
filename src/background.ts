function log(message: string) {
  chrome.runtime.sendMessage({ text: message, type: 'log' });
}

function logNetwork(message: string) {
  chrome.runtime.sendMessage({ text: message, type: 'networkLog' });
}

function extractASIN(url: string): string | null {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

function handleNewUrl(url: string){
  log(`New URL: ${url}`);
  const asin = extractASIN(url);
  if (asin) {
    log(`Extracted ASIN: ${asin}`);
  }
  if (url.includes("/cart")) {
    handleCartView();
  }
  if (url.includes("/checkout")) {
    handleCheckoutView();
  }
}

function handleCheckoutView() {
  log("on checkout view");
  
}

function handleCartView() {
  log("on cart view");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const asinElements = Array.from(document.querySelectorAll('div[data-asin]'));
          return asinElements.map((el) => el.getAttribute('data-asin'));
        },
      }, (results) => {
        if (results && results[0]) {
          const asins = results[0].result;
          if (asins && asins.length > 0) {
            log(`Found ASINs in cart: ${asins.join(', ')}`);
          } else {
            log('No ASINs in cart found.');
          }
        }
      });
    }
  });
}

chrome.tabs.onUpdated.addListener((_, changeInfo, _tab) => {
  if (changeInfo.url) {
    handleNewUrl(changeInfo.url)
  }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === 'sidePanelOpened') {
    log('Side panel has been opened');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        handleNewUrl(tab.url!)
      }
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === 'checkoutButtonClicked') {
    log('Proceed to Checkout button was clicked');
  } else if (message.action === 'clearLogs') {
    log('Logs cleared');
  } else if (message.action === 'triggerHandleNewUrl') {
    // Call handleNewUrl with the current URL of the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url) {
        handleNewUrl(tab.url); // Pass the current URL to handleNewUrl
      }
    });
  }
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error)); 

// Listen for network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log(details)
    const addToCardIds = [
      'add-to-cart',
      "addItemsToCart"
    ]
    for (const id of addToCardIds) {
      if (details.url.includes(id)) {
      logNetwork(`Add to card request: ${id}`);
      }
    }

    const updateQuantityIds = [
      'update_quantity'
    ]
    for (const id of updateQuantityIds) {
      if (details.url.includes(id)) {
      logNetwork(`Updated Quantity: ${id}`);
      }
    }

  },
  { urls: ["<all_urls>"] } // Adjust this to match the specific URLs you want to monitor
); 