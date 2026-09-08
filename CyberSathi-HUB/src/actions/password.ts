"use server"

export async function analyzePassword(passwordStr: string) {
  try {
    // Calling your Python Password Analyzer running on port 5000
    const response = await fetch('http://127.0.0.1:5000/api/analyze-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: passwordStr }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Password Analysis Error:", error);
    return { error: "Password Engine Offline (Port 5000 unreachable)." };
  }
}