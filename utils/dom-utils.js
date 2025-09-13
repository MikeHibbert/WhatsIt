/**
 * DOM Utility Functions for WhatsIt Extension
 */

/**
 * Extract text content from the current page
 * @returns {Object} Object containing page title, URL, and text elements
 */
function extractPageContent() {
  // Get page metadata
  const pageTitle = document.title;
  const pageUrl = window.location.href;
  
  // Extract text elements with importance ranking
  const textElements = [];
  
  // Process headings (h1-h6)
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, index) => {
    const headingLevel = parseInt(heading.tagName.substring(1));
    const text = heading.textContent.trim();
    
    if (text) {
      textElements.push({
        type: 'heading',
        level: headingLevel,
        text: text,
        importance: headingLevel, // Lower number = more important
        element: heading
      });
    }
  });
  
  // Process paragraphs
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach((paragraph, index) => {
    const text = paragraph.textContent.trim();
    
    if (text && text.length > 20) { // Only include substantial paragraphs
      textElements.push({
        type: 'paragraph',
        text: text,
        importance: 10, // Base importance for paragraphs
        element: paragraph
      });
    }
  });
  
  // Process list items
  const listItems = document.querySelectorAll('li');
  listItems.forEach((item, index) => {
    const text = item.textContent.trim();
    
    // Skip list items that are too short or are likely navigation items
    if (text && text.length > 15 && !item.closest('nav')) {
      textElements.push({
        type: 'list_item',
        text: text,
        importance: 15, // Lower importance than paragraphs
        element: item
      });
    }
  });
  
  // Adjust importance based on position (elements at the top are usually more important)
  textElements.forEach((element, index) => {
    // Boost importance of elements near the top of the page
    if (index < 5) {
      element.importance -= 2;
    }
  });
  
  return {
    title: pageTitle,
    url: pageUrl,
    textElements: textElements
  };
}

/**
 * Extract images from the current page
 * @returns {Array} Array of image objects with src and alt attributes
 */
function extractPageImages() {
  const images = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach(img => {
    const src = img.src;
    const alt = img.alt;
    
    // Skip tiny images, icons, and images without src
    if (src && 
        !src.includes('data:image/svg') && 
        img.width > 100 && 
        img.height > 100) {
      images.push({
        src: src,
        alt: alt,
        width: img.width,
        height: img.height,
        element: img
      });
    }
  });
  
  return images;
}

/**
 * Get the currently selected text on the page
 * @returns {string} The selected text
 */
function getSelectedText() {
  return window.getSelection().toString().trim();
}

/**
 * Create a highlight element around a text node
 * @param {Node} textNode - The text node to highlight
 * @param {number} startOffset - The start offset within the text node
 * @param {number} endOffset - The end offset within the text node
 * @returns {HTMLElement} The created highlight element
 */
function createHighlightElement(textNode, startOffset, endOffset) {
  // Create a range for the text to highlight
  const range = document.createRange();
  range.setStart(textNode, startOffset);
  range.setEnd(textNode, endOffset);
  
  // Create a highlight span
  const highlightSpan = document.createElement('span');
  highlightSpan.className = 'whatsit-highlight';
  highlightSpan.dataset.timestamp = Date.now();
  
  // Wrap the range with the highlight span
  range.surroundContents(highlightSpan);
  
  return highlightSpan;
}

/**
 * Highlight text on the page
 * @param {string} textToHighlight - The text to highlight
 * @param {string} [highlightId] - Optional ID for the highlight
 * @returns {Array} Array of created highlight elements
 */
function highlightText(textToHighlight, highlightId) {
  if (!textToHighlight) return [];
  
  const highlights = [];
  const textNodes = getTextNodes(document.body);
  
  // Escape special characters for regex
  const escapedText = textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedText, 'i');
  
  textNodes.forEach(node => {
    const text = node.nodeValue;
    const match = text.match(regex);
    
    if (match) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;
      
      try {
        const highlight = createHighlightElement(node, startOffset, endOffset);
        if (highlightId) {
          highlight.dataset.highlightId = highlightId;
        }
        highlights.push(highlight);
      } catch (error) {
        console.error('Error creating highlight:', error);
      }
    }
  });
  
  return highlights;
}

/**
 * Get all text nodes within an element
 * @param {HTMLElement} element - The element to search within
 * @returns {Array} Array of text nodes
 */
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip empty text nodes and nodes in script, style, etc.
        if (node.nodeValue.trim() === '' ||
            node.parentNode.tagName === 'SCRIPT' ||
            node.parentNode.tagName === 'STYLE' ||
            node.parentNode.tagName === 'NOSCRIPT' ||
            node.parentNode.classList.contains('whatsit-highlight') ||
            node.parentNode.classList.contains('whatsit-sidebar')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  return textNodes;
}

/**
 * Remove all highlights from the page
 * @param {string} [highlightId] - Optional ID to only remove specific highlights
 */
function removeHighlights(highlightId) {
  const selector = highlightId 
    ? `.whatsit-highlight[data-highlight-id="${highlightId}"]` 
    : '.whatsit-highlight';
  
  const highlights = document.querySelectorAll(selector);
  
  highlights.forEach(highlight => {
    // Replace the highlight with its text content
    const textNode = document.createTextNode(highlight.textContent);
    highlight.parentNode.replaceChild(textNode, highlight);
    
    // Normalize the parent to merge adjacent text nodes
    textNode.parentNode.normalize();
  });
}

/**
 * Create and inject the sidebar into the page
 * @returns {HTMLElement} The created sidebar element
 */
function createSidebar() {
  // Check if sidebar already exists
  let sidebar = document.querySelector('.whatsit-sidebar');
  
  if (!sidebar) {
    // Create sidebar container
    sidebar = document.createElement('div');
    sidebar.className = 'whatsit-sidebar';
    sidebar.dataset.state = 'expanded'; // Initial state
    
    // Create sidebar iframe
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('sidebar/sidebar.html');
    iframe.className = 'whatsit-sidebar-iframe';
    sidebar.appendChild(iframe);
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'whatsit-sidebar-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle sidebar');
    toggleButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L4 8L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    sidebar.appendChild(toggleButton);
    
    // Add event listener for toggle button
    toggleButton.addEventListener('click', () => {
      const currentState = sidebar.dataset.state;
      const newState = currentState === 'expanded' ? 'collapsed' : 'expanded';
      sidebar.dataset.state = newState;
      
      // Update toggle button icon
      if (newState === 'expanded') {
        toggleButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L4 8L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      } else {
        toggleButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L12 8L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      }
    });
    
    // Append sidebar to body
    document.body.appendChild(sidebar);
  }
  
  return sidebar;
}

/**
 * Toggle sidebar visibility
 * @returns {boolean} New visibility state (true = visible)
 */
function toggleSidebar() {
  let sidebar = document.querySelector('.whatsit-sidebar');
  
  if (!sidebar) {
    // Create sidebar if it doesn't exist
    sidebar = createSidebar();
    return true;
  } else {
    // Remove sidebar if it exists
    sidebar.remove();
    return false;
  }
}

// Export utility functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractPageContent,
    extractPageImages,
    getSelectedText,
    highlightText,
    removeHighlights,
    createSidebar,
    toggleSidebar
  };
}