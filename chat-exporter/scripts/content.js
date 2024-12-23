console.log('Chat Exporter loaded');

// Immediately log that content script is loading
console.log('Chat Exporter content script starting...');

// Function to detect which chat platform we're on
function detectChatPlatform() {
  const hostname = window.location.hostname;
  console.log('Checking hostname:', hostname);
  
  if (hostname === 'chat.openai.com') {
    return 'chatgpt';
  } else if (hostname === 'claude.ai') {
    return 'claude';
  }
  return null;
}

// Function to extract conversation based on platform
function extractConversation() {
  const platform = detectChatPlatform();
  console.log('Detected platform:', platform);
  
  if (!platform) {
    return { error: 'Not a supported chat platform' };
  }

  try {
    const conversation = [];
    if (platform === 'chatgpt') {
      const threads = document.querySelectorAll('[data-testid="conversation-turn"]');
      console.log('Found threads:', threads.length);
      
      threads.forEach((thread, index) => {
        const role = thread.querySelector('.text-red-500') ? 'User' : 'Assistant';
        const content = thread.querySelector('.markdown')?.textContent || '';
        console.log(`Processing message ${index + 1}:`, { role, contentLength: content.length });
        
        conversation.push({ role, content });
      });
    } else if (platform === 'claude') {
      const messages = document.querySelectorAll('.prose, .whitespace-pre-wrap');
      console.log('Found Claude messages:', messages.length);
      
      messages.forEach((message, index) => {
        const isHuman = message.closest('[class*="human"]') !== null;
        const role = isHuman ? 'User' : 'Assistant';
        const content = message.textContent?.trim() || '';
        
        console.log(`Processing Claude message ${index + 1}:`, { role, contentLength: content.length });
        
        if (content) {
          conversation.push({ role, content });
        }
      });
    }
    
    return { data: conversation };
  } catch (error) {
    console.error('Error in extractConversation:', error);
    return { error: error.message };
  }
}

// Add message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  
  if (request.action === 'ping') {
    sendResponse('pong');
    return true;
  }
  
  if (request.action === 'export') {
    const result = extractConversation();
    console.log('Extraction result:', result);
    sendResponse(result);
    return true;
  }
  return true; // Keep message channel open for async response
});

// Log that content script has fully loaded
console.log('Chat Exporter content script loaded on:', window.location.hostname);

console.log('Content script loaded on:', window.location.hostname); 