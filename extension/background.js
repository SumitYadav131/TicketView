// background.js - Service worker for ViewMe extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('ViewMe Tickets extension installed');
  
  // Initialize storage with default settings
  chrome.storage.sync.set({
    enabled: true,
    autoShowPreview: false,
    savedVenues: []
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_VENUE_DATA') {
    // Fetch venue data from our database
    fetchVenueData(request.venueName).then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'SAVE_PREVIEW') {
    // Save user-uploaded seat preview
    saveSeatPreview(request.previewData).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function fetchVenueData(venueName) {
  // In production, fetch from your API
  // For now, return mock data
  return {
    venue: venueName,
    has3DPreview: true,
    cameraPositions: {
      'lower': { x: 2, y: 2.5, z: 5 },
      'upper': { x: 0, y: 4.5, z: 8 },
      'side': { x: -3, y: 2.8, z: 6 }
    }
  };
}

async function saveSeatPreview(previewData) {
  // Store in Chrome storage sync (limited to 100KB)
  // For production, send to your backend API
  const { seatPreviews } = await chrome.storage.sync.get(['seatPreviews']);
  const previews = seatPreviews || [];
  previews.push({
    ...previewData,
    timestamp: Date.now()
  });
  await chrome.storage.sync.set({ seatPreviews: previews.slice(-100) });
}