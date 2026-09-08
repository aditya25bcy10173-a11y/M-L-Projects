"use server"

export async function analyzeUrl(targetUrl: string) {
  try {
    // Calling your Python URL Scanner running on port 5001
    const response = await fetch('http://127.0.0.1:5001/api/scan-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("URL Analysis Error:", error);
    return { error: "URL Scanner Offline (Port 5001 unreachable)." };
  }
}