// Import jest-chrome to mock Chrome API
const chrome = require('jest-chrome');

// Import testing-library/jest-dom for additional DOM matchers
require('@testing-library/jest-dom');

// Set up global Chrome API mock
global.chrome = chrome;

// Make sure chrome.runtime and chrome.tabs are properly initialized
if (!chrome.runtime) chrome.runtime = {};
if (!chrome.tabs) chrome.tabs = {};

// Mock Chrome API methods
chrome.runtime.onMessage = { addListener: jest.fn() };
chrome.runtime.sendMessage = jest.fn();
chrome.tabs.query = jest.fn();
chrome.tabs.sendMessage = jest.fn();

// Store the original mockImplementation to restore it later if needed
const originalMockImplementation = chrome.runtime.onMessage.addListener.mockImplementation;

// Mock Chrome's Built-in AI APIs
chrome.ai = {
  summarize: jest.fn().mockResolvedValue({ summary: 'Mock summary' }),
  rewrite: jest.fn().mockResolvedValue({ text: 'Rewritten text' }),
  analyzeImage: jest.fn().mockResolvedValue({ description: 'Image analysis' }),
};

// Mock Chrome context menu API if needed
chrome.contextMenus = {
  create: jest.fn(),
  onClicked: { addListener: jest.fn() }
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Set up the mock implementation for onMessage.addListener
  chrome.runtime.onMessage.addListener.mockImplementation(callback => {
    // Store the callback in mock.calls for tests to access
    chrome.runtime.onMessage.addListener.mock.calls.push([callback]);
    
    // Return a function that will handle the messages and call the callback
    return (message, sender, sendResponse) => {
      // Call the original callback
      const result = callback(message, sender, sendResponse);
      
      // Also provide default responses for common message types
      if (message && message.action) {
        switch (message.action) {
          case 'summarize':
            sendResponse({ success: true, summary: 'Mock summary', keyPoints: [] });
            return true;
          case 'rewrite':
            sendResponse({ success: true, text: 'Rewritten text' });
            return true;
          case 'analyzeImage':
            sendResponse({ success: true, description: 'Image analysis' });
            return true;
          case 'toggle':
            sendResponse({ success: true, active: true });
            return true;
          case 'getState':
            sendResponse({ active: true });
            return true;
        }
      }
      
      return result || false;
    };
  });
});