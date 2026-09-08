"use server"

export async function analyzeEmail(emailText: string) {
  try {
    // Calling your Python Flask Orchestrator running on port 5008
    const response = await fetch('http://127.0.0.1:5008/api/analyze-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_text: emailText }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Email Analysis Error:", error);
    return { error: "Email Orchestrator Offline (Port 5008 unreachable)." };
  }
}