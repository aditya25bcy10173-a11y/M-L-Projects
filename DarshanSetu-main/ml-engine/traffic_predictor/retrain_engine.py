import sys
import json
import pandas as pd
import numpy as np
import os
import datetime
from model import train_hybrid_ensemble

def get_input_mapping(incident_type, severity):
    inc_type = str(incident_type).upper()
    sev = str(severity).upper()

    event_type = 'unplanned'
    event_cause = 'others'
    priority = 'low'
    requires_road_closure = 'false'

    if inc_type == 'STAMPEDE_PRECURSOR':
        event_cause = 'congestion'
        priority = 'high'
        requires_road_closure = 'true'
    elif inc_type == 'MEDICAL_FALL':
        event_cause = 'road_conditions'
    elif inc_type == 'SOS_MANUAL':
        priority = 'high'

    if sev == 'CRITICAL':
        priority = 'high'

    return event_type, event_cause, priority, requires_road_closure

def run_retraining():
    print("Starting closed-loop ML retraining engine...")
    
    # Read feedback incidents JSON array from stdin passed from Node.js
    try:
        feedback_list = json.loads(sys.stdin.read())
    except Exception as e:
        print(f"Error reading stdin: {e}")
        return False
        
    base_file = "flip.csv"
    if not os.path.exists(base_file):
        print(f"Base training file {base_file} not found. Cannot proceed with retraining.")
        return False
        
    print(f"Baseline training records: {pd.read_csv(base_file).shape[0]}")
    print(f"New operator feedback records: {len(feedback_list)}")
    
    if len(feedback_list) > 0:
        new_rows = []
        for idx, item in enumerate(feedback_list):
            lat = float(item.get('lat', 12.9716))
            lng = float(item.get('lng', 77.5946))
            incident_type = item.get('type', 'SOS_MANUAL')
            severity = item.get('severity', 'WARNING')
            actual_dur = max(1.0, float(item.get('actualDuration', 30.0)))
            
            event_type, event_cause, priority, requires_road_closure = get_input_mapping(incident_type, severity)
            
            # Formulate start and resolved datetimes
            created_at_str = item.get('createdAt')
            if created_at_str:
                try:
                    start_dt = pd.to_datetime(created_at_str)
                except:
                    start_dt = datetime.datetime.now()
            else:
                start_dt = datetime.datetime.now()
                
            resolved_dt = start_dt + datetime.timedelta(minutes=actual_dur)
            
            new_rows.append({
                'id': f"FEEDBACK_{np.random.randint(100000, 999999)}",
                'event_type': event_type,
                'event_cause': event_cause,
                'requires_road_closure': requires_road_closure,
                'priority': priority,
                'police_station': 'unknown',
                'corridor': 'unknown',
                'zone': 'unknown',
                'junction': 'unknown',
                'latitude': lat,
                'longitude': lng,
                'start_datetime': start_dt.strftime('%Y-%m-%d %H:%M:%S'),
                'resolved_datetime': resolved_dt.strftime('%Y-%m-%d %H:%M:%S'),
                'closed_datetime': "",
                'description': "Operator validated actual feedback."
            })
            
        new_df = pd.DataFrame(new_rows)
        base_df = pd.read_csv(base_file)
        merged_df = pd.concat([base_df, new_df], ignore_index=True)
        temp_file = 'temp_merged_training_data.csv'
        merged_df.to_csv(temp_file, index=False)
        print(f"Merged dataset created with {len(merged_df)} total records.")
        
        try:
            train_hybrid_ensemble(temp_file)
            print("Model weights successfully updated with feedback override samples.")
            success = True
        except Exception as e:
            print(f"Retraining failed: {e}")
            success = False
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        return success
    else:
        print("No feedback samples received. Training on baseline data...")
        try:
            train_hybrid_ensemble(base_file)
            print("Baseline model weights successfully updated.")
            return True
        except Exception as e:
            print(f"Retraining baseline failed: {e}")
            return False

if __name__ == "__main__":
    run_retraining()