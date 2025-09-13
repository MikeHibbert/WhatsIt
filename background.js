/**
 * WhatsIt Background Script
 * Handles API calls to Chrome's Built-in AI APIs
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarize') {
    summarizeContent(message.text)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  } else if (message.action === 'rewrite') {
    rewriteText(message.text, message.options)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  } else if (message.action === 'analyzeImage') {
    analyzeImage(message.imageData)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
});

/**
 * Summarize content using Chrome's Summarizer API
 * @param {Object} pageData - Object containing page text and metadata
 * @returns {Promise<Object>} - Promise resolving to summary results
 */
async function summarizeContent(pageData) {
  try {
    // Mock implementation - in the actual extension, this would use Chrome's Built-in AI APIs
    // For the hackathon, we would replace this with actual calls to chrome.ai.summarizer
    console.log('Summarizing content:', pageData);
    
    // Extract text elements for processing
    const textElements = pageData.textElements || [];
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Select key points based on importance (in real implementation, this would be done by the API)
    const keyPoints = selectKeyPoints(textElements);
    
    // Generate summary (in real implementation, this would be done by the API)
    const summary = generateMockSummary(textElements, pageData.title);
    
    return {
      success: true,
      summary: summary,
      keyPoints: keyPoints
    };
  } catch (error) {
    console.error('Error in summarizeContent:', error);
    throw error;
  }
}

/**
 * Rewrite text using Chrome's Rewriter API
 * @param {string} text - Text to rewrite
 * @param {Object} options - Rewriting options (e.g., tone, simplicity)
 * @returns {Promise<Object>} - Promise resolving to rewritten text
 */
async function rewriteText(text, options = {}) {
  try {
    // Mock implementation - in the actual extension, this would use Chrome's Built-in AI APIs
    // For the hackathon, we would replace this with actual calls to chrome.ai.rewriter
    console.log('Rewriting text with options:', options);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple mock rewriting based on options
    let rewrittenText = text;
    
    if (options.simplify) {
      // Simplify the text (mock implementation)
      rewrittenText = simplifyText(text);
    }
    
    if (options.tone) {
      // Adjust tone (mock implementation)
      rewrittenText = adjustTone(rewrittenText, options.tone);
    }
    
    return {
      success: true,
      original: text,
      rewritten: rewrittenText
    };
  } catch (error) {
    console.error('Error in rewriteText:', error);
    throw error;
  }
}

/**
 * Analyze image using Chrome's Prompt API with multimodal support
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<Object>} - Promise resolving to image analysis
 */
async function analyzeImage(imageData) {
  try {
    // Mock implementation - in the actual extension, this would use Chrome's Built-in AI APIs
    // For the hackathon, we would replace this with actual calls to chrome.ai.prompt
    console.log('Analyzing image data');
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock image analysis result
    return {
      success: true,
      description: "A chart showing quarterly sales growth of 20% year-over-year",
      tags: ["chart", "graph", "business", "growth", "sales"],
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw error;
  }
}

/**
 * Select key points from text elements based on importance
 * @param {Array} textElements - Array of text elements with metadata
 * @returns {Array} - Selected key points
 */
function selectKeyPoints(textElements) {
  // Sort by importance (lower number = more important)
  const sortedElements = [...textElements].sort((a, b) => {
    // First by importance
    if (a.importance !== b.importance) {
      return a.importance - b.importance;
    }
    // Then by length (prefer longer text for same importance)
    return b.text.length - a.text.length;
  });
  
  // Select top elements (headings and important paragraphs)
  // In a real implementation, this would be done by the Summarizer API
  const selectedPoints = sortedElements.slice(0, 5);
  
  return selectedPoints;
}

/**
 * Generate a mock summary from text elements
 * @param {Array} textElements - Array of text elements
 * @param {string} title - Page title
 * @returns {string} - Generated summary
 */
function generateMockSummary(textElements, title) {
  // In a real implementation, this would be done by the Summarizer API
  // For now, we'll create a simple summary based on the title and first few elements
  
  const headings = textElements.filter(el => el.type === 'heading');
  const paragraphs = textElements.filter(el => el.type === 'paragraph');
  
  let summary = `This page discusses ${title}. `;
  
  // Add main heading if available
  if (headings.length > 0) {
    summary += `The main topic is ${headings[0].text}. `;
  }
  
  // Add first paragraph snippet if available
  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0].text;
    const snippet = firstPara.length > 100 ? firstPara.substring(0, 100) + '...' : firstPara;
    summary += snippet;
  }
  
  return summary;
}

/**
 * Simplify text (mock implementation)
 * @param {string} text - Text to simplify
 * @returns {string} - Simplified text
 */
function simplifyText(text) {
  // This is a very basic mock implementation
  // In a real extension, this would use the Rewriter API
  
  // Replace some complex words with simpler alternatives
  const simplifications = {
    'utilize': 'use',
    'implement': 'use',
    'sufficient': 'enough',
    'demonstrate': 'show',
    'additionally': 'also',
    'consequently': 'so',
    'nevertheless': 'still',
    'subsequently': 'later'
  };
  
  let simplified = text;
  
  Object.entries(simplifications).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });
  
  return simplified;
}

/**
 * Adjust tone of text (mock implementation)
 * @param {string} text - Text to adjust
 * @param {string} tone - Target tone (casual, formal, friendly)
 * @returns {string} - Tone-adjusted text
 */
function adjustTone(text, tone) {
  // This is a very basic mock implementation
  // In a real extension, this would use the Rewriter API
  
  switch (tone.toLowerCase()) {
    case 'casual':
      // Make more casual by adding contractions
      return text
        .replace('will not', "won't")
        .replace('cannot', "can't")
        .replace('do not', "don't");
      
    case 'formal':
      // Make more formal by expanding contractions
      return text
        .replace(/won't/g, "will not")
        .replace(/can't/g, "cannot")
        .replace(/don't/g, "do not");
      
    case 'friendly':
      // Add friendly phrases
      return `${text} Hope that helps!`;
      
    default:
      return text;
  }
}

// Log when the background script loads
console.log('WhatsIt background script loaded');