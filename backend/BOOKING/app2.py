from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import joblib
from datetime import datetime, timedelta

app = Flask(__name__, static_folder="static")
CORS(app)

# Load ML Model + Scaler
model, scaler = joblib.load("train_model.pkl")


CITIES = ["Delhi", "Chandigarh", "Jaipur", "Lucknow", "Kanpur",
          "Dehradun", "Varanasi", "Agra", "Gurugram"]

ROUTE_COMPLEXITY = {
    ("Delhi", "Chandigarh"): 5,
    ("Delhi", "Jaipur"): 6,
    ("Delhi", "Lucknow"): 8,
    ("Delhi", "Kanpur"): 8,
    ("Delhi", "Dehradun"): 7,
    ("Delhi", "Varanasi"): 9,
    ("Delhi", "Agra"): 4,
    ("Delhi", "Gurugram"): 2,
    ("Chandigarh", "Jaipur"): 9,
    ("Chandigarh", "Lucknow"): 8,
    ("Chandigarh", "Kanpur"): 10,
    ("Chandigarh", "Dehradun"): 6,
    ("Chandigarh", "Varanasi"): 11,
    ("Chandigarh", "Agra"): 8,
    ("Chandigarh", "Gurugram"): 6,
    ("Jaipur", "Lucknow"): 9,
    ("Jaipur", "Kanpur"): 9,
    ("Jaipur", "Dehradun"): 10,
    ("Jaipur", "Varanasi"): 11,
    ("Jaipur", "Agra"): 5,
    ("Jaipur", "Gurugram"): 8,
    ("Lucknow", "Kanpur"): 4,
    ("Lucknow", "Dehradun"): 8,
    ("Lucknow", "Varanasi"): 6,
    ("Lucknow", "Agra"): 7,
    ("Lucknow", "Gurugram"): 9,
    ("Kanpur", "Dehradun"): 9,
    ("Kanpur", "Varanasi"): 5,
    ("Kanpur", "Agra"): 7,
    ("Kanpur", "Gurugram"): 9,
    ("Dehradun", "Varanasi"): 10,
    ("Dehradun", "Agra"): 8,
    ("Dehradun", "Gurugram"): 7,
    ("Varanasi", "Agra"): 11,
    ("Varanasi", "Gurugram"): 12,
    ("Agra", "Gurugram"): 5,
}

def get_route_complexity(origin, destination):
    return ROUTE_COMPLEXITY.get((origin, destination)) \
           or ROUTE_COMPLEXITY.get((destination, origin)) \
           or 10

freights = {}
def generate_freight_id():
    return "FREIGHT" + str(random.randint(1000, 9999))

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/book", methods=["POST"])
def book_freight():
    data = request.json
    origin = data["from"]
    destination = data["to"]
    quantity = int(data["quantity"])
    date_str = data["date"]

    if origin not in CITIES or destination not in CITIES:
        return jsonify({"error": "Invalid cities"}), 400

    route_complexity = get_route_complexity(origin, destination)

   
    travel_hours = 4 + route_complexity * 0.5 + (quantity / 20)
    booked_time = datetime.strptime(date_str, "%Y-%m-%d")
    eta = booked_time + timedelta(hours=travel_hours)

  
    features = scaler.transform([[quantity, route_complexity]])
    delay_pred = model.predict(features)[0]

   
    freight_id = generate_freight_id()
    freights[freight_id] = {
        "from": origin,
        "to": destination,
        "quantity": quantity,
        "date": date_str,
        "eta": eta,
        "delay": bool(delay_pred),
        "tracking_clicks": 0,
        "status": "In Transit"
    }

    return jsonify({
        "freight_id": freight_id,
        "message": "Booking successful",
        "eta": eta.strftime("%Y-%m-%d %H:%M")
    })

@app.route("/track/<fid>")
def track_freight(fid):
    freight = freights.get(fid)
    if not freight:
        return jsonify({"error": "Freight not found"}), 404

    freight["tracking_clicks"] += 1

    if freight["tracking_clicks"] >= 3:
        freight["status"] = "Arrived"

    response = {
        "freight_id": fid,
        "from": freight["from"],
        "to": freight["to"],
        "quantity": freight["quantity"],
        "eta": freight["eta"].strftime("%Y-%m-%d %H:%M"),
        "status": freight["status"]
    }

 
    if freight["status"] != "Arrived" and freight["delay"]:
        response["status"] = "Delayed"

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
