document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements with error checking
  const exportButton = document.getElementById('export-btn');
  const formatSelect = document.getElementById('format');
  const statusDiv = document.getElementById('status') || document.createElement('div');
  
  // Verify elements exist
  if (!exportButton || !formatSelect) {
    console.error('Required elements not found in popup.html');
    return;
  }

  if (!statusDiv.id) {
    statusDiv.id = 'status';
    document.querySelector('.container')?.appendChild(statusDiv);
  }

  exportButton.addEventListener('click', async function() {
    try {
      // Show loading state
      statusDiv.textContent = 'Extracting conversation...';
      exportButton.disabled = true;

      // Get selected format with error checking
      const format = formatSelect.value || 'markdown'; // Default to markdown if no value
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const fileName = `chat-export-${timestamp}`;

      // Get current tab
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (!tabs || !tabs[0]?.id) {
        throw new Error('No active tab found');
      }

      // Check if content script is ready
      if (!await isContentScriptReady(tabs[0].id)) {
        throw new Error('Content script not ready. Please refresh the page and try again.');
      }

      // Send message to content script
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'export'}, response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to get conversation data');
      }

      // Create and trigger download
      const content = formatConversation(response.data, format);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      try {
        await chrome.downloads.download({
          url: url,
          filename: `${fileName}.${format}`,
          saveAs: true
        });
      } finally {
        URL.revokeObjectURL(url); // Clean up the blob URL
      }

      statusDiv.textContent = 'Export successful!';
      
    } catch (error) {
      console.error('Export failed:', error);
      statusDiv.textContent = `Error: ${error.message}`;
    } finally {
      exportButton.disabled = false;
      // Clean up after 3 seconds
      setTimeout(() => {
        if (statusDiv.textContent.includes('successful')) {
          statusDiv.textContent = '';
        }
      }, 3000);
    }
  });
});

function formatConversation(conversation, format) {
  try {
    switch(format) {
      case 'markdown':
        return conversation.map(msg => 
          `## ${msg.role}\n${msg.content}\n`
        ).join('\n');
      case 'txt':
        return conversation.map(msg => 
          `${msg.role}:\n${msg.content}\n${'-'.repeat(40)}\n`
        ).join('\n');
      default:
        return JSON.stringify(conversation, null, 2);
    }
  } catch (error) {
    console.error('Format conversion failed:', error);
    throw new Error('Failed to format conversation');
  }
}

async function isContentScriptReady(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return response === 'pong';
  } catch (error) {
    return false;
  }
} 