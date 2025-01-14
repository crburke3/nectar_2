const AFFILIATE_CODE: string = "mt005-20";
let contentScriptReady: boolean = false;

// Last affiliate active activation
let lastAffiliateActive: number | null = null;



function log(message: string) {
  console.log(message)
  chrome.runtime.sendMessage({ text: message, type: 'log' });
}

function logNetwork(message: string) {
  chrome.runtime.sendMessage({ text: message, type: 'networkLog' });
}

function extractASIN(url: string): string | null {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

function checkPage(url: string){
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
          return asinElements.map((el) => {
            const asin = el.getAttribute('data-asin');
            const quantity = el.getAttribute('data-quantity');
            return { asin, quantity };
          });
        },
      }, (results) => {
        if (results && results[0]) {
          const items = results[0].result;
          if (items && items.length > 0) {
            items.forEach((item) => {
              log(`Found ASIN: ${item.asin} Quantity: ${item.quantity}`);
            })
          } else {
            log('No ASINs in cart found.');
          }
        }
      });
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo, _tab) => {
  if (changeInfo.url) {
    if (changeInfo.url && changeInfo.url.includes("amazon.com") && (changeInfo.url.includes("/dp/") || changeInfo.url.includes("/gp/product/"))){
      checkPage(changeInfo.url)
      console.log("\n=== Processing Product ===");

      if (lastAffiliateActive && Date.now() - lastAffiliateActive < 24 * 60 * 60 * 1000) {
          console.log("AFFILIATE: Active (last 24h)");
      } else {
          if (changeInfo.url && changeInfo.url.includes(AFFILIATE_CODE)) {
            console.log(`AFFILIATE: Found in URL, ${changeInfo.url} ${tabId}`);
              handleAffiliateActive(tabId);
          } else {
              handleAffiliateMissing(tabId, changeInfo.url || "");
              console.log("AFFILIATE: Inactive/Missing");
          }
      }
    }
  }
});


// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  // log(`received message: ${message.action}`)
  if (message.action === 'startPagePolling') {
    // startUrlPolling();
  }
  if (message.action === 'sidePanelOpened') {
    log('Side panel has been opened');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        checkPage(tab.url!)
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
        checkPage(tab.url); // Pass the current URL to handleNewUrl
        console.log("opening affiliate")
        handleAffiliateActive(tab.id!);
      }
    });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error)); 

// Listen for network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
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



// ----------------------------------------




// Listen for content script loaded message
chrome.runtime.onMessage.addListener((
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { received: boolean }) => void
) => {
    if (message.type === "CONTENT_SCRIPT_LOADED") {
        contentScriptReady = true;
        sendResponse({ received: true });
        console.log(contentScriptReady)
        return false;
    }
    if (message.type === "ACTIVATE_AFFILIATE") {
        // const AFFILIATE_CODE = "mt005-20";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const currentUrl = new URL(tabs[0].url!);
                const affiliateUrl = currentUrl.toString() + "&tag=" + AFFILIATE_CODE;
                console.log("Sending message to set affiliate URL:", affiliateUrl);
            }
        });

    }
});


// Helper functions for affiliate handling
function handleAffiliateActive(tabId: number): void {
    log(`handleAffiliateActive, ${tabId}`);
    lastAffiliateActive = Date.now();

    // Send a message to the content script to show the popup
    chrome.tabs.sendMessage(tabId, { type: "SHOW_AFFILIATE_POPUP", message: "Nectar is active! Enjoy 2% back on your purchase." }, (_response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
        }
    });
}

function handleAffiliateMissing(tabId: number, url: string): void {
    try {
        chrome.tabs.sendMessage(
            tabId,
            {
                type: "SHOW_AFFILIATE_POPUP",
                status: "missing",
                url: url,
            },
            (_response) => {
                if (chrome.runtime.lastError) {
                    console.log("Error sending missing message:", chrome.runtime.lastError);
                }
            }
        );
    } catch (error) {
        console.error("Error in handleAffiliateMissing:", error);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: "CONTENT_SCRIPT_LOADED" });
  }
});

