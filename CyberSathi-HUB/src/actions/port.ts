"use server"

export async function analyzePorts(targetHost: string) {
  try {
    // Calling your Python Port Scanner running on port 5003
    // Assuming your Flask route is /api/scan-ports
    const response = await fetch('http://127.0.0.1:5003/api/scan-ports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Using 'target' as the standard key, adjust if your Python script expects 'ip' or 'domain'
      body: JSON.stringify({ target: targetHost }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Port Scan Error:", error);
    return { error: "Port Scanner Offline (Port 5003 unreachable). Ensure your Python app.py is running." };
  }
}