"use server"

export async function analyzeSsl(targetDomain: string) {
  try {
    // Calling your Python SSL Checker running on port 5006
    // Assuming your Flask route is /api/check-ssl
    const response = await fetch('http://127.0.0.1:5006/api/check-ssl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Stripping out https:// or http:// if the user accidentally pastes it
      body: JSON.stringify({ domain: targetDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0] }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("SSL Analysis Error:", error);
    return { error: "SSL Engine Offline (Port 5006 unreachable). Ensure your Python app.py is running." };
  }
}