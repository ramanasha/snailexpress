const twilio = require('twilio');

module.exports = function(twilioClient, ownerNumber, voiceServerUrl){
  voiceServerUrl = voiceServerUrl.replace('https', 'http');
  return {
    sendSMS: (phone, msg) => {
      phone = "+1" + phone.replace(/-/g, "");

      return twilioClient.messages.create({
          body: msg,
          to: phone,  // Text this number
          from: '+16474908938' // From a valid Twilio number
      });
    },
    sendPhoneMessageToOwner: (url) => {
      if (!url.startsWith("/")) {
        url = '/' + url;
      }
      url = `${voiceServerUrl}${url}`;
      console.log(url);
      return twilioClient.calls.create({
          url: url,
          to: ownerNumber,  // Text this number
          from: '+16474908938' // From a valid Twilio number
      });
    },
  };
};
