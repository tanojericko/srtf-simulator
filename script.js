let processes = [];

// Generate Input Fields
function createInputFields() {
    const numProcesses = document.getElementById('numProcesses').value;
    const inputContainer = document.getElementById('processInputs');
    inputContainer.innerHTML = '';

    for (let i = 0; i < numProcesses; i++) {
        inputContainer.innerHTML += `
            <div class="row mb-2">
                <div class="col">
                    <label>Process Name:</label>
                    <input type="text" id="pname${i}" class="form-control" placeholder="P${i + 1}">
                </div>
                <div class="col">
                    <label>Arrival Time:</label>
                    <input type="number" id="arrival${i}" class="form-control" placeholder="Arrival Time">
                </div>
                <div class="col">
                    <label>Burst Time:</label>
                    <input type="number" id="burst${i}" class="form-control" placeholder="Burst Time">
                </div>
            </div>`;
    }
}

// Collect Data and Start SRTF Calculation
function calculateSRTF() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    processes = [];

    for (let i = 0; i < numProcesses; i++) {
        const name = document.getElementById(`pname${i}`).value || `P${i + 1}`;
        const arrivalTime = parseInt(document.getElementById(`arrival${i}`).value);
        const burstTime = parseInt(document.getElementById(`burst${i}`).value);

        if (isNaN(arrivalTime) || isNaN(burstTime)) {
            alert("Please enter valid Arrival Time and Burst Time!");
            return;
        }

        processes.push({
            name,
            arrivalTime,
            burstTime,
            remainingTime: burstTime,
            completionTime: 0
        });
    }

    simulateSRTF();
}

// SRTF Scheduling Simulation
function simulateSRTF() {
    let currentTime = 0, completed = 0, idleTime = 0;
    const ganttChart = [];
    const n = processes.length;

    while (completed < n) {
        let currentProcess = null;

        for (let process of processes) {
            if (process.arrivalTime <= currentTime && process.remainingTime > 0) {
                if (!currentProcess || process.remainingTime < currentProcess.remainingTime) {
                    currentProcess = process;
                }
            }
        }

        if (!currentProcess) {
            idleTime++;
            ganttChart.push({ name: "Idle", startTime: currentTime, endTime: currentTime + 1 });
            currentTime++;
            continue;
        }

        currentProcess.remainingTime--;

        if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].name !== currentProcess.name) {
            ganttChart.push({ name: currentProcess.name, startTime: currentTime, endTime: currentTime + 1 });
        } else {
            ganttChart[ganttChart.length - 1].endTime++;
        }

        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime + 1;
            completed++;
        }

        currentTime++;
    }

    displayGanttChart(ganttChart);
    calculateMetrics(ganttChart, idleTime);
    document.getElementById('outputSection').style.display = 'block';
}

// Display Gantt Chart
function displayGanttChart(ganttChart) {
    const chart = document.getElementById('ganttChart');
    chart.innerHTML = '';

    ganttChart.forEach((segment, index) => {
        const ganttItem = document.createElement('div');
        ganttItem.className = "gantt-item";
        ganttItem.innerHTML = `${segment.name}`;

        const timeStart = document.createElement('div');
        timeStart.className = "time-marker";
        timeStart.innerHTML = `${segment.startTime}`;
        ganttItem.appendChild(timeStart);

        if (index === ganttChart.length - 1) {
            const timeEnd = document.createElement('div');
            timeEnd.className = "end-time";
            timeEnd.innerHTML = `${segment.endTime}`;
            ganttItem.appendChild(timeEnd);
        }

        chart.appendChild(ganttItem);
    });
}


// Updated Metrics Calculation with Trivia Call
function calculateMetrics(ganttChart, idleTime) {
    const totalTime = ganttChart[ganttChart.length - 1].endTime;
    const cpuBusyTime = totalTime - idleTime;

    processes.forEach(process => {
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
    });

    const tatSum = processes.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const wtSum = processes.reduce((sum, p) => sum + p.waitingTime, 0);

    const cpuUtilization = ((cpuBusyTime / totalTime) * 100).toFixed(2);
    const throughput = (processes.length / totalTime).toFixed(2);
    const avgTAT = (tatSum / processes.length).toFixed(2);
    const avgWT = (wtSum / processes.length).toFixed(2);

    document.getElementById('cpuUtilization').textContent = cpuUtilization;
    document.getElementById('throughput').textContent = throughput;
    document.getElementById('avgTAT').textContent = avgTAT;
    document.getElementById('avgWT').textContent = avgWT;

    displayTrivia(cpuUtilization, throughput, avgTAT, avgWT);

    const tatTableBody = document.querySelector('#tatTable tbody');
    tatTableBody.innerHTML = '';

    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${process.turnaroundTime}</td>
        `;
        tatTableBody.appendChild(row);
    });

    const wtTableBody = document.querySelector('#wtTable tbody');
    wtTableBody.innerHTML = '';

    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${process.waitingTime}</td>
        `;
        wtTableBody.appendChild(row);
    });
}

// Calculate and Display CPU Metrics
function displayTrivia(cpuUtilization, throughput, avgTAT, avgWT) {
    const triviaContainer = document.getElementById('triviaSection');
    triviaContainer.innerHTML = '<h3>Fun Facts & Trivia:</h3>';

    // CPU Utilization Trivia
    if (cpuUtilization > 80) {
        triviaContainer.innerHTML += '<p>High Utilization: Your CPU is working hard—just like during peak hours at a data center!</p>';
    } else if (cpuUtilization > 50) {
        triviaContainer.innerHTML += '<p>Balanced Load: Most modern CPUs are optimized to work efficiently at this range.</p>';
    } else {
        triviaContainer.innerHTML += '<p>Low Utilization: Did you know early CPUs like the Intel 4004 had only 0.07 MHz speed?</p>';
    }

    // Throughput Trivia
    if (throughput > 1) {
        triviaContainer.innerHTML += '<p>High Throughput: Google handles over 99,000 searches per second worldwide!</p>';
    } else {
        triviaContainer.innerHTML += '<p>Low Throughput: Real-world systems optimize algorithms to improve throughput dramatically!</p>';
    }

    // Average Turnaround Time (TAT) Trivia
    if (avgTAT < 10) {
        triviaContainer.innerHTML += '<p>Fast Completion: Did you know the fastest supercomputers can process up to 442 petaflops?</p>';
    } else {
        triviaContainer.innerHTML += '<p>Long TAT: Early computers in the 1940s took hours to complete basic tasks.</p>';
    }

    // Average Waiting Time (WT) Trivia
    if (avgWT < 5) {
        triviaContainer.innerHTML += '<p>Minimal Wait: Your system is as fast as a Formula 1 pit stop!</p>';
    } else {
        triviaContainer.innerHTML += '<p>Long Wait: Reminds me of buffering on dial-up internet days!</p>';
    }
}

// Reset the page and scroll to the top
function resetPage() {
    // Clear input fields
    document.getElementById('numProcesses').value = '';
    document.getElementById('processInputs').innerHTML = '';

    // Hide output section
    document.getElementById('outputSection').style.display = 'none';

    // Clear Gantt chart and trivia
    document.getElementById('ganttChart').innerHTML = '';
    document.getElementById('triviaSection').innerHTML = '';

    // Smooth scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear stored processes data
    processes = [];
}


