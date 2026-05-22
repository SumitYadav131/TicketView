const fs = require('fs');

const csvData = `Venue Name,City,Country,Capacity,Region,Seat Map Availability,Data Granularity,Ticketmaster Integration,Notes
Sphere,Las Vegas,NV,USA,17600,North America,FULL,Seat-level coordinates,YES,Top grossing venue 2024-2025
Madison Square Garden,New York,NY,USA,20789,North America,FULL,Seat-level coordinates,YES,Complete interactive maps
The O2 Arena,London,UK,UK,20000,Europe,FULL,Seat-level coordinates,YES,Detailed seating with virtual venue views
United Center,Chicago,IL,USA,23500,North America,FULL,Seat-level coordinates,YES,Complete charts for all event types
Crypto.com Arena,Los Angeles,CA,USA,19079,North America,FULL,Seat-level coordinates,YES,Interactive maps
Wembley Stadium,London,UK,UK,90000,Europe,FULL,Seat-level coordinates,YES,Detailed block/row numbering system
Accor Arena,Paris,France,20300,Europe,FULL,Seat-level coordinates,YES,Interactive seating with seat views
Movistar Arena,Madrid,Spain,15000,Europe,FULL,Seat-level coordinates,YES,3D seatmap integration
Qudos Bank Arena,Sydney,Australia,21032,Oceania,FULL,Seat-level coordinates,YES,Detailed row and seat numbering
State Farm Arena,Atlanta,GA,USA,21000,North America,FULL,Seat-level coordinates,YES,Top 15 global venue 2025
Barclays Center,Brooklyn,NY,USA,19000,North America,FULL,Seat-level coordinates,YES,Top 2 venue 2025 Billboard
Estadio GNP Seguros,Mexico City,Mexico,65000,Latin America,FULL,Seat-level coordinates,YES,Top stadium globally
Allegiant Stadium,Las Vegas,NV,USA,65000,North America,FULL,Seat-level coordinates,YES,Top US entertainment venue
TD Garden,Boston,MA,USA,19580,North America,FULL,Seat-level coordinates,YES,Interactive seat selection available
American Airlines Center,Dallas,TX,USA,20000,North America,FULL,Seat-level coordinates,YES,Complete venue mapping
Chase Center,San Francisco,CA,USA,18064,North America,FULL,Seat-level coordinates,YES,Modern venue
Scotiabank Arena,Toronto,ON,Canada,19800,North America,FULL,Seat-level coordinates,YES,Complete interactive maps
Little Caesars Arena,Detroit,MI,USA,20332,North America,FULL,Seat-level coordinates,YES,Full seat-level data
Bridgestone Arena,Nashville,TN,USA,20000,North America,FULL,Seat-level coordinates,YES,Interactive seating charts
Ball Arena,Denver,CO,USA,20000,North America,FULL,Seat-level coordinates,YES,Complete venue mapping
Footprint Center,Phoenix,AZ,USA,18055,North America,FULL,Seat-level coordinates,YES,Full interactive seat maps
Smoothie King Center,New Orleans,LA,USA,18500,North America,FULL,Seat-level coordinates,YES,Detailed seating charts
Capital One Arena,Washington,DC,USA,20356,North America,FULL,Seat-level coordinates,YES,Complete interactive maps
Gainbridge Fieldhouse,Indianapolis,IN,USA,17923,North America,FULL,Seat-level coordinates,YES,Full seat-level data
Moda Center,Portland,OR,USA,19980,North America,FULL,Seat-level coordinates,YES,Interactive seating available
Climate Pledge Arena,Seattle,WA,USA,18100,North America,FULL,Seat-level coordinates,YES,New venue
Mercedes-Benz Stadium,Atlanta,GA,USA,71000,North America,FULL,Seat-level coordinates,YES,Stadium with detailed maps
SoFi Stadium,Los Angeles,CA,USA,70240,North America,FULL,Seat-level coordinates,YES,Premium venue
MetLife Stadium,East Rutherford,NJ,USA,82500,North America,FULL,Seat-level coordinates,YES,Full stadium mapping
AT&T Stadium,Arlington,TX,USA,80000,North America,FULL,Seat-level coordinates,YES,Complete seat-level data
Yankee Stadium,Bronx,NY,USA,54251,North America,FULL,Seat-level coordinates,YES,Complete interactive maps
Dodger Stadium,Los Angeles,CA,USA,56000,North America,FULL,Seat-level coordinates,YES,Full seat-level data
Fenway Park,Boston,MA,USA,37755,North America,FULL,Seat-level coordinates,YES,Detailed seating charts
Oracle Park,San Francisco,CA,USA,41915,North America,FULL,Seat-level coordinates,YES,Complete venue mapping
Citi Field,Queens,NY,USA,41922,North America,FULL,Seat-level coordinates,YES,Interactive seat selection
T-Mobile Park,Seattle,WA,USA,47929,North America,FULL,Seat-level coordinates,YES,Full digital mapping
Petco Park,San Diego,CA,USA,42445,North America,FULL,Seat-level coordinates,YES,Complete seat maps
Truist Park,Atlanta,GA,USA,41149,North America,FULL,Seat-level coordinates,YES,Modern venue with full data
Rogers Centre,Toronto,ON,Canada,49282,North America,PARTIAL,Section-level only,YES,Limited coordinate data
Busch Stadium,St. Louis,MO,USA,45494,North America,PARTIAL,Section-level only,YES,Basic mapping
PNC Park,Pittsburgh,PA,USA,38747,North America,PARTIAL,Section-level only,YES,Limited granularity
Camden Yards,Baltimore,MD,USA,45971,North America,PARTIAL,Section-level only,YES,Basic seat data
Guaranteed Rate Field,Chicago,IL,USA,40615,North America,PARTIAL,Section-level only,YES,Limited coordinate data
KeyBank Center,Buffalo,NY,USA,19070,North America,PARTIAL,Section-level only,YES,Limited granularity
Nationwide Arena,Columbus,OH,USA,18500,North America,PARTIAL,Section-level only,YES,Basic seat map data
Pechanga Arena,San Diego,CA,USA,16100,North America,PARTIAL,Section-level only,YES,Limited coordinate data
Soldier Field,Chicago,IL,USA,61500,North America,PARTIAL,Section-level only,YES,Limited granularity
Lumen Field,Seattle,WA,USA,69000,North America,PARTIAL,Section-level only,YES,Basic mapping
Lambeau Field,Green Bay,WI,USA,81441,North America,PARTIAL,Section-level only,YES,Limited seat coordinates
FTX Arena,Miami,FL,USA,19600,North America,PARTIAL,Section-level only,YES,Limited seat coordinate data`;

function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',');
  const venues = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const venue = {};
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim();
      let value = values[j] ? values[j].trim() : '';
      value = value.replace(/^"|"$/g, '');
      
      if (header === 'Capacity') {
        venue[header] = parseInt(value) || 0;
      } else if (header === 'Seat Map Availability') {
        // FIXED: Check if value is exactly "FULL"
        venue[header] = (value === 'FULL') ? 'full' : 'partial';
      } else if (header === 'Data Granularity') {
        venue[header] = (value === 'Seat-level coordinates') ? 'seat_level' : 'section_level';
      } else if (header === 'Ticketmaster Integration') {
        venue[header] = (value === 'YES');
      } else {
        venue[header] = value;
      }
    }
    
    venue.id = venue['Venue Name'].toLowerCase().replace(/[^a-z0-9]+/g, '_');
    venues.push(venue);
  }
  
  return venues;
}

const venues = parseCSV(csvData);

// Count full vs partial
let fullCount = 0;
let partialCount = 0;

for (const venue of venues) {
  if (venue['Seat Map Availability'] === 'full') {
    fullCount++;
  } else {
    partialCount++;
  }
}

const database = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalVenues: venues.length,
  fullDataVenues: fullCount,
  partialDataVenues: partialCount,
  allVenues: venues
};

fs.writeFileSync('viewme-venues-db.json', JSON.stringify(database, null, 2));
console.log(`✅ Success! Converted ${venues.length} venues to JSON`);
console.log(`   - Full data venues: ${fullCount}`);
console.log(`   - Partial data venues: ${partialCount}`);
console.log(`   - File saved: viewme-venues-db.json`);