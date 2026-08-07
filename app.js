const express = require('express');
const path = require('path');
const app = express();
//const port = 3000;
const PORT = process.env.PORT || 3000;
const fs = require('fs').promises;

function makeDb() {
  const lastUpdated = Date.now() // Track when data last changed
  //const roomCleaningstateById = {};
  const roomstateById = {};
  const roomOccupancystateById = {};
  //const roomBookingDatesByIdByDateString = {};
  const roomCsvOccupancystateByIdByDateString = {};
  //const roomOccupancystateByIdByDateString = {};

  const roomNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 27];

  roomNumbers.forEach(i => {
    //roomCleaningstateById[`Room_${i}`] = 'Needs Cleaning';
    roomstateById[`Room_${i}`] = 'state_Ready';
    roomOccupancystateById[`Room_${i}`] = 'n/a';
    //roomBookingDatesByIdByDateString[`Room_${i}`] = {};
    roomCsvOccupancystateByIdByDateString[`Room_${i}`] = {};
    //roomOccupancystateByIdByDateString[`Room_${i}`] = {};
  });

  const roomOccupancystateByDateString = {};
  //const roomBookingDatesByDateString = {};

  const csvData = {};

  //return { lastUpdated, roomCleaningstateById, roomOccupancystateById, roomBookingDatesByIdByDateString, roomOccupancystateByIdByDateString, roomCsvOccupancystateByIdByDateString, roomOccupancystateByDateString, roomBookingDatesByDateString, csvFiles };
  return { lastUpdated, roomstateById, roomOccupancystateById, roomCsvOccupancystateByIdByDateString, roomOccupancystateByDateString, csvData };
};

const db = makeDb();

const occupancystateMap = { "X": "Occupied", "XX": "Checking Out", "XY": "Turnover", "-": "Unoccupied", "Z": "Checking In" };

function removeDuplicateLines(csvString) {
  // Split the string into individual lines
  const lines = csvString.split(/\r?\n/);

  // Use a Set to store unique lines and preserve order
  const uniqueLines = [...new Set(lines)];

  // Join the unique lines back into a single CSV string
  return uniqueLines.join('\n');
}

function processCsv(csvString) {
  // 0. Remove duplicate lines
  const csvStringWithoutDuplicateLines = removeDuplicateLines(csvString)
  // 1. Extract and save the text inside the double quotes (the legend)
  const regex = /"([^"]*)"/g;
  const savedLegend = [...csvStringWithoutDuplicateLines.matchAll(regex)].map(match => match[1]);

  // 2. Remove the double quotes and the text inside them from the string
  const cleanedString = csvStringWithoutDuplicateLines.replace(regex, '');

  //const rows = csvString.trim().split("\n");
  const rows = cleanedString.trim().split("\n");

  let otherRows = [];
  let dataRows = [];
  rows.forEach((row, index) => {
    // replace repeating commas with one comma and replace single comma at the start and end of row (this removes empty cells on that row)
    // also replace empty spaces with underscores ('Room 1' becomes 'Room_1')
    const cleanRow = row.replace(/,+/g, ',').trim().replace(/(^,)|(,$)/g, "").replace(" ", "_");
    //if (cleanRow.includes("Room_")||cleanRow.includes("Jan-")||cleanRow.includes("Feb-")||cleanRow.includes("Mar-")||cleanRow.includes("Apr-")||cleanRow.includes("May-")||cleanRow.includes("Jun-")||cleanRow.includes("Jul-")||cleanRow.includes("Aug-")||cleanRow.includes("Sep-")||cleanRow.includes("Oct-")||cleanRow.includes("Nov-")||cleanRow.includes("Dec-")){
    if (cleanRow.includes("Room_") || cleanRow.includes("1,2,3")) {
      dataRows.push(cleanRow)
    } else if (cleanRow) {
      otherRows.push(cleanRow)
    }
  });
  const headers = dataRows[0].split(',').map(header => header.trim());

  // Get eg Jun and 26 from Jun-26
  const parts = headers[0].split('-').map(part => part.trim());

  const headersSliced = headers.slice(1);
  for (let i = 0; i < headersSliced.length; i++) {
    // Create date string, eg Jun 1, 2026
    const mmm_dd_yyyy = `${parts[0]} ${parseInt(headersSliced[i], 10)}, 20${parts[1]}`;
    //headersSliced[i]= (new Date(mmm_dd_yyyy).toISOString()).split('T')[0] ; 
    //headersSliced[i]= new Date(mmm_dd_yyyy).toISOString();
    headersSliced[i] = dateToDateString(new Date(mmm_dd_yyyy));
  }
  dataRows.slice(1).forEach(row => {
    const values = row.split(',').map(value => value.trim());
    const valuesSliced = values.slice(1);

    headersSliced.forEach((header, index) => {
      db.roomCsvOccupancystateByIdByDateString[values[0]][header] = valuesSliced[index];
    });
  });

  let csvMonth = otherRows[4];
  let csvDateGenerated = otherRows[1];

  let message = "";
  if (Object.hasOwn(db.csvData, csvMonth)) {
    message = `Replaced existing csv for month ${csvMonth} with csv generated ${csvDateGenerated}`;

  } else {
    message = `Uploaded csv for month ${csvMonth} generated ${csvDateGenerated}`;
  }
  //db.csvFiles[csvMonth] = { 'csvDateGenerated': csvDateGenerated, 'dateStringArray': headersSliced, csvString: csvString };
  db.csvData[csvMonth] = { 'csvDateGenerated': csvDateGenerated, 'dateStringArray': headersSliced, csvString: csvString };

  //fillRoomOccupancystateByIdByDateStringForLastTwoMonths();
  fillRoomOccupancyWithCsvData(csvMonth);
  return message;
}
function fillRoomOccupancyWithCsvData(csvMonth) {
  //function fillRoomOccupancystateByIdByDateStringForLastTwoMonths() {
  // let dateStringArray = Object.values(db.csvData).at(-1).dateStringArray;
  // if (Object.values(db.csvData).at(-2) !== undefined) {
  //   dateStringArray = [...Object.values(db.csvData).at(-2).dateStringArray, ...Object.values(db.csvData).at(-1).dateStringArray];
  // };

  let dateStringArray = db.csvData[csvMonth].dateStringArray;

  dateStringArray.forEach((dateString, index) => {
    db.roomOccupancystateByDateString[dateString] = {};
    //db.roomBookingDatesByDateString[dateString] = {};
  });
  Object.entries(db.roomOccupancystateById).forEach(([roomId, value]) => {
    dateStringArray.forEach((dateString, index) => {
      let occupancy = db.roomCsvOccupancystateByIdByDateString[roomId][dateString];
      // let from = "";
      // let to = "";
      // let divider = " -> ";
      // if (occupancy === '-') {
      //   divider = "";

      // } else if (occupancy === 'XX') {
      //   from = findArrivalDate(roomId, dateString);
      //   to = shortDate(new Date(dateString));

      // } else if (occupancy === 'XY') {
      //   from = shortDate(new Date(dateString));
      //   to = findDepartureDate(roomId, dateString);
      // } else { // it is 'X'
      //   from = findArrivalDate(roomId, dateString);
      //   to = findDepartureDate(roomId, dateString);
      //   if (from !== '?' && from === shortDate(new Date(dateString))) {
      //     occupancy = "Z";
      //   };

      // }
      let occupancystate = occupancystateMap[occupancy];
      //let bookingDates = `${from}${divider}${to}`;
      //db.roomOccupancystateByIdByDateString[roomId][dateString] = occupancystate;
      //db.roomBookingDatesByIdByDateString[roomId][dateString] = bookingDates;
      db.roomOccupancystateByDateString[dateString][roomId] = occupancystate;
      //db.roomBookingDatesByDateString[dateString][roomId] = bookingDates;
    });
  });
}

function shortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
function dateToDateString(date) {
  return date.toLocaleDateString('en-US', {
    //weekday: 'short', 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
function findDepartureDate(roomId, dateString) {
  let movingDate = new Date(dateString);
  let movingDateString = '';
  let occupancy = '';
  while (true) {
    movingDate.setDate(movingDate.getDate() + 1); // Increments by 1 day
    movingDateString = dateToDateString(movingDate);
    occupancy = db.roomCsvOccupancystateByIdByDateString[roomId][movingDateString];
    if (occupancy === undefined) {
      return '?';
    } else if (occupancy === 'XX' || occupancy === 'XY') {
      return shortDate(movingDate);
    }
  };
}
function findArrivalDate(roomId, dateString) {
  let movingDate = new Date(dateString);
  let movingDateString = '';
  let occupancy = '';
  while (true) {
    movingDate.setDate(movingDate.getDate() - 1); // Increments by 1 day
    movingDateString = dateToDateString(movingDate);
    occupancy = db.roomCsvOccupancystateByIdByDateString[roomId][movingDateString];
    if (occupancy === undefined) {
      return '?';
    } else if (occupancy === 'XX' || occupancy === '-') {
      movingDate.setDate(movingDate.getDate() + 1); // Increments by 1 day
      return shortDate(movingDate);
    } else if (occupancy === 'XY') {
      return shortDate(movingDate);
    };
  };
}
app.use(express.static(path.join(__dirname, 'public')));


function assignCleaningstateToTurnoverAndCheckedOutRooms(){
  const currentDate = new Date();
  const currentDateString = dateToDateString(currentDate);
  if (Object.hasOwn(db.roomOccupancystateByDateString, currentDateString)){
    Object.entries(db.roomOccupancystateByDateString[currentDateString]).forEach(([key, value]) => {
      if (value === 'Turnover') {
        db.roomstateById[key] = 'State_Cleaning_Today';
      } else if (value === 'Checking Out') {
        db.roomstateById[key] = 'State_Cleaning';
      }
    });
  }
}

app.get('/retrieve-room-state', (req, res) => {
  const clientLastUpdated = parseInt(req.query.lastUpdated, 10);


  // Get the current date and set the time to 00:00:00 (start of today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Check if the last update occurred before today
  if (db.lastUpdated < today) {
    assignCleaningStateToTurnoverAndCheckedOutRooms();
    db.lastUpdated = Date.now();
  }

  if (clientLastUpdated && clientLastUpdated >= db.lastUpdated) {
    return res.status(304).end();
  }
  res.status(200).json({
    //data: response,
    data: db.roomstateById,
    lastUpdated: db.lastUpdated,
  });
});
//app.use(express.urlencoded({ extended: true }));
app.get('/retrieve-occupancy-for-date', (req, res) => {
  const dateString = req.query.dateString;

  console.log('Received request for occupancy for date: ', dateString);

  res.status(200).json({
    //data: response,
    data: db.roomOccupancystateByDateString[dateString],
  });
});
// Middleware
app.use(express.json()); // Parses incoming JSON payloads

// POST Route
app.post('/update-state', (req, res) => {
  const receivedData = req.body;

  console.log('Data received from client:', receivedData.roomId, receivedData.state);

  db.roomstateById[receivedData.roomId] = receivedData.state;

  db.lastUpdated = Date.now();

  // Send a success response back to the client
  res.status(200).json({
    message: 'Data received successfully!',
    //yourData: receivedData
  });
});

//app.use(express.json());
app.use(express.text());
app.post('/upload-csv', (req, res) => {

  res.type('text/plain');

  const message = processCsv(req.body);

  assignCleaningstateToTurnoverAndCheckedOutRooms();
  db.lastUpdated = Date.now()

  if (message) {
    //return res.status(200).send(`Uploaded csv '${csvThing.csvData.csvFirstLineAkaTitle}' generated '${csvThing.csvData.csvSecondLineAkaDate}' with filter criteria '${csvThing.csvData.csvFourthlineAkaFilter}'`);
    return res.status(200).send(message)
  } else {
    // Return 404 if the resource doesn't exist
    return res.status(404).send(message);
  }
});
//app.listen(port, () => {
  app.listen(PORT, () => {
  //console.log(`Express app listening at http://localhost:${port}`);
  console.log(`Server running on port ${PORT}`);
});

//for future database
app.post('/api/save-object', async (req, res) => {
  try {
    const dataObject = req.body; // The object sent in the request body
    const filePath = path.join(__dirname, 'data.json');

    // 1. Convert the object to a formatted JSON string (2 spaces indent)
    const jsonString = JSON.stringify(dataObject, null, 2);

    // 2. Asynchronously write the data to the filesystem
    await fs.writeFile(filePath, jsonString, 'utf-8');

    // 3. Send success response
    return res.status(200).json({
      success: true,
      message: 'Object saved to file successfully!'
    });
  } catch (error) {
    console.error('Failed to save file:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving data.'
    });
  }
});
