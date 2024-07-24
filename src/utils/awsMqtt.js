const AWS = require("aws-sdk");

const AWSIoTData = require("aws-iot-device-sdk");
let awsConfig = {
  identityPoolId: "ap-south-1:ee5b5687-9ebe-4923-a1e3-0ed3f43e0bab",
  mqttEndpoint: "a18kfz9mh1sak-ats.iot.ap-south-1.amazonaws.com",
  region: "ap-south-1",
  clientId: "2sabmitnm40fdbei8shc2b80te",
  userPoolId: "ap-south-1_WuSvUCuMv",
};

const mqttClient = AWSIoTData.device({
  region: awsConfig.region,
  host: awsConfig.mqttEndpoint,
  clientId: awsConfig.clientId,
  protocol: "wss",
  maximumReconnectTimeMs: 8000,
  debug: false,
  accessKeyId: "",
  secretKey: "",
  sessionToken: "",
});

AWS.config.region = awsConfig.region;

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: awsConfig.identityPoolId,
});

AWS.config.credentials.get((err) => {
  if (err) {
    // console.log(AWS.config.credentials);
    throw err;
  } else {
    mqttClient.updateWebSocketCredentials(
      AWS.config.credentials.accessKeyId,
      AWS.config.credentials.secretAccessKey,
      AWS.config.credentials.sessionToken
    );
  }
});

mqttClient.on("connect", () => {
  console.log("mqttClient connected");
  setMqttStatus("Connected");
  mqttClient.subscribe(`sensor/1/right`);
});

mqttClient.on("error", (err) => {
  console.log("mqttClient error:", err);
  setMqttStatus("Shoe connection Error");
});

mqttClient.on("message", (topic, payload) => {
  const msg = JSON.parse(payload.toString());
  console.log(msg);
});
