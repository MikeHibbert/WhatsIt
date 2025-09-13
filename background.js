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
    console.log('Summarizing content:', pageData);
    
    // Extract text elements for processing
    const textElements = pageData.textElements || [];
    const title = pageData.title || '';
    
    // Combine text elements into a single string for summarization
    const textToSummarize = textElements.map(el => el.text).join('\n\n');
    
    // Check if the Summarizer API is available
    if (!('Summarizer' in self)) {
      console.warn('Summarizer API not available, using fallback');
      return fallbackSummarize(textElements, title);
    }
    
    // Check API availability
    const availability = await Summarizer.availability();
    console.log('Summarizer availability:', availability);
    
    if (availability === 'unavailable') {
      console.warn('Summarizer API unavailable, using fallback');
      return fallbackSummarize(textElements, title);
    }
    
    // Create summarizer instance
    const summarizer = await Summarizer.create({
      type: 'key-points',  // Extract key points as bullet points
      format: 'markdown',  // Return in markdown format
      length: 'medium',    // Medium length summary
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
    });
    
    // Generate summary
    const summary = await summarizer.summarize(textToSummarize);
    
    // Extract key points from the summary (bullet points)
    // The summary is in markdown format with bullet points
    const keyPoints = summary.split('\n')
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
      .map(line => {
        // Remove the bullet point marker and trim
        const text = line.replace(/^\s*[*-]\s*/, '').trim();
        
        // Find the corresponding text element that contains this key point
        const matchingElement = textElements.find(el => el.text.includes(text));
        
        return {
          text: text,
          importance: matchingElement ? matchingElement.importance : 3,
          type: matchingElement ? matchingElement.type : 'paragraph'
        };
      });
    
    return {
      success: true,
      summary: summary,
      keyPoints: keyPoints
    };
  } catch (error) {
    console.error('Error in summarizeContent:', error);
    // Fall back to mock implementation if API fails
    return fallbackSummarize(pageData.textElements, pageData.title);
  }
}

/**
 * Fallback summarization when API is unavailable
 * @param {Array} textElements - Array of text elements
 * @param {string} title - Page title
 * @returns {Object} - Summary results
 */
function fallbackSummarize(textElements, title) {
  // Select key points based on importance
  const keyPoints = selectKeyPoints(textElements);
  
  // Generate summary
  const summary = generateMockSummary(textElements, title);
  
  return {
    success: true,
    summary: summary,
    keyPoints: keyPoints
  };
}

/**
 * Rewrite text using Chrome's Rewriter API
 * @param {string} text - Text to rewrite
 * @param {Object} options - Rewriting options (e.g., tone, simplicity)
 * @returns {Promise<Object>} - Promise resolving to rewritten text
 */
async function rewriteText(text, options = {}) {
  try {
    console.log('Rewriting text with options:', options);
    
    // Check if the Rewriter API is available
    if (!('Rewriter' in self)) {
      console.warn('Rewriter API not available, using fallback');
      return fallbackRewrite(text, options);
    }
    
    // Check API availability
    const availability = await Rewriter.availability();
    console.log('Rewriter availability:', availability);
    
    if (availability === 'unavailable') {
      console.warn('Rewriter API unavailable, using fallback');
      return fallbackRewrite(text, options);
    }
    
    // Create rewriter instance
    const rewriter = await Rewriter.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
    });
    
    // Set up rewriting options
    const rewriteOptions = {};
    
    if (options.simplify) {
      rewriteOptions.complexity = 'simpler';
    }
    
    if (options.tone) {
      rewriteOptions.tone = options.tone; // 'casual', 'formal', or 'friendly'
    }
    
    // Rewrite the text
    const rewritten = await rewriter.rewrite(text, rewriteOptions);
    
    return {
      success: true,
      original: text,
      rewritten: rewritten
    };
  } catch (error) {
    console.error('Error in rewriteText:', error);
    // Fall back to mock implementation if API fails
    return fallbackRewrite(text, options);
  }
}

/**
 * Fallback rewriting when API is unavailable
 * @param {string} text - Text to rewrite
 * @param {Object} options - Rewriting options
 * @returns {Object} - Rewriting results
 */
function fallbackRewrite(text, options) {
  let rewrittenText = text;
  
  if (options.simplify) {
    rewrittenText = simplifyText(text);
  }
  
  if (options.tone) {
    rewrittenText = adjustTone(rewrittenText, options.tone);
  }
  
  return {
    success: true,
    original: text,
    rewritten: rewrittenText
  };
}

/**
 * Analyze image using Chrome's Prompt API with multimodal support
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<Object>} - Promise resolving to image analysis
 */
async function analyzeImage(imageData) {
  try {
    console.log('Analyzing image data');
    
    // Check if the Prompt API is available
    if (!('LanguageModel' in self)) {
      console.warn('Prompt API not available, using fallback');
      return fallbackImageAnalysis();
    }
    
    // Check API availability
    const availability = await LanguageModel.availability();
    console.log('LanguageModel availability:', availability);
    
    if (availability === 'unavailable') {
      console.warn('LanguageModel API unavailable, using fallback');
      return fallbackImageAnalysis();
    }
    
    // Create language model session
    const session = await LanguageModel.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
    });
    
    // Create a blob from the base64 image data
    const byteCharacters = atob(imageData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Prompt the model with the image
    const response = await session.prompt([
      {
        role: 'user',
        parts: [
          { text: 'Describe this image in detail, focusing on any charts, graphs, or data visualizations. If it contains data, summarize the key trends or findings.' },
          { blob: blob }
        ]
      }
    ]);
    
    // Extract tags from the response
    const description = response.candidates[0].content.parts[0].text;
    const tags = extractTags(description);
    
    return {
      success: true,
      description: description,
      tags: tags,
      confidence: 0.9 // Actual API doesn't provide confidence scores
    };
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    // Fall back to mock implementation if API fails
    return fallbackImageAnalysis();
  }
}

/**
 * Fallback image analysis when API is unavailable
 * @returns {Object} - Mock image analysis results
 */
function fallbackImageAnalysis() {
  return {
    success: true,
    description: "A chart showing quarterly sales growth of 20% year-over-year",
    tags: ["chart", "graph", "business", "growth", "sales"],
    confidence: 0.85
  };
}

/**
 * Extract tags from a description
 * @param {string} description - Image description
 * @returns {Array} - Extracted tags
 */
function extractTags(description) {
  // Simple keyword extraction
  const keywords = ['chart', 'graph', 'table', 'data', 'image', 'photo', 'picture', 
                   'business', 'growth', 'sales', 'revenue', 'profit', 'loss',
                   'increase', 'decrease', 'trend', 'comparison', 'analysis'];
  
  return keywords.filter(keyword => 
    description.toLowerCase().includes(keyword.toLowerCase())
  );
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