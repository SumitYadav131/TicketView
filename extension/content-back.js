// content.js - Injects the ViewMe button into ticket sites
(function() {
  'use strict';
  
  let widgetLoaded = false;
  let currentWidget = null;
  
  // Detect which ticket site we're on
  function detectSite() {
    const hostname = window.location.hostname;
    if (hostname.includes('ticketmaster.com')) return 'ticketmaster';
    if (hostname.includes('stubhub.com')) return 'stubhub';
    if (hostname.includes('seatgeek.com')) return 'seatgeek';
    if (hostname.includes('vividseats.com')) return 'vividseats';
    return 'unknown';
  }
  
  const site = detectSite();
  
  // Site-specific selectors for seat elements
  const selectors = {
    ticketmaster: {
      seatContainer: '[data-section], [data-row], [data-seat]',
      sectionAttr: 'data-section',
      rowAttr: 'data-row',
      seatAttr: 'data-seat',
      priceSelector: '[data-price], .price-text'
    },
    stubhub: {
      seatContainer: '[data-section-id], .section-row',
      sectionAttr: 'data-section-id',
      rowAttr: 'data-row-name',
      seatAttr: 'data-seat-number',
      priceSelector: '.price-amount'
    }
  };
  
  // Parse venue name from page
  function getVenueFromPage() {
    // Try multiple selectors to find venue name
    const venueSelectors = [
      '[data-venue-name]',
      '.venue-name',
      '.event-venue',
      '.location-name',
      'h1 + .venue',
      '.VenueName'
    ];
    
    for (const selector of venueSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    }
    
    // Fallback: parse from URL
    const urlPath = window.location.pathname;
    const venueMatch = urlPath.match(/venue\/([^\/]+)/i);
    if (venueMatch) {
      return decodeURIComponent(venueMatch[1].replace(/-/g, ' '));
    }
    
    return null;
  }
  
  // Create and inject ViewMe button
  function createViewMeButton(seatData) {
    const button = document.createElement('button');
    button.className = 'viewme-preview-btn';
    button.innerHTML = `
      <span class="viewme-icon">👁️</span>
      <span class="viewme-text">Preview with ViewMe</span>
    `;
    button.title = 'See exact view from this seat';
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      showSeatPreview(seatData);
    });
    
    return button;
  }
  
  // Find all seat elements and add buttons
  function addPreviewButtons() {
    const siteSelectors = selectors[site];
    if (!siteSelectors) return;
    
    const seatElements = document.querySelectorAll(siteSelectors.seatContainer);
    const venue = getVenueFromPage();
    
    seatElements.forEach((element, index) => {
      // Avoid duplicate buttons
      if (element.querySelector('.viewme-preview-btn')) return;
      
      const section = element.getAttribute(siteSelectors.sectionAttr);
      const row = element.getAttribute(siteSelectors.rowAttr);
      const seatNum = element.getAttribute(siteSelectors.seatAttr);
      
      if (section && row) {
        const seatData = { venue, section, row, seat: seatNum };
        const button = createViewMeButton(seatData);
        
        // Insert button near the seat element
        if (element.parentNode) {
          element.parentNode.insertBefore(button, element.nextSibling);
        }
      }
    });
  }
  
  // Show the 3D seat preview widget
  function showSeatPreview(seatData) {
    // Remove existing widget if any
    if (currentWidget) {
      currentWidget.remove();
    }
    
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'viewme-widget-container';
    widgetContainer.className = 'viewme-widget-container';
    widgetContainer.innerHTML = `
      <div class="viewme-widget-header">
        <span class="viewme-widget-title">ViewMe Tickets - Seat Preview</span>
        <button class="viewme-widget-close">×</button>
      </div>
      <div class="viewme-widget-content">
        <div class="viewme-loading">Loading 3D preview for ${seatData.section || 'Section'} ${seatData.row || ''}...</div>
        <iframe id="viewme-preview-frame" src="${chrome.runtime.getURL('viewme-widget.html')}" style="width:100%;height:100%;border:none;display:none;"></iframe>
      </div>
      <div class="viewme-widget-footer">
        <span>📍 ${seatData.venue || 'Venue'} | Section ${seatData.section || '?'} | Row ${seatData.row || '?'}</span>
        <button class="viewme-share-btn">📸 Share your view</button>
      </div>
    `;
    
    document.body.appendChild(widgetContainer);
    currentWidget = widgetContainer;
    
    // Add close functionality
    const closeBtn = widgetContainer.querySelector('.viewme-widget-close');
    closeBtn.onclick = () => widgetContainer.remove();
    
    // Load the preview
    const iframe = widgetContainer.querySelector('#viewme-preview-frame');
    const loadingDiv = widgetContainer.querySelector('.viewme-loading');
    
    iframe.onload = () => {
      loadingDiv.style.display = 'none';
      iframe.style.display = 'block';
      
      // Send seat data to iframe
      iframe.contentWindow.postMessage({
        type: 'SET_SEAT',
        data: seatData
      }, '*');
    };
    
    // Share button
    const shareBtn = widgetContainer.querySelector('.viewme-share-btn');
    shareBtn.onclick = () => {
      prompt('Share your actual view from this seat (upload photo URL):', 
             'https://example.com/your-seat-photo.jpg');
    };
    
    // Make widget draggable
    makeDraggable(widgetContainer);
  }
  
  // Make widget draggable
  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.viewme-widget-header');
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  
  // Observe DOM changes for dynamically loaded seat content
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldUpdate = true;
        break;
      }
    }
    if (shouldUpdate) {
      setTimeout(addPreviewButtons, 500);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial load
  setTimeout(addPreviewButtons, 1000);
})();