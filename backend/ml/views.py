from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.shortcuts import get_object_or_404
from core.models import Train, Station
from .predict import predict_delay

predictor = predict_delay

class PredictTrainDelay(APIView):
    def post(self, request):
        """
        Simplified JSON request for delay prediction.
        Only minimal fields are required; the rest are inferred from Train or defaulted.

        Example JSON:
        {
          "train_number": "12345",
          "station_code": "NDLS",            # optional
          "track_status": "free",             # optional, default "free"
          "weather_impact": "clear",          # optional, default "clear"
          "scheduled_arrival": "2025-09-08T14:00:00Z"  # optional, echoed back only
        }
        """
        try:
            data = request.data or {}
            train_number = data.get("train_number")
            if not train_number:
                return Response({"error": "train_number is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Try to enrich features from Train record; else use sensible defaults
            train = Train.objects.filter(train_number=train_number).first()
            track_status = (data.get("track_status") or "free").strip()
            weather_impact = (data.get("weather_impact") or "clear").strip()

            if train:
                train_type = (train.train_type or "express").strip()
                try:
                    priority_level = int(train.priority_level) if train.priority_level is not None else 3
                except Exception:
                    priority_level = 3
                coach_length = int(train.coach_length or 12)
                max_speed_kmph = int(train.max_speed_kmph or 90)
            else:
                train_type = "express"
                priority_level = 3
                coach_length = 12
                max_speed_kmph = 90

            # Build DataFrame for the predictor
            feature_cols = [
                "track_status",
                "weather_impact",
                "train_type",
                "priority_level",
                "coach_length",
                "max_speed_kmph",
            ]
            input_df = pd.DataFrame([{
                "track_status": track_status,
                "weather_impact": weather_impact,
                "train_type": train_type,
                "priority_level": priority_level,
                "coach_length": coach_length,
                "max_speed_kmph": max_speed_kmph,
            }], columns=feature_cols)

            preds = predict_delay(input_df)
            row = preds.iloc[0]
            response = {
                "train_number": train_number,
                "station_code": data.get("station_code"),
                "scheduled_arrival": data.get("scheduled_arrival"),
                "predicted_delay_minutes": int(round(row["predicted_delay_minutes"])) if pd.notna(row["predicted_delay_minutes"]) else None,
                "delay_probability": float(row["delay_probability"]) if pd.notna(row["delay_probability"]) else None,
                "pred_delayed_flag": int(row["pred_delayed_flag"]) if pd.notna(row["pred_delayed_flag"]) else None,
                "features_used": {
                    "track_status": track_status,
                    "weather_impact": weather_impact,
                    "train_type": train_type,
                    "priority_level": priority_level,
                    "coach_length": coach_length,
                    "max_speed_kmph": max_speed_kmph,
                }
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
