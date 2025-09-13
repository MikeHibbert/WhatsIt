# WhatsIt Chrome Extension Specification

## Project Overview
**WhatsIt** is a Chrome extension that enhances web browsing by automatically highlighting key points on a webpage and displaying a concise summary in a right-hand sidebar. Users can click summary points to navigate to corresponding highlighted sections, streamlining comprehension of lengthy content. The extension leverages Chrome's Built-in AI APIs (powered by Gemini Nano) to process content client-side, ensuring privacy, offline functionality, and efficiency. This document outlines the functional and technical requirements for building WhatsIt for the Google Chrome Built-in AI Challenge 2025.

## Functional Requirements

### 1. Content Analysis and Highlighting
- **Objective**: Identify and visually highlight the main points of a webpage's text content.
- **Features**:
  - Scan webpage text (e.g., headers, paragraphs, lists) using JavaScript DOM manipulation.
  - Use the **Summarizer API** to extract key sentences or bullet points based on semantic importance (e.g., headers, bolded text, or frequently mentioned concepts).
  - Apply a visual "highlighter" effect (yellow background, CSS styling) to identified key text sections on the page.
  - Ensure highlights are toggleable (e.g., via a button in the extension popup) to avoid cluttering the page.
- **User Interaction**: Allow users to click highlighted text to briefly emphasize it (e.g., temporary border or animation).

### 2. Sidebar Summary Display
- **Objective**: Present a concise summary of the webpage in a right-hand sidebar.
- **Features**:
  - Generate a summary using the **Summarizer API** (e.g., 3-5 bullet points or a short paragraph).
  - Optionally use the **Rewriter API** to refine the summary for clarity or adjust tone (e.g., simpler language for accessibility).
  - Display the summary in a fixed-position sidebar (CSS) on the right side of the browser window, collapsible to avoid obstructing content.
  - Make summary points clickable, scrolling the page to the corresponding highlighted section.
- **User Interaction**: Provide a toggle to show/hide the sidebar and a refresh button to re-run analysis if the page content changes dynamically.

### 3. Optional Multimodal Enhancement
- **Objective**: Enhance analysis with visual context for the Best Multimodal AI Application prize.
- **Features**:
  - Use the **Prompt API** with multimodal support to analyze images (e.g., infographics, charts) on the page and include relevant insights in the summary (e.g., "Chart shows 20% growth in sales").
  - Ensure fallback to text-only analysis if images are absent or unsupported.

### 4. User Experience
- **Objective**: Ensure intuitive and seamless interaction.
- **Features**:
  - Minimal setup: Activate via a browser action (extension icon) with a simple on/off toggle.
  - Responsive design: Sidebar and highlights adapt to various screen sizes (desktop and mobile Chrome).
  - Offline functionality: All processing via client-side APIs, no server dependency.
  - Accessibility: High-contrast highlights, keyboard-navigable sidebar, and screen-reader-compatible summary text.

## Technical Requirements

### 1. Tech Stack
- **Platform**: Chrome Extension (compatible with Chrome browser on desktop and mobile).
- **APIs**:
  - **Summarizer API**: Core for extracting main points and generating summaries.
  - **Rewriter API**: Optional for refining summary text.
  - **Prompt API**: Optional for multimodal image analysis.
- **Frontend**:
  - JavaScript for DOM manipulation and API calls.
  - HTML/CSS for sidebar UI and highlight styling.
  - Chrome Extension APIs (e.g., `chrome.runtime`, `chrome.tabs`) for integration.
- **Development Tools**:
  - Chrome DevTools for debugging.
  - VS Code or similar for coding.
  - GitHub for version control and public repo.

### 2. Architecture
- **Manifest**: Use `manifest.json` (V3) for Chrome Extension setup, defining permissions (`activeTab`, `scripting`) and browser action.
- **Content Script**: Inject JavaScript to:
  - Extract page text via DOM traversal.
  - Call Summarizer API to identify key points.
  - Apply CSS highlights to selected DOM elements.
- **Background Script**: Handle API calls to Summarizer/Rewriter/Prompt APIs for processing.
- **Popup/Sidebar**: HTML/CSS for the sidebar UI, rendered as a fixed-position div, with JavaScript for dynamic summary updates and click-to-scroll functionality.
- **Optional**: Service worker for offline caching of API responses (if supported).

### 3. Open Source
- Host code in a public GitHub repository with an open-source license (e.g., MIT).
- Include a `README.md` with:
  - Setup instructions (e.g., load unpacked extension in Chrome).
  - Dependencies (none beyond Chrome's built-in APIs).
  - Testing instructions for judges (e.g., test on sample pages like news articles).
- Ensure all code is original for the 2025 hackathon (no reuse from 2024).

### 4. Demo and Submission
- **Demo Video**:
  - <3 minutes, uploaded to YouTube/Vimeo (publicly accessible).
  - Show WhatsIt in action: Load a webpage, activate the extension, display highlights, show sidebar summary, and demonstrate clicking a summary point to scroll to a highlight.
  - Recorded on Chrome browser (desktop or mobile).
- **Access**: Provide a public URL to a test page or published extension for judging. Include login credentials if needed (though public access is preferred).
- **Text Description**: Submit via Devpost, detailing:
  - Features: Highlighting, sidebar summary, optional multimodal image analysis.
  - APIs used: Summarizer, Rewriter (optional), Prompt (optional).
  - Problem solved: Simplifies comprehension of long web content for students, researchers, or casual readers.
- **Optional Feedback**: Submit API feedback via the provided Google Form for the Most Valuable Feedback prize.

## Non-Functional Requirements
- **Performance**: Process pages in <5 seconds for typical articles (~1000 words).
- **Privacy**: All processing client-side; no user data leaves the device.
- **Scalability**: Works on diverse webpages (e.g., news, blogs, wikis) and handles dynamic content.
- **Compatibility**: Supports Chrome on desktop (Windows, macOS, Linux) and mobile (Android).
- **Error Handling**: Graceful fallback if APIs fail (e.g., display "Unable to summarize" if content is too short).

## Deliverables
- Chrome Extension codebase (JavaScript, HTML, CSS, `manifest.json`).
- Public GitHub repository with MIT license and detailed `README.md`.
- Demo video (<3 minutes) showing functionality.
- Text description for Devpost submission.
- Optional feedback form for API experience.

## Timeline
- **Submission Deadline**: October 31, 2025 (per hackathon details).
- **Development Plan**:
  - Week 1: Set up extension, integrate Summarizer API, prototype highlighting.
  - Week 2: Build sidebar UI, add click-to-scroll, test Rewriter API.
  - Week 3: Optional Prompt API for images, polish UX, test offline.
  - Week 4: Record demo, finalize GitHub repo, submit to Devpost.

## Judging Criteria Alignment
- **Functionality**: Scalable to various webpages, uses Summarizer/Rewriter/Prompt APIs effectively.
- **Purpose**: Improves user journey by simplifying web content comprehension.
- **Content**: Creative highlighting mimics a physical highlighter; clean sidebar design.
- **User Experience**: Intuitive toggle, responsive UI, accessible.
- **Technological Execution**: Showcases Chrome's AI APIs for real-time, offline processing.