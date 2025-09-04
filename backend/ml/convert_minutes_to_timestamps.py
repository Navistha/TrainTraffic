from datetime import datetime, timedelta
import json

def convert_schedule_minutes_to_iso(schedule_out, base_time: datetime = None):
    """
    schedule_out: dict returned by optimize()
    base_time: datetime object representing "now". If None, uses current time.
    Returns: same structure with added iso_start and iso_end per segment.
    """
    if base_time is None:
        base_time = datetime.now()
    out = schedule_out.copy()
    for tid, info in out["trains"].items():
        release = info.get("release_delay_min", 0)
        for seg in info.get("schedule", []):
            # absolute start = base + start_min minutes
            start_abs = base_time + timedelta(minutes=int(seg["start_min"]))
            end_abs = base_time + timedelta(minutes=int(seg["end_min"]))
            seg["start_iso"] = start_abs.isoformat(sep=" ")
            seg["end_iso"] = end_abs.isoformat(sep=" ")
    return out

# usage example:
# import json
# out = <your optimizer output as dict>
# from datetime import datetime
# new = convert_schedule_minutes_to_iso(out, base_time=datetime.utcnow())
# print(json.dumps(new, indent=2))
