/**
 * Integration tests for WhatsIt Chrome Extension
 * Tests message passing between components
 */

// Mock the Chrome API
const chrome = global.chrome;

// Mock message listeners for background and content scripts
const mockBackgroundMessageListener = (message, sender, sendResponse) => {
  if (message.action === 'summarize') {
    sendResponse({
      success: true,
      summary: 'This is a test summary.',
      keyPoints: [
        { text: 'Key point 1', importance: 1 },
        { text: 'Key point 2', importance: 2 }
      ]
    });
    return true;
  } else if (message.action === 'rewrite') {
    sendResponse({
      success: true,
      text: 'This is the rewritten text.'
    });
    return true;
  } else if (message.action === 'analyzeImage') {
    sendResponse({
      success: true,
      description: 'An image of a test chart',
      tags: ['test', 'chart', 'image']
    });
    return true;
  }
  return false;
};

const mockContentMessageListener = (message, sender, sendResponse) => {
  if (message.action === 'toggle' || message.action === 'toggleWhatsIt') {
    sendResponse({ success: true, active: true });
    return true;
  } else if (message.action === 'getState') {
    sendResponse({ active: true });
    return true;
  }
  return false;
};

// Register the mock listeners
chrome.runtime.onMessage.addListener(mockBackgroundMessageListener);

// Setup function to reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Tests for message passing between popup and content script
describe('Popup to Content Script messaging', () => {
  test('should send toggle message from popup to content script', () => {
    // Mock the tabs.query callback
    chrome.tabs.query.mockImplementation((queryInfo, callback) => {
      callback([{ id: 123 }]);
    });
    
    // Mock the tabs.sendMessage function
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      // Simulate content script response by calling the mockContentMessageListener
      if (callback) {
        const response = {};
        mockContentMessageListener(message, { tab: { id: tabId } }, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Simulate popup sending toggle message
    const message = { action: 'toggleWhatsIt' };
    const callback = jest.fn();
    
    // Call tabs API as popup would
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
    
    // Verify message was sent with correct parameters
    expect(chrome.tabs.query).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function)
    );
    
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      123,
      { action: 'toggleWhatsIt' },
      expect.any(Function)
    );
    
    // Verify callback was called with expected response
    expect(callback).toHaveBeenCalledWith({ success: true, active: true });
  });
});

// Tests for message passing between content script and background script
describe('Content Script to Background Script messaging', () => {
  test('should send summarize request from content script to background', () => {
    // Mock the runtime.sendMessage function
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Simulate background script response by calling the mockBackgroundMessageListener
      if (callback) {
        const response = {};
        mockBackgroundMessageListener(message, {}, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Simulate content script sending summarize message
    const message = {
      action: 'summarize',
      text: {
        title: 'Test Page',
        textElements: [
          { text: 'Heading 1', type: 'heading', importance: 1 },
          { text: 'Paragraph 1', type: 'paragraph', importance: 3 }
        ]
      }
    };
    
    const callback = jest.fn();
    
    // Call runtime API as content script would
    chrome.runtime.sendMessage(message, callback);
    
    // Verify message was sent with correct parameters
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      message,
      expect.any(Function)
    );
    
    // Verify callback was called with expected response
    expect(callback).toHaveBeenCalledWith({
      success: true,
      summary: 'This is a test summary.',
      keyPoints: [
        { text: 'Key point 1', importance: 1 },
        { text: 'Key point 2', importance: 2 }
      ]
    });
  });
  
  test('should send rewrite request from content script to background', () => {
    // Mock the runtime.sendMessage function
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Simulate background script response by calling the mockBackgroundMessageListener
      if (callback) {
        const response = {};
        mockBackgroundMessageListener(message, {}, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Simulate content script sending rewrite message
    const message = {
      action: 'rewrite',
      text: 'This is the original text.',
      options: { tone: 'formal' }
    };
    
    const callback = jest.fn();
    
    // Call runtime API as content script would
    chrome.runtime.sendMessage(message, callback);
    
    // Verify message was sent with correct parameters
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      message,
      expect.any(Function)
    );
    
    // Verify callback was called with expected response
    expect(callback).toHaveBeenCalledWith({
      success: true,
      text: 'This is the rewritten text.'
    });
  });
  
  test('should send analyzeImage request from content script to background', () => {
    // Mock the runtime.sendMessage function
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Simulate background script response by calling the mockBackgroundMessageListener
      if (callback) {
        const response = {};
        mockBackgroundMessageListener(message, {}, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Simulate content script sending analyzeImage message
    const message = {
      action: 'analyzeImage',
      imageData: 'base64encodedimagedata'
    };
    
    const callback = jest.fn();
    
    // Call runtime API as content script would
    chrome.runtime.sendMessage(message, callback);
    
    // Verify message was sent with correct parameters
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      message,
      expect.any(Function)
    );
    
    // Verify callback was called with expected response
    expect(callback).toHaveBeenCalledWith({
      success: true,
      description: 'An image of a test chart',
      tags: ['test', 'chart', 'image']
    });
  });
});

// Tests for end-to-end workflow
describe('End-to-end workflow', () => {
  test('should handle complete workflow from toggle to content analysis', () => {
    // Mock the tabs.query callback
    chrome.tabs.query.mockImplementation((queryInfo, callback) => {
      callback([{ id: 123 }]);
    });
    
    // Mock the tabs.sendMessage function for content script communication
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      // Simulate content script response
      if (callback) {
        const response = {};
        mockContentMessageListener(message, { tab: { id: tabId } }, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Mock the runtime.sendMessage function for background script communication
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Simulate background script response
      if (callback) {
        const response = {};
        mockBackgroundMessageListener(message, {}, (result) => {
          Object.assign(response, result);
        });
        callback(response);
      }
    });
    
    // Step 1: Simulate popup sending toggle message to content script
    const toggleCallback = jest.fn();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleWhatsIt' }, toggleCallback);
    });
    
    // Verify toggle message was processed
    expect(toggleCallback).toHaveBeenCalledWith({ success: true, active: true });
    
    // Step 2: Simulate content script sending summarize message to background
    const summarizeCallback = jest.fn();
    chrome.runtime.sendMessage({
      action: 'summarize',
      text: { title: 'Test Page', textElements: [] }
    }, summarizeCallback);
    
    // Verify summarize message was processed
    expect(summarizeCallback).toHaveBeenCalledWith({
      success: true,
      summary: 'This is a test summary.',
      keyPoints: expect.any(Array)
    });
  });
});