/**
 * WhatsIt Content Script
 * Handles DOM manipulation, highlighting, and sidebar integration
 */

// Global state
const whatsitState = {
  isActive: false,
  highlights: [],
  sidebarInjected: false,
  sidebarVisible: false
};

/**
 * Initialize the content script
 */
function init() {
  // Listen for messages from the extension popup or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      toggleWhatsIt();
      sendResponse({ success: true, active: whatsitState.isActive });
    } else if (message.action === 'getState') {
      sendResponse({ active: whatsitState.isActive });
    }
    return true; // Required for async sendResponse
  });
}

/**
 * Toggle the WhatsIt functionality on/off
 */
async function toggleWhatsIt() {
  whatsitState.isActive = !whatsitState.isActive;
  
  if (whatsitState.isActive) {
    // Activate WhatsIt
    await analyzeContent();
    if (!whatsitState.sidebarInjected) {
      injectSidebar();
    } else {
      toggleSidebar(true);
    }
  } else {
    // Deactivate WhatsIt
    removeHighlights();
    toggleSidebar(false);
  }
}

/**
 * Analyze the page content using Chrome's Summarizer API
 */
async function analyzeContent() {
  try {
    // Extract text content from the page
    const pageText = extractPageText();
    
    // Call the Summarizer API via the background script
    const response = await chrome.runtime.sendMessage({
      action: 'summarize',
      text: pageText
    });
    
    if (response && response.success) {
      // Apply highlights to the identified key points
      applyHighlights(response.keyPoints);
      
      // Update the sidebar with the summary
      updateSidebar(response.summary, response.keyPoints);
      return true;
    } else {
      console.error('Failed to get summary:', response?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error analyzing content:', error);
    return false;
  }
}

/**
 * Extract text content from the page
 * @returns {Object} Object containing page text and metadata
 */
function extractPageText() {
  // Get the main content elements (prioritize article, main, or body)
  const mainContent = document.querySelector('article') || 
                      document.querySelector('main') || 
                      document.body;
  
  // Extract text from headings, paragraphs, and list items
  const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .map(el => ({ text: el.textContent.trim(), element: el, type: 'heading', importance: getHeadingImportance(el) }));
  
  const paragraphs = Array.from(mainContent.querySelectorAll('p'))
    .map(el => ({ text: el.textContent.trim(), element: el, type: 'paragraph', importance: 3 }));
  
  const listItems = Array.from(mainContent.querySelectorAll('li'))
    .map(el => ({ text: el.textContent.trim(), element: el, type: 'list-item', importance: 4 }));
  
  // Combine all text elements and filter out empty ones
  const allTextElements = [...headings, ...paragraphs, ...listItems]
    .filter(item => item.text.length > 0);
  
  // Extract any images with alt text for potential multimodal analysis
  const images = Array.from(mainContent.querySelectorAll('img[alt]:not([alt=""])'))
    .map(img => ({
      src: img.src,
      alt: img.alt,
      element: img
    }));
  
  return {
    textElements: allTextElements,
    images: images,
    title: document.title,
    url: window.location.href
  };
}

/**
 * Get the importance level of a heading based on its tag
 * @param {Element} headingElement - The heading DOM element
 * @returns {number} Importance score (lower is more important)
 */
function getHeadingImportance(headingElement) {
  const tag = headingElement.tagName.toLowerCase();
  const level = parseInt(tag.replace('h', ''));
  return level;
}

/**
 * Apply highlights to the identified key points on the page
 * @param {Array} keyPoints - Array of key points to highlight
 */
function applyHighlights(keyPoints) {
  // Remove any existing highlights first
  removeHighlights();
  
  // Clear the highlights array
  whatsitState.highlights = [];
  
  // Apply new highlights
  keyPoints.forEach((keyPoint, index) => {
    if (keyPoint.element) {
      const highlightElement = document.createElement('span');
      highlightElement.className = 'whatsit-highlight';
      highlightElement.dataset.whatsitId = `highlight-${index}`;
      highlightElement.tabIndex = 0; // Make it focusable for accessibility
      
      // Wrap the text node with our highlight span
      const range = document.createRange();
      range.selectNodeContents(keyPoint.element);
      range.surroundContents(highlightElement);
      
      // Add click event to emphasize when clicked
      highlightElement.addEventListener('click', () => {
        toggleHighlightEmphasis(highlightElement);
        // Scroll the corresponding summary item into view in the sidebar
        const summaryItem = document.querySelector(`#whatsit-summary-item-${index}`);
        if (summaryItem) {
          summaryItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          summaryItem.classList.add('active');
          setTimeout(() => summaryItem.classList.remove('active'), 2000);
        }
      });
      
      // Store the highlight reference
      whatsitState.highlights.push({
        element: highlightElement,
        id: `highlight-${index}`,
        text: keyPoint.text
      });
    }
  });
}

/**
 * Toggle emphasis effect on a highlighted element
 * @param {Element} highlightElement - The highlight DOM element
 */
function toggleHighlightEmphasis(highlightElement) {
  highlightElement.classList.add('active');
  
  // Remove the emphasis after a short delay
  setTimeout(() => {
    highlightElement.classList.remove('active');
  }, 2000);
}

/**
 * Remove all highlights from the page
 */
function removeHighlights() {
  document.querySelectorAll('.whatsit-highlight').forEach(highlight => {
    // Unwrap the highlight span (replace it with its contents)
    const parent = highlight.parentNode;
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    parent.removeChild(highlight);
  });
  
  whatsitState.highlights = [];
}

/**
 * Inject the sidebar into the page
 */
function injectSidebar() {
  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'whatsit-sidebar';
  sidebar.className = 'collapsed'; // Start collapsed
  
  // Create toggle button
  const toggleButton = document.createElement('div');
  toggleButton.id = 'whatsit-toggle';
  toggleButton.className = 'collapsed';
  toggleButton.innerHTML = '&lt;';
  toggleButton.setAttribute('aria-label', 'Toggle WhatsIt sidebar');
  toggleButton.setAttribute('role', 'button');
  toggleButton.setAttribute('tabindex', '0');
  
  // Add click event to toggle button
  toggleButton.addEventListener('click', () => {
    toggleSidebar();
  });
  
  // Add keyboard accessibility
  toggleButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleSidebar();
      e.preventDefault();
    }
  });
  
  // Add sidebar and toggle button to the page
  document.body.appendChild(sidebar);
  document.body.appendChild(toggleButton);
  
  // Mark sidebar as injected
  whatsitState.sidebarInjected = true;
  
  // Load the sidebar content
  loadSidebarContent(sidebar);
}

/**
 * Load the sidebar content
 * @param {Element} sidebarElement - The sidebar DOM element
 */
function loadSidebarContent(sidebarElement) {
  // Create sidebar header
  const header = document.createElement('div');
  header.style.padding = '15px';
  header.style.borderBottom = '1px solid #eee';
  header.style.backgroundColor = '#4285F4';
  header.style.color = 'white';
  
  const title = document.createElement('h2');
  title.textContent = 'WhatsIt Summary';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  
  header.appendChild(title);
  
  // Create content container
  const content = document.createElement('div');
  content.id = 'whatsit-content';
  content.style.padding = '15px';
  
  // Create refresh button
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Refresh Analysis';
  refreshButton.style.marginTop = '15px';
  refreshButton.style.padding = '8px 12px';
  refreshButton.style.backgroundColor = '#4285F4';
  refreshButton.style.color = 'white';
  refreshButton.style.border = 'none';
  refreshButton.style.borderRadius = '4px';
  refreshButton.style.cursor = 'pointer';
  
  refreshButton.addEventListener('click', async () => {
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Refreshing analysis...';
    content.innerHTML = '';
    content.appendChild(loadingMessage);
    
    await analyzeContent();
  });
  
  // Add elements to sidebar
  sidebarElement.appendChild(header);
  sidebarElement.appendChild(content);
  sidebarElement.appendChild(refreshButton);
}

/**
 * Update the sidebar with summary content
 * @param {string} summary - The summary text
 * @param {Array} keyPoints - The key points identified
 */
function updateSidebar(summary, keyPoints) {
  const contentElement = document.getElementById('whatsit-content');
  if (!contentElement) return;
  
  // Clear existing content
  contentElement.innerHTML = '';
  
  // Add summary heading
  const summaryHeading = document.createElement('h3');
  summaryHeading.textContent = 'Page Summary';
  summaryHeading.style.marginTop = '0';
  contentElement.appendChild(summaryHeading);
  
  // Add summary text
  const summaryParagraph = document.createElement('p');
  summaryParagraph.textContent = summary;
  contentElement.appendChild(summaryParagraph);
  
  // Add key points heading
  const keyPointsHeading = document.createElement('h3');
  keyPointsHeading.textContent = 'Key Points';
  contentElement.appendChild(keyPointsHeading);
  
  // Add key points list
  const keyPointsList = document.createElement('ul');
  keyPointsList.style.paddingLeft = '20px';
  
  keyPoints.forEach((point, index) => {
    const listItem = document.createElement('li');
    listItem.id = `whatsit-summary-item-${index}`;
    listItem.textContent = point.text;
    listItem.style.marginBottom = '8px';
    listItem.style.cursor = 'pointer';
    listItem.style.transition = 'background-color 0.2s ease';
    
    // Add click event to scroll to the corresponding highlight
    listItem.addEventListener('click', () => {
      const highlightElement = document.querySelector(`[data-whatsit-id="highlight-${index}"]`);
      if (highlightElement) {
        highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toggleHighlightEmphasis(highlightElement);
      }
    });
    
    // Add keyboard accessibility
    listItem.setAttribute('tabindex', '0');
    listItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const highlightElement = document.querySelector(`[data-whatsit-id="highlight-${index}"]`);
        if (highlightElement) {
          highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          toggleHighlightEmphasis(highlightElement);
        }
        e.preventDefault();
      }
    });
    
    keyPointsList.appendChild(listItem);
  });
  
  contentElement.appendChild(keyPointsList);
  
  // Show the sidebar
  toggleSidebar(true);
}

/**
 * Toggle the sidebar visibility
 * @param {boolean} [show] - Force show/hide the sidebar
 */
function toggleSidebar(show) {
  const sidebar = document.getElementById('whatsit-sidebar');
  const toggleButton = document.getElementById('whatsit-toggle');
  
  if (!sidebar || !toggleButton) return;
  
  const newState = show !== undefined ? show : sidebar.classList.contains('collapsed');
  
  if (newState) {
    // Show sidebar
    sidebar.classList.remove('collapsed');
    toggleButton.classList.remove('collapsed');
    toggleButton.innerHTML = '&gt;';
    toggleButton.setAttribute('aria-label', 'Hide WhatsIt sidebar');
  } else {
    // Hide sidebar
    sidebar.classList.add('collapsed');
    toggleButton.classList.add('collapsed');
    toggleButton.innerHTML = '&lt;';
    toggleButton.setAttribute('aria-label', 'Show WhatsIt sidebar');
  }
  
  whatsitState.sidebarVisible = newState;
}

// Initialize the content script
init();