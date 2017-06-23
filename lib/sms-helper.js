const accountSid = 'ACe44d17888f1fbc469b63a5696b15d4de';
const authToken = '774e07fe6746cf7150aaa94d18154eff';
const twilio = require('twilio');

module.exports = {
  sendSMS: (phone, msg, cb) => {
    phone = "+1" + phone.replace(/-/g, "");
    let client = new twilio(accountSid, authToken);

    client.messages.create({
        body: msg,
        to: phone,  // Text this number
        from: '+16474908938' // From a valid Twilio number
    })
    .then((message) => cb(null))
    .catch((err) => cb(err));
  }
}
