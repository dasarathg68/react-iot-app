/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

import { useEffect } from "react";

import { mqtt, iot, auth } from "aws-iot-device-sdk-v2";
import AWS from "aws-sdk";
import {
  AWS_REGION,
  AWS_COGNITO_IDENTITY_POOL_ID,
  AWS_IOT_ENDPOINT,
} from "./settings";
import $ from "jquery";

function log(message) {
  $("#message").append(`<pre>${message}</pre>`);
}

class AWSCognitoCredentialsProvider extends auth.CredentialsProvider {
  constructor(options, expireInterval = 3600 * 1000) {
    super();
    this.options = options;
    AWS.config.region = options.Region;

    this.sourceProvider = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: options.IdentityPoolId,
    });

    this.awsCredentials = {
      aws_region: options.Region,
      aws_access_id: this.sourceProvider.accessKeyId,
      aws_secret_key: this.sourceProvider.secretAccessKey,
      aws_sts_token: this.sourceProvider.sessionToken,
    };

    this.startCredentialRefresh(expireInterval);
  }

  startCredentialRefresh(expireInterval) {
    setInterval(() => {
      this.refreshCredentials();
    }, expireInterval);
  }

  getCredentials() {
    return this.awsCredentials;
  }

  async refreshCredentials() {
    try {
      await this.sourceProvider.getPromise(); // Using getPromise for simpler async handling
      this.awsCredentials.aws_access_id = this.sourceProvider.accessKeyId;
      this.awsCredentials.aws_secret_key = this.sourceProvider.secretAccessKey;
      this.awsCredentials.aws_sts_token = this.sourceProvider.sessionToken;
    } catch {
      log("Failed to get cognito credentials.");
    }
  }
}

async function connectWebSocket(provider) {
  const config =
    iot.AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket()
      .with_clean_session(true)
      .with_client_id(`pub_sub_sample(${new Date()})`)
      .with_endpoint(AWS_IOT_ENDPOINT)
      .with_credential_provider(provider)
      .with_port(8883)
      .with_password("password")
      .with_keep_alive_seconds(30)
      .build();
  console.log(config);

  log("Connecting websocket...");
  const client = new mqtt.MqttClient();
  const connection = client.new_connection(config);

  connection.on("connect", () => log("Connection started"));
  connection.on("interrupt", (error) =>
    log(`Connection interrupted: ${error}`)
  );
  connection.on("resume", (return_code, session_present) => {
    log(`Resumed: rc: ${return_code} existing session: ${session_present}`);
  });
  connection.on("disconnect", () => log("Disconnected"));
  connection.on("error", (error) => log(`Connection error: ${error}`));

  await connection.connect();
  return connection;
}

function Mqtt311() {
  const testTopic = "/test/topic";
  let connectionPromise;
  let sampleMessageCount = 0;
  let userMessageCount = 0;

  async function pubSub() {
    try {
      const provider = new AWSCognitoCredentialsProvider({
        IdentityPoolId: AWS_COGNITO_IDENTITY_POOL_ID,
        Region: AWS_REGION,
      });

      await provider.refreshCredentials();
      const connection = await connectWebSocket(provider);
      await connection.subscribe(
        testTopic,
        mqtt.QoS.AtLeastOnce,
        handleIncomingMessage
      );

      startPublishing(connection);
    } catch (error) {
      log(`Error while connecting: ${error}`);
    }
  }

  function handleIncomingMessage(topic, payload) {
    const message = new TextDecoder("utf8").decode(new Uint8Array(payload));
    log(`Message received: topic="${topic}" message="${message}"`);
  }

  function startPublishing(connection) {
    log("Start publish");
    const publishMessage = () => {
      sampleMessageCount++;
      const msg = `THE SAMPLE PUBLISHES A MESSAGE EVERY MINUTE {${sampleMessageCount}}`;
      connection.publish(testTopic, msg, mqtt.QoS.AtLeastOnce);
    };

    publishMessage(); // Initial publish
    setInterval(publishMessage, 60000); // Publish every minute
  }

  useEffect(() => {
    pubSub(); // Initial execution
  }, []);

  async function publishUserMessage() {
    try {
      const msg = `BUTTON CLICKED {${userMessageCount}}`;
      const connection = await connectionPromise;
      await connection.publish(testTopic, msg, mqtt.QoS.AtLeastOnce);
      userMessageCount++;
    } catch (error) {
      log(`Error publishing: ${error}`);
    }
  }

  async function closeConnection() {
    try {
      const connection = await connectionPromise;
      await connection.disconnect();
    } catch (error) {
      log(`Error disconnecting: ${error}`);
    }
  }

  return (
    <>
      <div>
        <button className="btn" onClick={publishUserMessage}>
          Publish A Message
        </button>
      </div>
      <div>
        <button className="btn" onClick={closeConnection}>
          Disconnect
        </button>
      </div>
      <div id="message">Mqtt311 Pub Sub Sample</div>
    </>
  );
}

export default Mqtt311;

// const awsIot = require("aws-iot-device-sdk");
// const AWS = require("aws-sdk");

// const device = awsIot.device({
//   clientId: "react-iot-client",
//   host: "a79cy412s9xeq-ats.iot.ap-south-1.amazonaws.com",
//   port: 8883,
//   keyPath: "./private.pem.key",
//   certPath: "./certificate.pem.crt",
//   caPath: "./AmazonRootCA1.pem",
// });
// AWS.config.region = "ap-south-1";
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: "ap-south-1:0641972e-d57e-42a5-86ac-aaef82b1af33",
// });

// device.on("connect", function () {
//   console.log("STEP - Connecting to AWS  IoT Core");
//   console.log(
//     `---------------------------------------------------------------------------------`
//   );
//   //   device.subscribe("core/broadcast");
// });

// AWS.config.credentials.get((err) => {
//   if (err) {
//     console.log(AWS.config.credentials);
//     throw err;
//   } else {
//     device.updateWebSocketCredentials(
//       AWS.config.credentials.accessKeyId,
//       AWS.config.credentials.secretAccessKey,
//       AWS.config.credentials.sessionToken
//     );
//   }
// });
// device.on("message", function (topic, payload) {
//   console.log("message", topic, payload.toString());
// });

// device.on("error", function (topic, payload) {
//   console.log("Error:", topic, payload.toString());
// });
// device.subscribe("core/broadcast");
// function publish(topic, data) {
//   device.publish(topic, JSON.stringify(data));
// }
// function subscribe(topic) {
//   device.subscribe(topic);
// }
// function connect() {
//   device.connect();
// }

// module.exports = { publish, subscribe, connect };
