/**
 * WhatsIt Sidebar JavaScript
 * Handles user interactions and communication with the background script
 */

// State management
const state = {
  activeTab: 'summary-panel',
  pageImages: [],
  selectedImage: null,
  summaryData: null,
  rewriteData: null,
  imageAnalysisData: null
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabButtons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.panel');
  
  // Summary panel elements
  const refreshSummaryBtn = document.getElementById('refresh-summary');
  const summaryLoading = document.getElementById('summary-loading');
  const summaryContent = document.getElementById('summary-content');
  const summaryError = document.getElementById('summary-error');
  const summaryText = document.querySelector('.summary-text');
  const keyPointsList = document.querySelector('.key-points-list');
  
  // Rewrite panel elements
  const rewriteTone = document.getElementById('rewrite-tone');
  const simplifyText = document.getElementById('simplify-text');
  const textToRewrite = document.getElementById('text-to-rewrite');
  const rewriteButton = document.getElementById('rewrite-button');
  const rewriteLoading = document.getElementById('rewrite-loading');
  const rewriteResult = document.getElementById('rewrite-result');
  const rewriteError = document.getElementById('rewrite-error');
  const rewrittenText = document.querySelector('.rewritten-text');
  const copyRewrittenBtn = document.getElementById('copy-rewritten');
  
  // Image analysis panel elements
  const pageImagesGrid = document.getElementById('page-images');
  const imageUpload = document.getElementById('image-upload');
  const selectedImageContainer = document.getElementById('selected-image-container');
  const selectedImage = document.getElementById('selected-image');
  const analyzeImageButton = document.getElementById('analyze-image-button');
  const imageLoading = document.getElementById('image-loading');
  const imageAnalysisResult = document.getElementById('image-analysis-result');
  const imageError = document.getElementById('image-error');
  const imageDescription = document.querySelector('.image-description');
  const imageTags = document.querySelector('.image-tags');
  
  // Close sidebar button
  const closeSidebarBtn = document.getElementById('close-sidebar');
  
  // Initialize the sidebar
  initializeSidebar();
  
  // Event Listeners
  
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId, tabButtons, panels);
    });
  });
  
  // Summary panel
  refreshSummaryBtn.addEventListener('click', () => {
    fetchPageSummary();
  });
  
  // Rewrite panel
  rewriteButton.addEventListener('click', () => {
    const text = textToRewrite.value.trim();
    if (text) {
      rewriteSelectedText(text, {
        tone: rewriteTone.value,
        simplify: simplifyText.checked
      });
    }
  });
  
  copyRewrittenBtn.addEventListener('click', () => {
    if (state.rewriteData && state.rewriteData.rewritten) {
      navigator.clipboard.writeText(state.rewriteData.rewritten)
        .then(() => {
          const originalText = copyRewrittenBtn.textContent;
          copyRewrittenBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyRewrittenBtn.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
    }
  });
  
  // Image analysis panel
  imageUpload.addEventListener('change', (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        selectedImage.src = e.target.result;
        state.selectedImage = e.target.result;
        selectedImageContainer.style.display = 'flex';
        
        // Clear any previous image selection in the grid
        const selectedPageImages = document.querySelectorAll('.page-image-item.selected');
        selectedPageImages.forEach(img => img.classList.remove('selected'));
      };
      
      reader.readAsDataURL(file);
    }
  });
  
  analyzeImageButton.addEventListener('click', () => {
    if (state.selectedImage) {
      analyzeSelectedImage(state.selectedImage);
    }
  });
  
  // Close sidebar
  closeSidebarBtn.addEventListener('click', () => {
    // Send message to content script to close the sidebar
    chrome.runtime.sendMessage({ action: 'closeSidebar' });
  });
});

/**
 * Initialize the sidebar
 */
function initializeSidebar() {
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updatePageData') {
      // Update page data (title, text elements, etc.)
      updatePageData(message.data);
      sendResponse({ success: true });
    } else if (message.action === 'updatePageImages') {
      // Update available images on the page
      updatePageImages(message.images);
      sendResponse({ success: true });
    } else if (message.action === 'updateSelectedText') {
      // Update the rewrite panel with selected text
      document.getElementById('text-to-rewrite').value = message.text;
      // Switch to rewrite tab
      switchTab('rewrite-panel', 
               document.querySelectorAll('.tab-button'), 
               document.querySelectorAll('.panel'));
      sendResponse({ success: true });
    }
    return true; // Required for async sendResponse
  });
  
  // Fetch initial page summary
  fetchPageSummary();
  
  // Request page images from content script
  chrome.runtime.sendMessage({ action: 'getPageImages' });
}

/**
 * Switch between tabs
 * @param {string} tabId - The ID of the tab to switch to
 * @param {NodeList} tabButtons - All tab buttons
 * @param {NodeList} panels - All panels
 */
function switchTab(tabId, tabButtons, panels) {
  // Update active tab state
  state.activeTab = tabId;
  
  // Update tab buttons
  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab') === tabId) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Update panels
  panels.forEach(panel => {
    if (panel.id === tabId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

/**
 * Update page data in the sidebar
 * @param {Object} data - Page data including title and text elements
 */
function updatePageData(data) {
  // Store the data
  state.pageData = data;
  
  // If we're on the summary tab, fetch the summary
  if (state.activeTab === 'summary-panel') {
    fetchPageSummary();
  }
}

/**
 * Update available page images in the sidebar
 * @param {Array} images - Array of image data objects with src and alt
 */
function updatePageImages(images) {
  // Store the images
  state.pageImages = images;
  
  // Update the page images grid
  const pageImagesGrid = document.getElementById('page-images');
  pageImagesGrid.innerHTML = '';
  
  if (images.length === 0) {
    pageImagesGrid.innerHTML = '<p>No images found on this page.</p>';
    return;
  }
  
  // Add each image to the grid
  images.forEach((image, index) => {
    const imgElement = document.createElement('img');
    imgElement.src = image.src;
    imgElement.alt = image.alt || `Image ${index + 1}`;
    imgElement.classList.add('page-image-item');
    
    imgElement.addEventListener('click', () => {
      // Clear previous selection
      document.querySelectorAll('.page-image-item.selected').forEach(img => {
        img.classList.remove('selected');
      });
      
      // Set new selection
      imgElement.classList.add('selected');
      document.getElementById('selected-image').src = image.src;
      state.selectedImage = image.src;
      document.getElementById('selected-image-container').style.display = 'flex';
    });
    
    pageImagesGrid.appendChild(imgElement);
  });
}

/**
 * Fetch page summary from the background script
 */
function fetchPageSummary() {
  // Show loading state
  document.getElementById('summary-loading').style.display = 'flex';
  document.getElementById('summary-content').style.display = 'none';
  document.getElementById('summary-error').style.display = 'none';
  
  // If we don't have page data yet, request it from the content script
  if (!state.pageData) {
    chrome.runtime.sendMessage({ action: 'getPageData' }, response => {
      if (response && response.success) {
        // Continue with summary request once we have the data
        requestSummary();
      } else {
        // Show error
        document.getElementById('summary-loading').style.display = 'none';
        document.getElementById('summary-error').style.display = 'flex';
      }
    });
  } else {
    // We already have page data, proceed with summary request
    requestSummary();
  }
}

/**
 * Request summary from background script
 */
function requestSummary() {
  chrome.runtime.sendMessage(
    { action: 'summarize', text: state.pageData },
    response => {
      // Hide loading state
      document.getElementById('summary-loading').style.display = 'none';
      
      if (response && response.success) {
        // Store the summary data
        state.summaryData = response;
        
        // Update the summary content
        document.querySelector('.summary-text').textContent = response.summary;
        
        // Update key points
        const keyPointsList = document.querySelector('.key-points-list');
        keyPointsList.innerHTML = '';
        
        if (response.keyPoints && response.keyPoints.length > 0) {
          response.keyPoints.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point.text;
            keyPointsList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = 'No key points identified.';
          keyPointsList.appendChild(li);
        }
        
        // Show the content
        document.getElementById('summary-content').style.display = 'flex';
      } else {
        // Show error
        document.getElementById('summary-error').style.display = 'flex';
      }
    }
  );
}

/**
 * Rewrite selected text using the background script
 * @param {string} text - Text to rewrite
 * @param {Object} options - Rewriting options (tone, simplify)
 */
function rewriteSelectedText(text, options) {
  // Show loading state
  document.getElementById('rewrite-loading').style.display = 'flex';
  document.getElementById('rewrite-result').style.display = 'none';
  document.getElementById('rewrite-error').style.display = 'none';
  
  // Send rewrite request to background script
  chrome.runtime.sendMessage(
    { action: 'rewrite', text, options },
    response => {
      // Hide loading state
      document.getElementById('rewrite-loading').style.display = 'none';
      
      if (response && response.success) {
        // Store the rewrite data
        state.rewriteData = response;
        
        // Update the rewritten text
        document.querySelector('.rewritten-text').textContent = response.rewritten;
        
        // Show the result
        document.getElementById('rewrite-result').style.display = 'flex';
      } else {
        // Show error
        document.getElementById('rewrite-error').style.display = 'flex';
      }
    }
  );
}

/**
 * Analyze selected image using the background script
 * @param {string} imageData - Base64 encoded image data or image URL
 */
function analyzeSelectedImage(imageData) {
  // Show loading state
  document.getElementById('image-loading').style.display = 'flex';
  document.getElementById('image-analysis-result').style.display = 'none';
  document.getElementById('image-error').style.display = 'none';
  
  // Send image analysis request to background script
  chrome.runtime.sendMessage(
    { action: 'analyzeImage', imageData },
    response => {
      // Hide loading state
      document.getElementById('image-loading').style.display = 'none';
      
      if (response && response.success) {
        // Store the image analysis data
        state.imageAnalysisData = response;
        
        // Update the image description
        document.querySelector('.image-description').textContent = response.description;
        
        // Update image tags
        const imageTagsContainer = document.querySelector('.image-tags');
        imageTagsContainer.innerHTML = '';
        
        if (response.tags && response.tags.length > 0) {
          response.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('image-tag');
            tagElement.textContent = tag;
            imageTagsContainer.appendChild(tagElement);
          });
        }
        
        // Show the result
        document.getElementById('image-analysis-result').style.display = 'flex';
      } else {
        // Show error
        document.getElementById('image-error').style.display = 'flex';
      }
    }
  );
}