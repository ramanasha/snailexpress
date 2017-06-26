const twilio = require('twilio');

module.exports = function(twilioClient){
  return {
    sendSMS: (phone, msg) => {
      phone = "+1" + phone.replace(/-/g, "");

      return twilioClient.messages.create({
          body: msg,
          to: phone,  // Text this number
          from: '+16474908938' // From a valid Twilio number
      });
    }
  }
}
