# WhatsIt Chrome Extension - Manual Testing Checklist

## Installation and Setup
- [ ] Extension installs correctly from the Chrome Web Store or as an unpacked extension
- [ ] Extension icon appears in the Chrome toolbar
- [ ] Extension popup opens when clicking the icon

## Basic Functionality
- [ ] Extension activates on compatible web pages
- [ ] Toggle button appears in the correct position
- [ ] Keyboard shortcut (Alt+W) correctly toggles the sidebar

## Content Analysis
- [ ] Text extraction works on various page layouts
  - [ ] Simple text pages
  - [ ] Complex layouts with multiple columns
  - [ ] Pages with mixed content (text, images, videos)
- [ ] Summarization produces relevant content summaries
- [ ] Key points are correctly identified and highlighted
- [ ] Importance levels are visually distinguishable

## Sidebar Functionality
- [ ] Sidebar appears and disappears smoothly
- [ ] Sidebar contains accurate page summary
- [ ] Key points are listed in order of importance
- [ ] Refresh button updates the summary with latest page content
- [ ] Sidebar is scrollable for long summaries
- [ ] Sidebar maintains state when navigating within the same page

## Highlight Interaction
- [ ] Clicking on key points in sidebar highlights corresponding text on page
- [ ] Highlighted text is clearly visible
- [ ] Hover effects work correctly on highlighted text
- [ ] Multiple highlights can be active simultaneously
- [ ] Highlights can be toggled on/off

## Image Analysis
- [ ] Images on the page can be analyzed
- [ ] Image analysis provides relevant descriptions
- [ ] Image analysis results appear in the sidebar

## Text Rewriting
- [ ] Text can be selected and rewritten
- [ ] Different tone options work correctly (casual, formal, friendly)
- [ ] Simplified text maintains the original meaning

## Performance
- [ ] Extension loads quickly on page navigation
- [ ] Summarization completes in a reasonable time
- [ ] UI remains responsive during processing
- [ ] No noticeable page slowdown when extension is active

## Cross-browser Compatibility
- [ ] Works in Chrome stable
- [ ] Works in Chrome beta (if applicable)
- [ ] Works in Chrome Canary (if applicable)
- [ ] Works in Chromium-based browsers (Edge, Brave, etc.)

## Accessibility
- [ ] Sidebar is navigable via keyboard
- [ ] Focus states are visible for interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen readers can access sidebar content
- [ ] Extension respects user font size settings

## Error Handling
- [ ] Graceful error messages when summarization fails
- [ ] Appropriate feedback when no meaningful content is found
- [ ] Recovery from failed API calls
- [ ] Handles page content changes appropriately

## Edge Cases
- [ ] Works with dynamically loaded content
- [ ] Handles very large pages without crashing
- [ ] Functions correctly on pages with iframes
- [ ] Behaves appropriately on pages with minimal text
- [ ] Manages pages in languages other than English

## Security and Privacy
- [ ] No sensitive data is collected or transmitted
- [ ] Extension functions in incognito mode (if applicable)
- [ ] No console errors or warnings are generated

## Notes
- Add specific test cases or issues encountered during testing
- Document browser versions and operating systems tested
- Note any performance metrics or observations