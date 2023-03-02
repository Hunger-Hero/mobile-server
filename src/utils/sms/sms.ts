require("dotenv").config();

//import xhr2 without any type definition
const XMLHttpRequests = require("xhr2");

function sendSMS(phone: String, message: String) {
  //  var xhr = new XMLHttpRequest();
  var request = new XMLHttpRequests();
  require("dotenv").config();

  request.open("POST", "https://api.wittyflow.com/v1/messages/send");

  request.setRequestHeader("Content-Type", "application/json");

  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      console.log("Status:", this.status);
      console.log("Headers:", this.getAllResponseHeaders());
      console.log("Body:", this.responseText);
    }
  };

  var body = {
    from: "Aquamet",
    to: phone,
    type: "1", // <!-- use 0 for flash sms and 1 for plain sms -->
    message: message,
    app_id: process.env.APP_ID,
    app_secret: process.env.APP_SECRET,
  };

  request.send(JSON.stringify(body));
}

export default sendSMS;
