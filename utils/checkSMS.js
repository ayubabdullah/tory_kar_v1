const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE;
const client = require("twilio")(accountSid, authToken);

const checkSMS = async ({ phone, code }) => {
  const message = await client.verify
    .services(serviceId)
    .verificationChecks.create({ to: phone, code });

  console.log(message);
};

module.exports = checkSMS;
