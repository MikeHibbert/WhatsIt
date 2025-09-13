# WhatsIt Chrome Extension

## Overview

WhatsIt is a Chrome extension that leverages Chrome's Built-in AI APIs to analyze web content and provide useful insights. The extension offers a sidebar interface that allows users to summarize page content, rewrite text, and analyze images.

## Features

- **Content Analysis**: Automatically extracts and analyzes key content from web pages
- **Sidebar Display**: Provides an intuitive sidebar interface for viewing analysis results
- **Text Summarization**: Generates concise summaries of page content
- **Text Rewriting**: Rewrites selected text with different tones and simplification options
- **Image Analysis**: Analyzes images on the page or uploaded by the user
- **Highlighting**: Highlights important content on the page

## Installation

### Development Mode

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The WhatsIt extension should now be installed and visible in your Chrome toolbar

## Usage

### Popup Interface

Click the WhatsIt icon in your Chrome toolbar to access the popup interface with the following options:

- **Analyze Page**: Analyzes the current page and opens the sidebar with results
- **Toggle Sidebar**: Shows or hides the sidebar interface
- **Quick Actions**:
  - **Summarize Selection**: Summarizes selected text on the page
  - **Rewrite Selection**: Opens the rewrite panel with the selected text
  - **Analyze Image**: Opens the image analysis panel

### Sidebar Interface

The sidebar provides three main tabs:

1. **Summary**: Displays a summary of the page content and key points
2. **Rewrite**: Allows you to rewrite text with different tones and simplification options
3. **Image Analysis**: Analyzes images from the page or uploaded by the user

## Technical Details

### Architecture

The extension follows a modular architecture with the following components:

- **Background Script**: Handles API calls to Chrome's Built-in AI APIs
- **Content Script**: Manages DOM manipulation, highlighting, and sidebar integration
- **Popup**: Provides quick access to extension features
- **Sidebar**: Displays analysis results and provides user interface for interactions
- **Utils**: Contains utility functions for DOM manipulation and content extraction

### Technologies Used

- **JavaScript**: Core programming language
- **Chrome Extension API**: For browser integration
- **Chrome's Built-in AI APIs**: For content analysis, text generation, and image analysis

## Development

### Project Structure

```
├── assets/               # Icons and images
├── background.js         # Background script for API handling
├── content/              # Content scripts
│   ├── content.css       # Styles for page modifications
│   └── content.js        # DOM manipulation and highlighting
├── manifest.json         # Extension manifest
├── popup/                # Popup interface
│   ├── popup.html        # Popup HTML structure
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup functionality
├── sidebar/              # Sidebar interface
│   ├── sidebar.html      # Sidebar HTML structure
│   ├── sidebar.css       # Sidebar styles
│   └── sidebar.js        # Sidebar functionality
└── utils/                # Utility functions
    └── dom-utils.js      # DOM manipulation utilities
```

## Future Enhancements

- **Custom Analysis Options**: Allow users to customize analysis parameters
- **Export Functionality**: Enable exporting of analysis results
- **Multi-language Support**: Add support for analyzing content in multiple languages
- **Advanced Image Analysis**: Enhance image analysis with object detection and OCR
- **User Preferences**: Save user preferences for analysis options

## License

This project is open source and available under the MIT License.

## Acknowledgements

This extension was developed for the Chrome Extension Hackathon, leveraging Chrome's Built-in AI APIs.