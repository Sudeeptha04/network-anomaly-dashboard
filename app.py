
from flask import Flask, render_template, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np
from datetime import datetime
import random

app = Flask(__name__)

def analyze_network():
    # Generate 120 normal network records
    normal_packets = np.random.randint(20, 150, 120)
    normal_bytes = np.random.randint(100, 1500, 120)

    # Generate 10 unusual network records
    unusual_packets = np.random.randint(600, 1200, 10)
    unusual_bytes = np.random.randint(6000, 12000, 10)

    packets = np.concatenate((normal_packets, unusual_packets))
    bytes_used = np.concatenate((normal_bytes, unusual_bytes))

    data = np.column_stack((packets, bytes_used))

    # Train the AI anomaly detection model
    model = IsolationForest(
        contamination=0.08,
        random_state=42
    )
    predictions = model.fit_predict(data)

    records = []
    alerts = []

    for i in range(len(data)):
        ip = f"192.168.1.{(i % 254) + 1}"
        is_anomaly = predictions[i] == -1

        record = {
            "id": i + 1,
            "ip": ip,
            "packets": int(packets[i]),
            "bytes": int(bytes_used[i]),
            "status": "Anomaly" if is_anomaly else "Normal",
            "time": datetime.now().strftime("%H:%M:%S")
        }

        records.append(record)

        if is_anomaly:
            alerts.append(record)

    total = len(records)
    anomaly_count = len(alerts)

    return {
        "total": total,
        "normal": total - anomaly_count,
        "anomalies": anomaly_count,
        "percentage": round(anomaly_count / total * 100, 1),
        "records": records,
        "alerts": alerts,
        "updated": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/traffic")
def traffic():
    result = analyze_network()
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
