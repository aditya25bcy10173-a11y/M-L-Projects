export const sendEmergencyAlert = async (incident: any) => {
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`\n🚨 [MOCK SMS DISPATCH - ${timestamp}]`);
  console.log(`   To: ON-DUTY_TEMPLE_GUARDS_GROUP`);
  console.log(`   Body: [ALERT] CRITICAL ${incident.type} reported!`);
  console.log(`   Location: Lat ${incident.lat}, Lng ${incident.lng} (${incident.siteId})`);
  console.log(`   Details: ${incident.description}`);
  console.log(`=========================================\n`);
};