import { spawn } from 'child_process';
import path from 'path';

interface RecommendationInput {
  lat: number;
  lng: number;
  type: string;
  severity: string;
}

interface RecommendationOutput {
  predicted_duration: number;
  recommended_marshals: number;
  recommended_barricading: string;
  recommended_diversion: string;
}

export const getIncidentRecommendations = (input: RecommendationInput): Promise<RecommendationOutput> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../../../ml-engine/traffic_predictor/recommend_incident.py');
    const pythonEnvPath = path.resolve(__dirname, '../../../ml-engine/venv/Scripts/python.exe');

    // Spawn Python process
    const pyProcess = spawn(pythonEnvPath, [scriptPath], {
      cwd: path.dirname(scriptPath),
    });

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process failed with code ${code}. Error: ${stderrData}`));
      }
      try {
        const jsonStart = stdoutData.indexOf('{');
        const jsonEnd = stdoutData.lastIndexOf('}') + 1;
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("No JSON payload found in stdout");
        }
        const jsonString = stdoutData.substring(jsonStart, jsonEnd);
        const result = JSON.parse(jsonString);
        resolve(result);
      } catch (err: any) {
        reject(new Error(`Failed to parse Python stdout. Error: ${err.message}. Raw: ${stdoutData}`));
      }
    });

    // Write input JSON to Python stdin
    pyProcess.stdin.write(JSON.stringify(input));
    pyProcess.stdin.end();
  });
};

export const triggerModelRetraining = (feedbackList: any[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../../../ml-engine/traffic_predictor/retrain_engine.py');
    const pythonEnvPath = path.resolve(__dirname, '../../../ml-engine/venv/Scripts/python.exe');

    // Spawn Python retraining process
    const pyProcess = spawn(pythonEnvPath, [scriptPath], {
      cwd: path.dirname(scriptPath),
    });

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Retraining process failed with code ${code}. Error: ${stderrData}`));
      }
      resolve(stdoutData.trim());
    });

    // Write feedback list as JSON to Python stdin
    pyProcess.stdin.write(JSON.stringify(feedbackList));
    pyProcess.stdin.end();
  });
};