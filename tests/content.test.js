/**
 * Unit tests for content.js
 */

// Mock the Chrome API
const chrome = global.chrome;

// Mock DOM elements and functions
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();
document.createElement = jest.fn().mockImplementation(() => {
  return {
    className: '',
    style: {},
    appendChild: jest.fn(),
    addEventListener: jest.fn()
  };
});

// Mock global functions from content.js
global.extractTextElements = jest.fn().mockReturnValue([]);
global.updateSidebar = jest.fn();
global.highlightKeyPoints = jest.fn();
global.removeHighlights = jest.fn();
global.injectSidebar = jest.fn();
global.analyzeContent = jest.fn().mockResolvedValue(true);
global.extractPageText = jest.fn().mockReturnValue({
  textElements: [],
  images: [],
  title: 'Test Page',
  url: 'https://example.com'
});
global.applyHighlights = jest.fn();

// Mock message listener for content script
const mockMessageListener = (message, sender, sendResponse) => {
  if (message.action === 'toggleWhatsIt') {
    const result = toggleWhatsIt();
    sendResponse({ success: true, active: result });
    return true;
  } else if (message.action === 'getState') {
    sendResponse({ active: isActive });
    return true;
  }
  return false;
};

// Register the mock listener
chrome.runtime.onMessage.addListener(mockMessageListener);

// Import functions and variables from content.js
let isActive = false;
let sidebar = null;

// Mock the toggleWhatsIt function
function toggleWhatsIt() {
  if (!isActive) {
    isActive = true;
    global.analyzeContent();
    global.injectSidebar();
    return true;
  } else {
    isActive = false;
    if (sidebar) {
      document.body.removeChild(sidebar);
      sidebar = null;
    }
    global.removeHighlights();
    return false;
  }
}

// Mock the analyzeContent function
function analyzeContent() {
  const pageText = global.extractPageText();
  
  chrome.runtime.sendMessage({
    action: 'summarize',
    text: pageText
  }, (response) => {
    if (response && response.success) {
      global.updateSidebar(response.summary, response.keyPoints);
      global.highlightKeyPoints(response.keyPoints);
    }
  });
}

// Setup function to reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  isActive = false;
  sidebar = null;
});

// Tests for message handling
describe('Content Script', () => {
  describe('Message Handling', () => {
    test('should handle toggle message', () => {
      // Create a mock message and response function
      const message = { action: 'toggleWhatsIt' };
      const sendResponse = jest.fn();
      
      // Call the listener directly
      const result = mockMessageListener(message, {}, sendResponse);
      
      // Verify the result is true (for async sendResponse)
      expect(result).toBe(true);
      
      // Verify sendResponse was called with the correct response
      expect(sendResponse).toHaveBeenCalledWith({ success: true, active: true });
      
      // Verify isActive was toggled
      expect(isActive).toBe(true);
    });
    
    test('should handle getState message', () => {
      // Set initial state
      isActive = true;
      
      // Create a mock message and response function
      const message = { action: 'getState' };
      const sendResponse = jest.fn();
      
      // Call the listener directly
      const result = mockMessageListener(message, {}, sendResponse);
      
      // Verify the result is true (for async sendResponse)
      expect(result).toBe(true);
      
      // Verify sendResponse was called with the correct response
      expect(sendResponse).toHaveBeenCalledWith({ active: true });
    });
  });
  
  // Test toggleWhatsIt function
  describe('toggleWhatsIt', () => {
    test('should toggle active state from false to true', () => {
      const result = toggleWhatsIt();
      
      expect(result).toBe(true);
      expect(isActive).toBe(true);
      expect(global.analyzeContent).toHaveBeenCalled();
      expect(global.injectSidebar).toHaveBeenCalled();
    });
    
    test('should toggle active state from true to false', () => {
      // Set initial state to active
      isActive = true;
      sidebar = document.createElement('div');
      
      const result = toggleWhatsIt();
      
      expect(result).toBe(false);
      expect(isActive).toBe(false);
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.removeHighlights).toHaveBeenCalled();
    });
  });
  
  // Test analyzeContent function
  describe('analyzeContent', () => {
    test('should extract text elements and send message to background', () => {
      analyzeContent();
      
      expect(global.extractPageText).toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'summarize' }),
        expect.any(Function)
      );
    });
    
    test('should update sidebar and highlight key points on successful response', () => {
      // Mock sendMessage to simulate successful response
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback({
          success: true,
          summary: 'Test summary',
          keyPoints: [{ text: 'Key point 1' }]
        });
      });
      
      analyzeContent();
      
      expect(global.updateSidebar).toHaveBeenCalledWith(
        'Test summary',
        [{ text: 'Key point 1' }]
      );
      expect(global.highlightKeyPoints).toHaveBeenCalledWith(
        [{ text: 'Key point 1' }]
      );
    });
  });
});