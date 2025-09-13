/**
 * WhatsIt Popup JavaScript
 * Handles user interactions and communication with content scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const analyzePageBtn = document.getElementById('analyze-page');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  const summarizeSelectionBtn = document.getElementById('summarize-selection');
  const rewriteSelectionBtn = document.getElementById('rewrite-selection');
  const analyzeImageBtn = document.getElementById('analyze-image');
  
  // Add event listeners
  analyzePageBtn.addEventListener('click', analyzePage);
  toggleSidebarBtn.addEventListener('click', toggleSidebar);
  summarizeSelectionBtn.addEventListener('click', summarizeSelection);
  rewriteSelectionBtn.addEventListener('click', rewriteSelection);
  analyzeImageBtn.addEventListener('click', analyzeImage);
});

/**
 * Analyze the current page
 */
function analyzePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzePage' }, (response) => {
        // Close the popup after sending the message
        window.close();
      });
    }
  });
}

/**
 * Toggle the sidebar visibility
 */
function toggleSidebar() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSidebar' }, (response) => {
        // Close the popup after sending the message
        window.close();
      });
    }
  });
}

/**
 * Summarize the selected text
 */
function summarizeSelection() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'summarizeSelection' }, (response) => {
        // Close the popup after sending the message
        window.close();
      });
    }
  });
}

/**
 * Rewrite the selected text
 */
function rewriteSelection() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'rewriteSelection' }, (response) => {
        // Close the popup after sending the message
        window.close();
      });
    }
  });
}

/**
 * Analyze an image on the page
 */
function analyzeImage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeImage' }, (response) => {
        // Close the popup after sending the message
        window.close();
      });
    }
  });
}