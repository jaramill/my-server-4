const currentDate = new Date();
//const currentDate = new Date("Jul 13, 2026");

const selectedDate = new Date(currentDate.getTime());

const roomCoordinates = {
	"Room_1": {"coords":[450,198],"name": "#1","beds":2},
	"Room_2": {"coords":[510,198],"name": "#2","beds":2},
	"Room_3": {"coords":[450,126],"name": "#3","beds":2},
	"Room_4": {"coords":[510,126],"name": "#4","beds":2},
	"Room_5": {"coords":[510,17],"name": "#5","beds":2},
	"Room_6": {"coords":[450,17],"name": "#6","beds":2},
	"Room_7": {"coords":[375,90],"name": "#7","beds":2},
	"Room_8": {"coords":[375,18],"name": "#8","beds":2},
	"Room_9": {"coords":[315,90],"name": "#9","beds":2},
	"Room_10": {"coords":[315,18],"name": "#10","beds":2},
	"Room_11": {"coords":[255,90],"name": "#11","beds":2},
	"Room_12": {"coords":[255,18],"name": "#12","beds":2},
	"Room_13": {"coords":[450,435],"name": "#13","beds":1},
	"Room_14": {"coords":[510,435],"name": "#14","beds":3},

	"Room_16": {"coords":[510,291],"name": "#16","beds":3},
	"Room_17": {"coords":[384,363],"name": "#17","beds":2},
	"Room_18": {"coords":[384,291],"name": "#18","beds":2},
	"Room_19": {"coords":[324,363],"name": "#19","beds":2},
	"Room_20": {"coords":[324,291],"name": "#20","beds":2},
	"Room_21": {"coords":[264,363],"name": "#21","beds":2},
	"Room_22": {"coords":[264,291],"name": "#22","beds":2},
	"Room_23": {"coords":[204,363],"name": "#23","beds":2},
	"Room_24": {"coords":[204,291],"name": "#24","beds":2},
	"Room_25": {"coords":[450,681],"name": "#25","beds":1},
	"Room_26": {"coords":[510,681],"name": "#26","beds":3},
	
	"Room_28": {"coords":[510,537],"name": "#28","beds":3},
	"Room_29": {"coords":[384,609],"name": "29","beds":2},
	"Room_30": {"coords":[384,537],"name": "#30","beds":2},
	"Room_31": {"coords":[324,609],"name": "#31","beds":2},
	"Room_32": {"coords":[324,537],"name": "#32","beds":2},
	"Room_33": {"coords":[264,609],"name": "33","beds":2},
	"Room_34": {"coords":[264,537],"name": "#34","beds":2},
	"Room_35": {"coords":[204,609],"name": "#35","beds":2},
	"Room_36": {"coords":[204,537],"name": "#36","beds":2},
};

const specialRoomCoordinates = {
	"Room_15": {"coords":[510,363],"name": "Housekeeping", "lines": ["house-","keeping"]},
	"Room_27": {"coords":[510,609],"name": "Storage Room", "lines": ["Storage","Room"]},
}

const sharebathCoordinates = {
	"ShareBath_23-21": [227,433],
	"ShareBath_13-14": [472,505],
	"ShareBath_35-33": [227,680],
	"ShareBath_25-26": [472,751],
}

function RenderHtmlAndStartPolling() {
	
	renderShareBathIcons();
	renderRooms();
	renderSpecialRooms();
	renderWheelchairs();
	

	RegisterButtonEventHandlers();

	prevBtn.addEventListener('click', () => {
		changeDate(-1);
	});
	nextBtn.addEventListener('click', () => {
		changeDate(1);
	});

	//Render initial date on page load
	updateDateDisplay();
	retrieveRoomState();
	startPolling();

}

function renderShareBathIcons(){
	let html = "";
	Object.entries(sharebathCoordinates).forEach(([key, value])=>{
		html += 
		`<div class = "sharebath_bottom_layer" style="left:${value[0]}px; top:${value[1]}px">	
			<p class="font_3">ShareBath</p>
		</div>
		<div class = "sharebath_top_layer" style="left:${value[0]}px; top:${value[1]}px">
			<img class="fit_to_div" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAfCAYAAAARB2hWAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAC7ElEQVRoQ+2aMW8TMRTH/3/bhDSXhgYkpAzd+gU68mX4ChUbG3yOLqgMTKxdOtJOZSuqhKqysKAiUVWoqEku9p/h7sLlaBqG0LqSf9LJz/Z7jv2ez+9OORweHr5T4s45ODh4LwluOBw+9t5/Pzk5eXN2dnZurbVI3Ap5ng/7/f7Tzc3Nl+PxeKW3tkbX7Xa7l5eX37a2tl7t7e2NFg2SWC4bGxvd09PT59Y59/PiQoZEIIlOp9NaZJxYPlmWtQEElnVTdZCs2hK3SOn3qe+NdIN24tYxSERFCkhkpIBEhkmpPC5SUo+MdGRFRgpIZKQcEhkph0RGOrIiIwUkMlJAIiMFJDJSQCIjBSQy0ntIZKT3kMiY3iHe+xSaO8B7HwBMfW9Q/J8rSflcq8R/o/T7NCDu6mqY93q99e3t7RfHx8c/rLWurjCH2X4CxEwyWmRfZzaLSXXjf8lwlc6i39R0sL8T5yLbebAwLcbT7Pm/cO55nl/t7u4OAKyT/Nzr9+lGo9E5gEeDweD1YDDwc2zrg/Oasik3dZaBGmWz/aY5LhNhdi7X1eu69fI6DADkk8kvScbt7Lzd+7C//1XAikIwEgwgK8kAsACMJCMVbVW7gkyAiKKNEgiJgKBylwsEoemkJQlkKLeVBxBIepABgGdVBwPJQNKz6AskvSFFw2DIIAAkUfZDIVih+CVJJkhGCizna4JkUVuDIFusFZbFw40RZAsHyUDkVCZJgQIAFvcXCRUViqBoWK6NofzWzZdrCChkT9JDKuqFnkhOVldXW5+Ojj4aoE3QPINC9ZFcc6c3I1w5t0pEvpSrclLKviZPMKvnr6kHAEFSwC1R+x7K1C5bK6vLzSmbcmVbXc3Tok79TgoAHIz5+WSt/8VlWef8ajSyAHL8ceAEgJc0ARBQlDOOlCTd4yczSfXNtTSMc/XAGgAOpAVgSTo0AivAQWqtdrJR1s3GbHc6ZuK98uHw3jr3PvOg3aYk87DVYpZl4TcjtuxpJK6wrAAAAABJRU5ErkJggg==" alt="" />
		</div>`;
	});

	document.getElementById("parent").innerHTML += html;
}
function renderRooms(){
	let html = "";
	Object.entries(roomCoordinates).forEach(([key, value])=>{
		html += 
		`<div id="${key}" class="_idGenMSO room" style="left:${value.coords[0]}px; top:${value.coords[1]}px">
				<div class="_idGenCurrentState room_state state-ready" data-idGenObjectState="State_Ready">
				</div>
				<div class="_idGenStateHide room_state state-assigned" data-idGenObjectState="State_Assigned">	
				</div>
				<div class="_idGenStateHide room_state state-checked-out" data-idGenObjectState="State_Checked_Out">	
				</div>
				<div class="_idGenStateHide room_state state-cleaning-today" data-idGenObjectState="State_Cleaning_Today">
				</div>
				<div class="_idGenStateHide room_state state-cleaning" data-idGenObjectState="State_Cleaning">
				</div>
				<div class="_idGenStateHide room_state state-other" data-idGenObjectState="State_Other">	
				</div>
		</div>	
			<div id="${key}_button" class="_idGenButton room_button" style="left:${value.coords[0]}px; top:${value.coords[1]}px" data-releaseactions="goToNextState(&apos;${key}&apos;,&apos;true&apos;,0.000);">
				<div class = "room_text">
					<p class="font_1">${value.name}</p>
					<p class="font_2">(${value.beds})</p>
				</div>
			</div>
		`
	});

	document.getElementById("parent").innerHTML += html;
}

function renderSpecialRooms(){
	let html =`
		<div id="Room_15_button" class="room_button" style="left:${specialRoomCoordinates["Room_15"].coords[0]}px; top:${specialRoomCoordinates["Room_15"].coords[1]}px">
				<div class = "room_text">
					<p class="font_4" style="line-height: 2">${specialRoomCoordinates["Room_15"].lines[0]}</p>
					<p class="font_4" style="line-height: 2">${specialRoomCoordinates["Room_15"].lines[1]}</p>
				</div>
			</div>
		<div id="Room_27" class="_idGenMSO room" style="left:${specialRoomCoordinates["Room_27"].coords[0]}px; top:${specialRoomCoordinates["Room_27"].coords[1]}px">
				<div class="_idGenCurrentState room_state state-ready" data-idGenObjectState="State_Ready">
				</div>
				<div class="_idGenStateHide room_state state-assigned" data-idGenObjectState="State_Assigned">	
				</div>
				<div class="_idGenStateHide room_state state-checked-out" data-idGenObjectState="State_Checked_Out">	
				</div>
				<div class="_idGenStateHide room_state state-cleaning-today" data-idGenObjectState="State_Cleaning_Today">
				</div>
				<div class="_idGenStateHide room_state state-cleaning" data-idGenObjectState="State_Cleaning">
				</div>
				<div class="_idGenStateHide room_state state-other" data-idGenObjectState="State_Other">	
				</div>
		</div>	
			<div id="Room_27_button" class="_idGenButton room_button" style="left:${specialRoomCoordinates["Room_27"].coords[0]}px; top:${specialRoomCoordinates["Room_27"].coords[1]}px" data-releaseactions="goToNextState(&apos;Room_27&apos;,&apos;true&apos;,0.000);">
				<div class = "room_text">
					<p class="font_4" style="line-height: 2">${specialRoomCoordinates["Room_27"].lines[0]}</p>
					<p class="font_4" style="line-height: 2">${specialRoomCoordinates["Room_27"].lines[1]}</p>
				</div>
			</div>
		</div>
		`
	document.getElementById("parent").innerHTML += html;
}

function renderWheelchairs(){
	let html = `<div class = "wheelchair">
		<img class="fit_to_div" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABrUlEQVQ4T5WVwVHDMBBF3zK5EyrAHWAqIIfoHOjAdJAOSAekA0wFOGdf4goIHZgOTANZDpKw4kixeTMaS/Lqe1darVFVho3lccvyqK6VMZtLTVSVEDGaA5+ccq+1HJjIVWRuPnEuSUx06NGX1rKP2CU5E9VaumD4pLXkQ5sxYp6GhB+YTEr0KzE/iZSo9/BfB+SJpVQGlMAD8A20gzWl1lJygZnvBGIdNgMegFvXQvaMMIO/hN8D10BDH34DbAZrWkbwe1piBX3fE9vTTIwunCNRhOWxAN7c+FlrKcXoI/CRWhRwM8hrwIa/dv0mOIAWG3qKHBvZmvPtgaAaFWPVJ6hiG7emjb0P87Q9/2KSrXveuq06YeyapiiA96B/Qig6qXCI0TnwClRuauVyHDFagBXduZf+wMbwdhn2xgFUYrQD3sTo4xWn+1NyAZebL26Y05/8HTYbfoBMVBUxWgErZ7AD1lpLS4AY9enjF+fYm9e6tgUqraXzonPsNb0LdBpsDciABf2N+wEW/p8lRrMzB8IqJUY39OHFaLBRHC7YREvfHJsmOdZLsFFUY2KeX7S7/tuKhfavAAAAAElFTkSuQmCC" alt="" />
	</div>`;
	
	document.getElementById("Room_23_button").innerHTML += html;
	document.getElementById("Room_21_button").innerHTML += html;
}

function RegisterButtonEventHandlers() {
	var oFrame = document.getElementsByClassName("_idGenButton");
	for (var i = 0; i < oFrame.length; i++) {
		oFrame[i].addEventListener("mousedown", function (event) { onMouseDown(this, event) }, false);
		oFrame[i].addEventListener("mouseup", function (event) { onMouseUp(this, event) }, false);
	}
}

function addClass(element, classname) {
	var cn = element.className;
	if (cn.indexOf(classname) != -1) {
		return;
	}
	if (cn != '') {
		classname = ' ' + classname;
	}
	element.className = cn + classname;
}
function removeClass(element, classname) {
	var cn = element.className;
	var rxp = new RegExp("\\s?\\b" + classname + "\\b", "g");
	cn = cn.replace(rxp, '');
	element.className = cn;
}
function onMouseDown(element, event) {
	event.stopPropagation();
	event.preventDefault();
}
function onMouseUp(element, event) {
	var actions = element.getAttribute("data-releaseactions");
	if (actions) {
		eval(actions);
	}
	event.stopPropagation();
	event.preventDefault();
}

function goToNextState(mso_id, loopBack, startDelay) {
	
	setTimeout(function () { goToNextStateWrapper(mso_id, loopBack) }, startDelay * 1000);
}
function goToNextStateWrapper(mso_id, loopBack) {
	
	var mso_element = document.getElementById(mso_id);
	if (mso_element) {
		removeClass(mso_element, '_idGenStateHide')
		var mso_states = mso_element.children;
		for (var i = 0, state; state = mso_states[i]; i++) {	
			var cn = state.className;
			if (cn.indexOf('_idGenCurrentState') != -1) {
				if (loopBack)
					var nextState = (i == mso_states.length - 1) ? mso_states[0] : mso_states[i + 1];
				else
					var nextState = (i == mso_states.length - 1) ? mso_states[i] : mso_states[i + 1];

				removeClass(state, '_idGenCurrentState');
				addClass(state, '_idGenStateHide');
				removeClass(nextState, '_idGenStateHide');
				addClass(nextState, '_idGenCurrentState');
				// Data to send to the server
				const payload = {
					roomId: mso_element.id,
					state: nextState.getAttribute('data-idGenObjectState'),
				};
				sendPostRequest(payload);
				// 
				return;
			}
		}
	}

}
function goToState(mso_id, stateName, goBackToPreviousState, startDelay) {
	setTimeout(function () { goToStateWrapper(mso_id, stateName, goBackToPreviousState) }, startDelay * 1000);
}
function goToStateWrapper(mso_id, stateName, goBackToPreviousState) {
	var mso_element = document.getElementById(mso_id);
	if (mso_element) {
		removeClass(mso_element, '_idGenStateHide')
		var mso_states = mso_element.children;
		for (var i = 0, state; state = mso_states[i]; i++) {
			var cn = state.className;
			if (cn.indexOf('_idGenCurrentState') != -1) {
				var prevState = state;
				if (nextState) {
					removeClass(prevState, '_idGenCurrentState');
					addClass(prevState, '_idGenStateHide');
					removeClass(nextState, '_idGenStateHide');
					addClass(nextState, '_idGenCurrentState');
					if (goBackToPreviousState)
						addClass(prevState, '_idGenPreviousState');
				}
			}
			var stateAttr = state.getAttribute('data-idGenObjectState');
			if (stateAttr == stateName) {
				var nextState = state;
				if (prevState) {
					removeClass(prevState, '_idGenCurrentState');
					addClass(prevState, '_idGenStateHide');
					removeClass(nextState, '_idGenStateHide');
					addClass(nextState, '_idGenCurrentState');
					if (goBackToPreviousState)
						addClass(prevState, '_idGenPreviousState');
				}
			}
		}
	}
}

// Function to send the POST request
async function sendPostRequest(payload) {
	try {
		const response = await fetch('https://my-server-4-q0rc.onrender.com/update-state', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		// Parse the JSON response from the server
		const result = await response.json();
		console.log('Response from server:', result);

	} catch (error) {
		console.error('Error sending data:', error);
	}
}
let localLastUpdated = 0; // Tracks the freshness of client data

//const POLL_INTERVAL = 5000; // 5 seconds
const POLL_INTERVAL = 60000; // 60 seconds
const MAX_FAILURES = 3;     // Stop polling after 3 failed attempts
let pollIntervalId = null;
let consecutiveErrors = 0;

async function retrieveRoomState() {
	try {
		const response = await fetch('https://my-server-4-q0rc.onrender.com/retrieve-room-state?' + new URLSearchParams({ lastUpdated: localLastUpdated }).toString());

		if (response.status === 200) {
			const result = await response.json();

			// Update local storage and UI
			localLastUpdated = result.lastUpdated;

			if (result.data) {
				Object.entries(result.data).forEach(([key, value]) => { goToState(key, value, 'false', 0) });
			}

			console.log("UI Updated with fresh data.");

		} else if (response.status === 304) {
			console.log("No changes detected. DOM skipped.");
		}
		// Reset error count on success and handle data
		consecutiveErrors = 0;
		// handleData(await response.json());

	} catch (error) {
		consecutiveErrors++;
		console.error(`Polling failed ${consecutiveErrors} time(s).`, error);

		// Stop polling if server is unreachable
		if (consecutiveErrors >= MAX_FAILURES) {
			stopPolling();
			console.log('Polling stopped: Server is down or unreachable.');
			const div = document.getElementById("connectivity-message");
			div.style.display = "flex";
			div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
			document.getElementById("CharOverride-connectivity-message").textContent = 'Lost connection to server'; 
			//document.body.style.backgroundColor = "grey";
		}
	}
}
function dateToDateString(date) {
	return date.toLocaleDateString('en-US', {
		//weekday: 'short', 
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}
async function retrieveOccupancyForDate(selectedDateString) {
	try {
		//const response = await fetch('/api/state');
		const response = await fetch('https://my-server-4-q0rc.onrender.com/retrieve-occupancy-for-date?' + new URLSearchParams({ dateString: selectedDateString }).toString());

		if (!response.ok) throw new Error('Network issue');

		const result = await response.json();

		if (result.data) {
			Object.entries(result.data).forEach(([key, value]) => {
				if (value === "Turnover") {
					goToState(key, 'State_Cleaning_Today', 'false', 0);
				} else if (value === "Checking Out") {
					goToState(key, 'State_Cleaning', 'false', 0);
				}else {
					goToState(key, 'State_Ready', 'false', 0)
				};
			});
		}

	} catch (error) {
		console.error('Fetch failed:', error);
	}
}
async function startPolling() {
	pollIntervalId = setInterval(async () => {
		retrieveRoomState();
	}, POLL_INTERVAL);
}

function stopPolling() {
	if (pollIntervalId) {
		clearInterval(pollIntervalId);
		pollIntervalId = null;
	}
}
document.getElementById("file-input").addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
	const file = event.target.files[0];
	document.getElementById("file-content").textContent = ""; // Clear previous file content
	document.getElementById("file-message").textContent = ""; // Clear previous messages

	// Validate file existence and type
	if (!file) {
		showMessage("No file selected. Please choose a file.", "error");
		return;
	}

	if (!file.type.startsWith("text")) {
		showMessage("Unsupported file type. Please select a text file.", "error");
		return;
	}

	// Read the file

	const reader = new FileReader();

	reader.onload = () => {
		const csvString = reader.result;
		document.getElementById("file-content").innerHTML = csvToHtmlTable(csvString);
		if (csvString) {
			const uploadMessageElement = document.getElementById("upload-message");
			//document.getElementById("file-content").textContent = "";

			uploadCsvString(csvString, uploadMessageElement);
			// stopPolling();
			// retrieveData();
			// startPolling();
		}
		// document.getElementById("upload-button").addEventListener("click", function () {
		//   if (csvString) {
		//     const uploadMessageElement = document.getElementById("upload-message");
		//     document.getElementById("file-content").textContent = "";

		//     uploadCsvString(csvString, uploadMessageElement);
		//     stopPolling();
		//     retrieveData();
		//     startPolling();
		//   }
		// });
	};
	reader.onerror = () => {
		showMessage("Error reading the file. Please try again.", "error");
	};
	reader.readAsText(file);

}
function csvToHtmlTable(csvString) {
      //const csvStringWithoutDuplicateLines = removeDuplicateLines(csvString)

      // 1. Extract and save the text inside the double quotes (the legend)
      const regex = /"([^"]*)"/g;
      const savedText = [...csvString.matchAll(regex)].map(match => match[1]);

      // 2. Remove the double quotes and the text inside them from the string
      const cleanedString = csvString.replace(regex, '');

      //const rows = csvString.trim().split("\n");
      const rows = cleanedString.trim().split("\n");
      let html = "<table border='1'>\n";

      rows.forEach((row, index) => {
        // replace repeating commas with one comma and replace single comma at the start and end of row (this removes empty cells on that row)
        //const cleanRow = row.replace(/,+/g, ',').trim().replace(/(^,)|(,$)/g, "");
        const columns = row.split(",");

        html += "  <tr>\n";

        columns.forEach(cell => {
          // Use <th> for the first header row, <td> for everything else
          //const tag = (index === 0) ? "th" : "td";
          //html += `    <${tag}>${cell.trim()}</${tag}>\n`;
          html += `    <td>${cell.trim()}</td>\n`;
        });

        html += "  </tr>\n";
      });
      html += "</table>";
      // append first text extracted within the double quotes (the legend)
      html += `<table border='1'><tr><td><pre>${savedText[0]}</pre></td></tr></table>`;
      return html;
    }
async function uploadCsvString(csvString, uploadMessageElement) {
	const url = `https://my-server-4-q0rc.onrender.com/upload-csv`;
	//console.log(occupancyData)

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				//'Content-Type': 'application/json'
				'Content-Type': 'text/plain'
			},
			//body: JSON.stringify(csvString) 
			body: csvString
		});
		const message = await response.text();
		uploadMessageElement.innerHTML = message;
	} catch (error) {
		console.error('Network Error:', error);
	}
}

// date picker
// Initialize the main date tracking state

// DOM Element References
const dateDisplay = document.getElementById('date-display');
const prevBtn = document.getElementById('prev-day');
const nextBtn = document.getElementById('next-day');

// Function to render the formatted date text
function updateDateDisplay() {
	const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
	// Output format example: "Sun, Jul 5, 2026"
	dateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
}

// Handler to shift days and handle automatic month/year rollovers
function changeDate(daysToMove) {
	selectedDate.setDate(selectedDate.getDate() + daysToMove);
	updateDateDisplay();
	const selectedDateString = dateToDateString(selectedDate);
	if (selectedDateString !== dateToDateString(currentDate)) {
		stopPolling();
		document.getElementById("connectivity-message").style.display = "flex";
		retrieveOccupancyForDate(selectedDateString);
	} else {
		stopPolling();
		document.getElementById("connectivity-message").style.display = "none";
		localLastUpdated--; //to force update?
		retrieveRoomState();
		startPolling();
	}
}
