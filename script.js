let timer;
let seconds = 0;
let minutes = 0;
let isRunning = false;
let isPaused = false;
let hiddenTime;
let eventsLog = document.getElementById("eventsLog");
let totalGoalsScored = 0;
let totalGoalsConceded = 0;
let eventHistory = [];  // Array to store event history
let playerNames = []; // Array to store player names

// Function to dynamically create player buttons with toggle and goal options
function createPlayerButtons() {
    const playerButtonsContainer = document.getElementById("playerButtons");
    playerButtonsContainer.innerHTML = ''; // Clear any existing buttons

    playerNames.forEach(name => {
        const playerContainer = document.createElement("div");
        playerContainer.classList.add("player-container");

        const statusButton = document.createElement("button");
        statusButton.textContent = `${name} - On`;
        statusButton.classList.add("event-button", "large-button");
        let isOn = true;

        statusButton.addEventListener("click", () => {
            isOn = !isOn; // Toggle state
            statusButton.textContent = `${name} - ${isOn ? 'On' : 'Off'}`;
            statusButton.style.backgroundColor = isOn ? "green" : "red"; // Green for On, Red for Off

            logEvent(`${name} ${isOn ? 'is now on the field' : 'has been substituted off'}`);
        });

        const goalButton = document.createElement("button");
        goalButton.textContent = `Goal`;
        goalButton.classList.add("event-button", "small-button");
        goalButton.addEventListener("click", () => {
            if (isOn) {
                logEvent(`${name} scored a goal`);
                totalGoalsScored++;
                goalButton.style.backgroundColor = "green"; // Turn button green when clicked
                updateGoalTotals();
            } else {
                alert(`${name} is not on the field.`);
            }
        });

        playerContainer.appendChild(statusButton);
        playerContainer.appendChild(goalButton);
        playerButtonsContainer.appendChild(playerContainer);
    });
}

// Handle player names submission
document.getElementById("playerNamesForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const playerNamesInput = document.getElementById("playerNamesInput").value.trim();
    playerNames = playerNamesInput.split(',').map(name => name.trim()).filter(name => name);

    if (playerNames.length > 0) {
        document.getElementById("playerNamesSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        createPlayerButtons();
    } else {
        alert("Please enter at least one player name.");
    }
});

// Start Timer
document.getElementById("startButton").addEventListener("click", () => {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        document.getElementById("pauseButton").disabled = false;
        timer = setInterval(updateTimer, 1000);
    }
});

// Pause Timer
document.getElementById("pauseButton").addEventListener("click", () => {
    if (isPaused) {
        isPaused = false;
        document.getElementById("pauseButton").textContent = "Pause Timer";
        timer = setInterval(updateTimer, 1000);
    } else {
        isPaused = true;
        clearInterval(timer);
        document.getElementById("pauseButton").textContent = "Resume Timer";
    }
});

// Reset Timer
document.getElementById("resetButton").addEventListener("click", () => {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    seconds = 0;
    minutes = 0;
    updateTimerDisplay();
    document.getElementById("pauseButton").disabled = true;
    document.getElementById("pauseButton").textContent = "Pause Timer";
});

// Goal Conceded Button
document.getElementById("goalConcededButton").addEventListener("click", () => {
    logEvent("Goal conceded");
    totalGoalsConceded++;
    updateGoalTotals();
});

// Remove Last Entry Button
document.getElementById("removeLastEntryButton").addEventListener("click", () => {
    removeLastEvent();
});

// Sin Bin Button
document.getElementById("sinBinButton").addEventListener("click", () => {
    const player = prompt("Enter the name of the player for the sin bin:");
    if (playerNames.includes(player)) {
        logEvent(`${player} sent to the sin bin`);
    } else {
        alert("Player not found.");
    }
});

// Update Timer
function updateTimer() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    updateTimerDisplay();
}

// Function to update timer display
function updateTimerDisplay() {
    const formattedTime = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    document.getElementById("timer").textContent = formattedTime;
}

// Log Event
function logEvent(event) {
    const time = document.getElementById("timer").textContent;
    const logEntry = `${time} - ${event}`;
    eventHistory.push(logEntry);  // Store event in history
    eventsLog.value += logEntry + '\n';
}

// Remove the last event from the log and update totals
function removeLastEvent() {
    if (eventHistory.length > 0) {
        const lastEvent = eventHistory.pop();  // Remove last event from history

        if (lastEvent.includes("scored a goal")) {
            totalGoalsScored--;
        } else if (lastEvent.includes("Goal conceded")) {
            totalGoalsConceded--;
        }

        const logEntries = eventsLog.value.split('\n');
        logEntries.pop();  // Remove the last empty line
        logEntries.pop();  // Remove the last event entry
        eventsLog.value = logEntries.join('\n') + '\n';

        updateGoalTotals();  // Update totals on the screen
    } else {
        alert("No events to remove.");
    }
}

// Save Events to File
document.getElementById("saveEventsButton").addEventListener("click", () => {
    const blob = new Blob([eventsLog.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "match_events.txt";
    link.click();
});

// Function to update goal totals display
function updateGoalTotals() {
    document.getElementById("totalGoalsScored").textContent = totalGoalsScored;
    document.getElementById("totalGoalsConceded").textContent = totalGoalsConceded;
}

// Handle Background/Foreground visibility change for running timer
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isRunning && !isPaused) {
        hiddenTime = new Date();
    } else if (!document.hidden && isRunning && !isPaused) {
        let elapsedTime = Math.floor((new Date() - hiddenTime) / 1000);
        minutes += Math.floor(elapsedTime / 60);
        seconds += elapsedTime % 60;

        if (seconds >= 60) {
            minutes++;
            seconds = seconds % 60;
        }
        
        updateTimerDisplay();
    }
});
