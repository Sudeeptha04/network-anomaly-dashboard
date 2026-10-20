
let trafficChart = null;
let pieChart = null;

async function loadData() {
    try {
        const response = await fetch("/api/traffic");

        if (!response.ok) {
            throw new Error("Unable to load network data");
        }

        const data = await response.json();

        // Update dashboard statistics
        document.getElementById("total").textContent = data.total;
        document.getElementById("normal").textContent = data.normal;
        document.getElementById("anomalies").textContent = data.anomalies;
        document.getElementById("percentage").textContent =
            data.percentage + "%";

        document.getElementById("updated").textContent =
            "Last Updated: " + data.updated;

        // Display security alerts
        const alertTable = document.getElementById("alertTable");
        alertTable.innerHTML = "";

        data.alerts.forEach(item => {
            alertTable.innerHTML += `
                <tr>
                    <td>${item.ip}</td>
                    <td>${item.packets}</td>
                    <td>${item.bytes}</td>
                    <td><span class="status danger">Anomaly</span></td>
                    <td>${item.time}</td>
                </tr>
            `;
        });

        if (data.alerts.length === 0) {
            alertTable.innerHTML =
                '<tr><td colspan="5">No anomalies detected</td></tr>';
        }

        // Display first 20 network records
        const trafficTable = document.getElementById("trafficTable");
        trafficTable.innerHTML = "";

        data.records.slice(0, 20).forEach(item => {
            const statusClass =
                item.status === "Normal" ? "safe" : "danger";

            trafficTable.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.ip}</td>
                    <td>${item.packets}</td>
                    <td>${item.bytes}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${item.status}
                        </span>
                    </td>
                </tr>
            `;
        });

        // Traffic line chart
        const labels = data.records.slice(0, 30).map(
            item => item.id
        );

        const packets = data.records.slice(0, 30).map(
            item => item.packets
        );

        if (trafficChart) {
            trafficChart.destroy();
        }

        trafficChart = new Chart(
            document.getElementById("trafficChart"),
            {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Packet Count",
                        data: packets,
                        borderColor: "#38bdf8",
                        backgroundColor: "rgba(56,189,248,0.1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: "#e2e8f0" }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: "#94a3b8" }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: "#94a3b8" }
                        }
                    }
                }
            }
        );

        // Normal vs anomaly doughnut chart
        if (pieChart) {
            pieChart.destroy();
        }

        pieChart = new Chart(
            document.getElementById("pieChart"),
            {
                type: "doughnut",
                data: {
                    labels: ["Normal", "Anomaly"],
                    datasets: [{
                        data: [data.normal, data.anomalies],
                        backgroundColor: ["#22c55e", "#f43f5e"],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: "#e2e8f0" }
                        }
                    }
                }
            }
        );

    } catch (error) {
        console.error(error);
        document.getElementById("updated").textContent =
            "Error loading data. Check Flask server.";
    }
}

// Load network data when the page opens
loadData();
