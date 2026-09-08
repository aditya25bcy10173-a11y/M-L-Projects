"use server"

export async function analyzeIp(targetIp: string) {
  try {
    // Calling your Python IP Checker running on port 5005
    // Assuming your Flask route is /api/check-ip or similar
    const response = await fetch('http://127.0.0.1:5005/api/check-ip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip: targetIp }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("IP Analysis Error:", error);
    return { error: "IP Engine Offline (Port 5005 unreachable). Ensure your Python app.py is running and the route is /api/check-ip." };
  }
}