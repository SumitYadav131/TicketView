// content.js - Injects the ViewMe button into ticket sites

let venueDB = {};
(function () {
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
      seatContainer: '[data-component="svg__seat"]',
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
    const selectors = [
      '[data-testid="venue-name"]',
      '[class*="venue"]',
      '[class*="location"]',
      'h1',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 3) {
        return el.textContent.trim();
      }
    }

    return "Unknown Venue";
  }

  function getSectionFromUI() {
    const el = document.querySelector('[class*="section"], [aria-label*="Section"]');
    if (el) return el.textContent.match(/\d+/)?.[0] || "114";
    return "114"; // fallback
  }

  function getRowFromUI() {
    const el = document.querySelector('[class*="row"], [aria-label*="Row"]');
    if (el) return el.textContent.match(/[A-Z]+/)?.[0] || "A";
    return "A"; // fallback
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

    seatElements.forEach((element) => {

      // prevent duplicate binding
      if (element.dataset.viewmeBound) return;
      element.dataset.viewmeBound = "true";

      element.addEventListener("click", () => {

        const venue = getVenueFromPage();

        const seatNum = element.getAttribute("data-seat-name") || element.getAttribute("data-seat");

        const aria = element.getAttribute("aria-label") || "";

        // Example aria-label:
        // "Section 114 Row A Seat 9 Price $120"

        const sectionMatch = aria.match(/Section\s*(\d+)/i);
        const rowMatch = aria.match(/Row\s*([A-Z]+)/i);

        const section = sectionMatch ? sectionMatch[1] : "Unknown";
        const row = rowMatch ? rowMatch[1] : "Unknown";

        const seatData = {
          venue,
          section,
          row,
          seat: seatNum
        };

        console.log("Seat clicked:", seatData);

        showSeatPreview(seatData);
      });

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
    const widgetURL = chrome?.runtime?.getURL
      ? chrome.runtime.getURL('viewme-widget.html')
      : 'viewme-widget.html';
    widgetContainer.innerHTML = `
      <div class="viewme-widget-header">
        <span class="viewme-widget-title">ViewMe Tickets - Seat Preview</span>
        <button class="viewme-widget-close">×</button>
      </div>
      <div class="viewme-widget-content">
        <div class="viewme-loading">Loading 3D preview for ${seatData.section || 'Section'} ${seatData.row || ''}...</div>
<iframe id="viewme-preview-frame" src="${widgetURL}" style="width:100%;height:100%;border:none;display:none;"></iframe>      </div>
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