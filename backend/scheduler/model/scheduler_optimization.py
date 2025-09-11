#!/usr/bin/env python3
"""
Robust Real-Time AI Scheduling & Optimization (final)
- Works with the dataset layout shown in your repo (handles source/destination, speed_limit, status[1], etc).
- Uses OR-Tools CP-SAT with IntervalVar + AddCumulative(intervals, demands, capacity).
- Run:
    source /Users/nehalajmal/TrainTraffic/venv/bin/activate
    python backend/ml/scheduler_optimization.py \
      --data-root /Users/nehalajmal/TrainTraffic/backend/datasets \
      --limit-trains 15 \
      --time-limit-s 30
"""
from __future__ import annotations
import argparse
import json
import math
import os
import re
from typing import Dict, Tuple, List
from dateutil import parser as dtparser
from datetime import timedelta

import pandas as pd
from ortools.sat.python import cp_model


# ----------------------------
# Utilities: normalize columns & choose candidates
# ----------------------------
def normalize_colname(c: str) -> str:
    if c is None:
        return c
    # lower, strip, remove footnote markers like [1], (1), etc, replace non-alnum with underscore
    s = str(c).strip().lower()
    s = re.sub(r"\[.*?\]|\(.*?\)", "", s)  # remove bracketed footnotes
    s = re.sub(r"[^\w]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def normalize_df_columns(df: pd.DataFrame) -> pd.DataFrame:
    mapping = {c: normalize_colname(c) for c in df.columns}
    return df.rename(columns=mapping)


def choose_column(df: pd.DataFrame, candidates: List[str], default=None):
    cols = set(df.columns)
    for c in candidates:
        if c in cols:
            return c
    return default


# ----------------------------
# Data loader (permissive)
# ----------------------------
def load_data(data_root: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
    # expected filenames
    trains_path = os.path.join(data_root, "trains.csv")
    stations_path = os.path.join(data_root, "stations.csv")
    tracks_path = os.path.join(data_root, "tracks.csv")
    updates_path = os.path.join(data_root, "realtime_update.csv")
    if not os.path.exists(updates_path):
        # allow plural or different name
        alt = os.path.join(data_root, "realtime_updates.csv")
        if os.path.exists(alt):
            updates_path = alt

    for p in [trains_path, stations_path, tracks_path, updates_path]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing file: {p} (place your CSVs in {data_root})")

    trains = pd.read_csv(trains_path)
    stations = pd.read_csv(stations_path)
    tracks = pd.read_csv(tracks_path)
    updates = pd.read_csv(updates_path)

    # Normalize column names (strip footnotes like status[1])
    trains = normalize_df_columns(trains)
    stations = normalize_df_columns(stations)
    tracks = normalize_df_columns(tracks)
    updates = normalize_df_columns(updates)

    # trains: id, scheduled_route, max_speed_kmph, priority_level
    tid_col = choose_column(trains, ["train_id", "id", "train"])
    if not tid_col:
        raise ValueError("trains.csv must contain a train id column (train_id/id)")
    trains = trains.rename(columns={tid_col: "train_id"})

    route_col = choose_column(trains, ["scheduled_route", "route", "scheduled_stations"])
    if not route_col:
        raise ValueError("trains.csv must contain a scheduled route column (scheduled_route/route)")
    trains = trains.rename(columns={route_col: "scheduled_route"})

    pr_col = choose_column(trains, ["priority_level", "priority"])
    if pr_col:
        trains["priority_level"] = pd.to_numeric(trains[pr_col], errors="coerce").fillna(3).astype(int)
    else:
        trains["priority_level"] = 3

    ms_col = choose_column(trains, ["max_speed_kmph", "speed_kmph", "max_speed"])
    if ms_col:
        trains["max_speed_kmph"] = pd.to_numeric(trains[ms_col], errors="coerce").fillna(100.0)
    else:
        trains["max_speed_kmph"] = 100.0

    # tracks: from/to, distance, speed limit, capacity inference
    from_col = choose_column(tracks, ["from_station_id", "source_station_id", "from", "station_a"])
    to_col = choose_column(tracks, ["to_station_id", "destination_station_id", "to", "station_b"])
    if not from_col or not to_col:
        raise ValueError("tracks.csv must contain from/to station columns (e.g. source_station_id,destination_station_id)")

    tracks = tracks.rename(columns={from_col: "from_station_id", to_col: "to_station_id"})

    dist_col = choose_column(tracks, ["distance_km", "distance", "len_km", "length_km"])
    if not dist_col:
        raise ValueError("tracks.csv must contain a distance column (distance_km/distance)")
    tracks = tracks.rename(columns={dist_col: "distance_km"})
    tracks["distance_km"] = pd.to_numeric(tracks["distance_km"], errors="coerce").fillna(1.0)

    # speed limit: could be speed_limit or a column like 120 in your example
    speed_col = choose_column(tracks, ["speed_limit", "max_speed_kmph", "speed_kmph", "vmax"])
    if speed_col:
        tracks["max_speed_kmph"] = pd.to_numeric(tracks[speed_col], errors="coerce").fillna(100.0)
    else:
        tracks["max_speed_kmph"] = 100.0

    # attempt to unify track id
    tidk = choose_column(tracks, ["track_id", "id", "trk_id"])
    if tidk:
        tracks = tracks.rename(columns={tidk: "track_id"})
    else:
        tracks["track_id"] = ["TRK%04d" % i for i in range(len(tracks))]

    # capacity from track_type (single/double) or fallback to 1
    tt = choose_column(tracks, ["track_type", "type", "track_class"])
    if tt:
        tracks["track_type"] = tracks[tt].astype(str).str.lower().str.strip()
        tracks["capacity"] = tracks["track_type"].map({"single": 1, "double": 2}).fillna(1).astype(int)
    else:
        tracks["capacity"] = 1

    # optional status
    stc = choose_column(tracks, ["status", "track_status"])
    if stc:
        tracks["status"] = tracks[stc].astype(str).fillna("operational")
    else:
        tracks["status"] = "operational"

    # updates: per-train latest row
    updates_cols = set(updates.columns)
    upd_tid = choose_column(updates, ["train_id", "trn_id", "train"])
    if upd_tid:
        updates = updates.rename(columns={upd_tid: "train_id"})
    else:
        # no updates -> empty mapping
        updates = updates.iloc[0:0]

    # normalize delay/weather/status in updates
    if "delay_minutes" in updates.columns:
        updates["delay_minutes"] = pd.to_numeric(updates["delay_minutes"], errors="coerce").fillna(0).astype(int)
    else:
        updates["delay_minutes"] = 0

    if "weather_impact" not in updates.columns and "weather" in updates.columns:
        updates = updates.rename(columns={"weather": "weather_impact"})
    if "track_status" not in updates.columns and "status" in updates.columns:
        updates = updates.rename(columns={"status": "track_status"})

    ts_col = choose_column(updates, ["ts", "timestamp", "updated_at", "actual_departure_time", "actual_arrival_time"])
    if ts_col:
        updates["__ts"] = pd.to_datetime(updates[ts_col], errors="coerce")
        updates = updates.sort_values("__ts").drop_duplicates(subset=["train_id"], keep="last")
    else:
        updates = updates.drop_duplicates(subset=["train_id"], keep="last")

    latest_update_by_train = {}
    if "train_id" in updates.columns:
        for _, r in updates.iterrows():
            latest_update_by_train[r["train_id"]] = {
                "delay_minutes": int(r.get("delay_minutes", 0) or 0),
                "track_status": r.get("track_status", "free"),
                "weather_impact": r.get("weather_impact", "clear"),
            }

    return trains, stations, tracks, latest_update_by_train


# ----------------------------
# Convert route -> segments
# ----------------------------
def build_track_index(tracks_df: pd.DataFrame) -> Dict[Tuple[str, str], dict]:
    idx = {}
    for _, r in tracks_df.iterrows():
        a = str(r["from_station_id"]).strip()
        b = str(r["to_station_id"]).strip()
        row = r.to_dict()
        idx[(a, b)] = row
        idx[(b, a)] = row
    return idx


def weather_multiplier(weather: str) -> float:
    if not isinstance(weather, str):
        return 1.0
    w = weather.lower().strip()
    if "clear" in w or "sun" in w:
        return 1.0
    if "rain" in w:
        return 1.15
    if "fog" in w:
        return 1.25
    if "storm" in w:
        return 1.40
    return 1.10


def status_multiplier(status: str) -> float:
    if not isinstance(status, str):
        return 1.0
    s = status.lower().strip()
    if s in ("free", "operational", "ok"):
        return 1.0
    if "occupied" in s:
        return 1.10
    if "maint" in s or "under" in s:
        return 1.50
    return 1.10


def segment_minutes(distance_km, track_vmax, train_vmax, weather="clear", tstatus="free"):
    try:
        vmax = max(5.0, min(float(track_vmax), float(train_vmax)))
    except Exception:
        vmax = float(train_vmax or 80.0)
    base = (float(distance_km) / vmax) * 60.0
    base *= weather_multiplier(weather)
    base *= status_multiplier(tstatus)
    return max(1, int(math.ceil(base + 2)))


def route_to_segments(train_row: pd.Series, track_idx: Dict, latest_update_by_train: Dict):
    tid = train_row["train_id"]
    route = [s.strip() for s in str(train_row["scheduled_route"]).split(",") if s.strip()]
    vmax = float(train_row.get("max_speed_kmph", 100.0) or 100.0)
    upd = latest_update_by_train.get(tid, {"delay_minutes": 0, "track_status": "free", "weather_impact": "clear"})
    weather = upd.get("weather_impact", "clear")
    tstatus = upd.get("track_status", "free")
    segs = []
    for a, b in zip(route, route[1:]):
        tr = track_idx.get((a, b))
        if tr is None:
            # no direct track — skip segment (you may want to handle differently)
            continue
        dur = segment_minutes(
            distance_km=tr.get("distance_km", 1.0),
            track_vmax=tr.get("max_speed_kmph", 100.0),
            train_vmax=vmax,
            weather=weather,
            tstatus=tstatus,
        )
        segs.append({
            "track_id": tr.get("track_id"),
            "from": a,
            "to": b,
            "duration": int(dur),
            "capacity": int(tr.get("capacity", 1)),
        })
    release_delay = int(latest_update_by_train.get(tid, {}).get("delay_minutes", 0) or 0)
    return segs, release_delay


# ----------------------------
# Explainable AI Recommendations
# ----------------------------
def explain_schedule(out, trains, tracks, updates):
    """
    Generates explanations for why each train is scheduled the way it is.
    Converts all numeric values to Python's built-in types before outputting as JSON.

    Parameters:
    - out: The schedule output from the optimizer containing trains and their schedules.
    - trains: The DataFrame with train details.
    - tracks: The DataFrame with track details.
    - updates: Latest updates about delays, weather, etc.

    Returns:
    - A dictionary mapping each train ID to a list of human-readable explanations.
    """
    explanations = {}  # Dictionary to hold explanations per train

    for tid, tinfo in out["trains"].items():
        explanation_list = []  # List to hold individual explanation strings
        
        # Convert numpy.int64 to Python int explicitly for JSON serialization
        release_delay = int(tinfo.get("release_delay_min", 0))

        # Explain priority level
        priority = int(tinfo.get("priority", 3))  # Default priority is 3 if missing
        explanation_list.append(f"Train's priority level is {priority}")

        # Explain release delay
        explanation_list.append(f"Train's release delay is {release_delay} minutes")

        # Explain each segment in the schedule
        for seg in tinfo.get("schedule", []):
            duration = int(seg.get("duration_min", 0))  # Convert duration to int
            from_station = seg.get("from", "unknown")
            to_station = seg.get("to", "unknown")
            explanation_list.append(f"Segment from {from_station} to {to_station} has duration {duration} minutes")

        # Save the explanation list in the dictionary using the train ID as key
        explanations[tid] = explanation_list

    return explanations


# ----------------------------
# CP-SAT model + solve
# ----------------------------
def optimize(data_root: str, now_ts=None, limit_trains=None, time_limit_s: int = 20):
    trains, stations, tracks, updates = load_data(data_root)
    if limit_trains:
        trains = trains.head(int(limit_trains)).copy()

    track_idx = build_track_index(tracks)

    # compute segments per train
    trains["segments"] = None
    trains["segments_release"] = None
    for i, r in trains.iterrows():
        segs, rel = route_to_segments(r, track_idx, updates)
        trains.at[i, "segments"] = segs
        trains.at[i, "segments_release"] = rel

    # horizon
    horizon = 0
    for segs in trains["segments"]:
        if segs:
            horizon += sum(s["duration"] for s in segs)
    horizon = int(horizon * 1.5) + 200
    if horizon < 300:
        horizon = 300

    model = cp_model.CpModel()

    train_intervals = {}   # (tid,k) -> (s_var,e_var,dur, interval)
    track_buckets = {}     # track_id -> { intervals: [IntervalVar], demands: [int], capacity: int }

    for _, tr in trains.iterrows():
        tid = tr["train_id"]
        segs = tr["segments"] or []
        release = int(tr.get("segments_release", 0) or 0)

        prev_end = None
        for k, s in enumerate(segs):
            s_var = model.NewIntVar(0, horizon, f"s_{tid}_{k}")
            e_var = model.NewIntVar(0, horizon, f"e_{tid}_{k}")
            dur_val = int(s["duration"])
            model.Add(e_var == s_var + dur_val)
            iv = model.NewIntervalVar(s_var, dur_val, e_var, f"iv_{tid}_{k}")
            train_intervals[(tid, k)] = (s_var, e_var, dur_val, iv)

            if k == 0:
                model.Add(s_var >= release)
            if prev_end is not None:
                model.Add(s_var >= prev_end)
            prev_end = e_var

            trkid = s["track_id"]
            if trkid not in track_buckets:
                track_buckets[trkid] = {"intervals": [], "demands": [], "capacity": int(s.get("capacity", 1))}
            track_buckets[trkid]["intervals"].append(iv)
            track_buckets[trkid]["demands"].append(1)
            track_buckets[trkid]["capacity"] = min(track_buckets[trkid]["capacity"], int(s.get("capacity", 1)))

    # resource constraints: use AddNoOverlap for cap==1 or AddCumulative(intervals, demands, cap)
    for trkid, bucket in track_buckets.items():
        ivs = bucket["intervals"]
        demands = bucket["demands"]
        cap = int(bucket.get("capacity", 1))
        if len(ivs) == 0:
            continue
        if cap <= 1:
            model.AddNoOverlap(ivs)
        else:
            # IMPORTANT: correct signature used here: intervals, demands, capacity
            model.AddCumulative(ivs, demands, cap)

    # Objective: minimize weighted last-end
    obj_terms = []
    for _, tr in trains.iterrows():
        tid = tr["train_id"]
        segs = tr["segments"] or []
        if not segs:
            continue
        last_key = (tid, len(segs) - 1)
        if last_key in train_intervals:
            last_end = train_intervals[last_key][1]
            pr = int(tr.get("priority_level", 3))
            w = 2 ** max(0, 4 - pr)
            obj_terms.append(w * last_end)

    if obj_terms:
        model.Minimize(sum(obj_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit_s)
    solver.parameters.num_search_workers = 8
    status = solver.Solve(model)

    out = {
        "status": solver.StatusName(status),
        "objective": solver.ObjectiveValue() if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
        "horizon": horizon,
        "trains": {},
    }

    for _, tr in trains.iterrows():
        tid = tr["train_id"]
        segs = tr["segments"] or []
        sched = []
        for k, s in enumerate(segs):
            key = (tid, k)
            if key in train_intervals and (status in (cp_model.OPTIMAL, cp_model.FEASIBLE)):
                start = solver.Value(train_intervals[key][0])
                end = solver.Value(train_intervals[key][1])
                sched.append({
                    "segment_index": k,
                    "track_id": s["track_id"],
                    "from": s["from"],
                    "to": s["to"],
                    "start_min": int(start),
                    "end_min": int(end),
                    "duration_min": int(s["duration"]),
                })
        out["trains"][tid] = {
            "priority": int(tr.get("priority_level", 3)),
            "release_delay_min": int(tr.get("segments_release", 0) or 0),
            "schedule": sched,
        }

    # enrich with station names + timestamps
    out = enrich_with_timestamps(out, stations, base_now=pd.Timestamp.now(), updates_df=None)

    # Enrich the schedule with explanations
    explanations = explain_schedule(out, trains, tracks, updates)

    # Print the explanations for each train in a readable format
    print("\nExplainable AI Recommendations:")
    print(json.dumps(explanations, indent=2))

    print(json.dumps(out, indent=2))
    return out


def enrich_with_timestamps(out, stations_df, base_now=None, updates_df=None):
    """
    Convert schedule minutes into ISO timestamps and add station names.
    - base_now: datetime object to anchor 'minute 0'.
    - updates_df: if given, will use train's actual_departure_time as base when possible.
    """
    station_lookup = stations_df.set_index("id")["station_name"].to_dict()

    for tid, tinfo in out["trains"].items():
        sched = tinfo.get("schedule", [])
        if not sched:
            continue

        # pick base timestamp
        base_ts = None
        if updates_df is not None:
            row = updates_df[updates_df["train_id"] == tid]
            if not row.empty:
                val = row.iloc[0].get("actual_departure_time")
                try:
                    base_ts = pd.to_datetime(val)
                except Exception:
                    pass
        if base_ts is None:
            base_ts = base_now or pd.Timestamp.now()

        for seg in sched:
            seg["from_name"] = station_lookup.get(seg["from"], seg["from"])
            seg["to_name"] = station_lookup.get(seg["to"], seg["to"])
            seg["start_time"] = (base_ts + timedelta(minutes=seg["start_min"])).isoformat()
            seg["end_time"] = (base_ts + timedelta(minutes=seg["end_min"])).isoformat()

    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-root", default="backend/datasets")
    ap.add_argument("--now", default=None, help="optional 'now' timestamp (unused in MVP)")
    ap.add_argument("--limit-trains", type=int, default=20)
    ap.add_argument("--time-limit-s", type=int, default=20)
    args = ap.parse_args()

    if args.now:
        try:
            _ = dtparser.parse(args.now)
        except Exception:
            raise ValueError("--now must be a valid timestamp")

    optimize(
        data_root=args.data_root,
        now_ts=args.now,
        limit_trains=args.limit_trains,
        time_limit_s=args.time_limit_s,
    )


if __name__ == "__main__":
    main()
