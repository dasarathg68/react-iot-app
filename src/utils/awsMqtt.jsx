const awsIot = require("aws-iot-device-sdk");
const AWS = require("aws-sdk");

const device = awsIot.device({
  clientId: "react-iot-client",
  host: "a79cy412s9xeq-ats.iot.ap-south-1.amazonaws.com",
  port: 8883,
  keyPath: "./private.pem.key",
  certPath: "./certificate.pem.crt",
  caPath: "./AmazonRootCA1.pem",
});
AWS.config.region = "ap-south-1";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "ap-south-1:0641972e-d57e-42a5-86ac-aaef82b1af33",
});

device.on("connect", function () {
  console.log("STEP - Connecting to AWS  IoT Core");
  console.log(
    `---------------------------------------------------------------------------------`
  );
  //   device.subscribe("core/broadcast");
});

AWS.config.credentials.get((err) => {
  if (err) {
    console.log(AWS.config.credentials);
    throw err;
  } else {
    device.updateWebSocketCredentials(
      AWS.config.credentials.accessKeyId,
      AWS.config.credentials.secretAccessKey,
      AWS.config.credentials.sessionToken
    );
  }
});
device.on("message", function (topic, payload) {
  console.log("message", topic, payload.toString());
});

device.on("error", function (topic, payload) {
  console.log("Error:", topic, payload.toString());
});
device.subscribe("core/broadcast");
function publish(topic, data) {
  device.publish(topic, JSON.stringify(data));
}
function subscribe(topic) {
  device.subscribe(topic);
}
function connect() {
  device.connect();
}

module.exports = { publish, subscribe, connect };
