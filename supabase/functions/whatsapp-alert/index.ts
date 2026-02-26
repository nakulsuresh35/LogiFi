// supabase/functions/whatsapp-alert/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // 1. Parse the incoming webhook payload from Supabase
    const payload = await req.json()
    const record = payload.record // This is the new row inserted by your Python script

    // 2. Only send WhatsApp for CRITICAL drowsiness alerts
    if (record.alert_type !== 'drowsiness_critical') {
      return new Response("Not a critical alert, ignoring.", { status: 200 })
    }

    const vehicleId = record.vehicle_id

    // 3. Securely grab your hidden API keys
    const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    
    // Format: 'whatsapp:+919876543210' (Your number)
    const TO_WHATSAPP_NUMBER = Deno.env.get('OWNER_WHATSAPP_NUMBER') 
    // Format: 'whatsapp:+14155238886' (Twilio Sandbox number)
    const FROM_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') 

    if (!TWILIO_SID || !TWILIO_TOKEN || !TO_WHATSAPP_NUMBER) {
        throw new Error("Missing Twilio credentials in environment variables.")
    }

    // 4. Draft the message
    const message = `🚨 *URGENT LOGIFI ALERT* 🚨\n\nDrowsiness detected in Vehicle: *${vehicleId}*.\nTime: ${new Date().toLocaleTimeString('en-IN')}\n\nPlease contact the driver immediately!`;
    
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
    
    // 5. Package the data for Twilio
    const data = new URLSearchParams()
    data.append('To', TO_WHATSAPP_NUMBER)
    data.append('From', FROM_WHATSAPP_NUMBER)
    data.append('Body', message)

    // 6. Send the request to Twilio API
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    })

    const twilioResult = await twilioResponse.json()

    return new Response(JSON.stringify({ success: true, message: "WhatsApp sent!" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})