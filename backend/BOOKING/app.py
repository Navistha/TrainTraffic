from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import datetime

app = Flask(__name__)
CORS(app)

stations = ["Delhi", "Varanasi", "Rewari", "Mirzapur", "Anantnag","Kanpur"]
materials = ["Coal", "Steel", "Food", "Oil", "Cement", "Grain"]

freights = {}


def generate_freight_id():
    return "F" + str(random.randint(1000000, 9999999))


def random_datetime():
    """Generate random departure and arrival times"""
    departure = datetime.datetime.now() + datetime.timedelta(hours=random.randint(1, 24))
    arrival = departure + datetime.timedelta(hours=random.randint(5, 48))
    return departure.strftime("%Y-%m-%d %H:%M"), arrival.strftime("%Y-%m-%d %H:%M")



for _ in range(15):
    fid = generate_freight_id()
    departure_time, arrival_time = random_datetime()
    freights[fid] = {
        "id": fid,
        "origin": random.choice(stations),
        "destination": random.choice(stations),
        "status": random.choice(["free", "booked", "unloading", "reloading"]),
        "departure_time": departure_time,
        "arrival_time": arrival_time,
        "material_type": random.choice(materials),
        "quantity_tons": random.randint(50, 500)  
    }


@app.route("/freights", methods=["GET"])
def get_all_freights():
    return jsonify(list(freights.values()))


@app.route("/freights/station", methods=["GET"])
def get_freights_by_station():
    station = request.args.get("station")
    if not station:
        return jsonify({"error": "Please provide ?station=NAME"}), 400
    
    result = [f for f in freights.values() if f["origin"].lower() == station.lower() or f["destination"].lower() == station.lower()]
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
