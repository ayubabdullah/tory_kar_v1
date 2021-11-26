const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE;
const client = require("twilio")(accountSid, authToken);

const sendSMS = async ({ phone }) => {
  const message = await client.verify
    .services(serviceId)
    .verifications.create({ to: phone, channel: "sms" });

  console.log("Message sent", message);
};

module.exports = sendSMS;
