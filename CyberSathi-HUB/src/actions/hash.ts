"use server"

export async function analyzeHash(hashString: string) {
  try {
    // Calling your Python Flask Microservice running on port 5002
    const response = await fetch('http://127.0.0.1:5002/api/analyze-hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hash: hashString }),
      // Ensures Next.js doesn't cache the result, forcing a fresh scan every time
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Hash Analysis Error:", error);
    return { error: "Forensic Microservice Offline (Port 5002 unreachable)." };
  }
}