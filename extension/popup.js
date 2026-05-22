document.addEventListener('DOMContentLoaded', async () => {

  try {

    // SAME PATH
    const response = await fetch('viewme-venues-db.json');

    const data = await response.json();

    console.log('Venue DB Loaded:', data);

    // Adjust based on actual JSON structure
    const venues = data.allVenues || data.venues || [];

    // Example:
    document.getElementById('venueCount').innerText = venues.length;

    const venueList = document.getElementById('venueList');

    venueList.innerHTML = '';

    venues.forEach((venue) => {

      const item = document.createElement('div');

      item.className = 'venue-item';

      item.innerHTML = `
        <div class="venue-name">
          ${venue["Venue Name"] || venue.name}
        </div>

        <div class="venue-location">
          ${venue.City || ''} ${venue.Country || ''}
        </div>
      `;

      venueList.appendChild(item);

    });

  } catch (err) {

    console.error('Failed loading venue DB:', err);

  }

});