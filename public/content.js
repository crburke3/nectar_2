// Function to log messages to the background script
function log(message) {
  chrome.runtime.sendMessage({ text: message });
}

// Function to add click listeners to all elements
function addClickListener() {
  document.addEventListener('click', (event) => {
    const target = event.target; // Get the clicked element
    if (target) {
      // Get all text content within the clicked element, including nested elements
      const allText = target.innerText || target.textContent; // Use innerText for better formatting
      console.log('Element clicked:', allText.trim()); // Log the text of the clicked element
      log(`Element clicked: ${allText.trim()}`); // Optionally, send a message to the background script
    }
  });
}

// Initial setup to add click listeners
addClickListener();
log('Content script listener initialized');