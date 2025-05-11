// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mic = require("mic");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

// Configure IBM Watson Speech to Text service
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: "81F7RrschMIJRrtJXTEyWr2VRSz0MzKCMqm3vwWkaOJM", // Replace with your Watson API key
  }),
  serviceUrl: "https://api.us-south.speech-to-text.watson.cloud.ibm.com", // Or your region's endpoint
});

// Setup Express server
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store active microphone instances
const activeMics = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Start recording and transcribing
  socket.on("startRecording", () => {
    // Don't start a new recording if one is already in progress for this socket
    if (activeMics.has(socket.id)) {
      socket.emit("error", { message: "Recording already in progress" });
      return;
    }

    console.log("Starting recording for client:", socket.id);

    try {
      // Configure microphone
      const micInstance = mic({
        rate: 16000,
        channels: 1,
        debug: false,
        exitOnSilence: 6, // Stop recording after 6 seconds of silence
      });

      const micInputStream = micInstance.getAudioStream();

      // Setup Watson streaming
      const recognizeParams = {
        contentType: "audio/l16; rate=16000",
        interimResults: true,
        model: "en-US_BroadbandModel", // Choose an appropriate model
        inactivityTimeout: -1, // Don't timeout
      };

      const recognizeStream =
        speechToText.recognizeUsingWebSocket(recognizeParams);

      // Handle data from Watson
      recognizeStream.on("data", (data) => {
        if (data.results && data.results.length > 0) {
          const transcript = data.results[0].alternatives[0].transcript;
          const isFinal = data.results[0].final;

          socket.emit("transcription", {
            transcript,
            isFinal,
          });

          console.log(
            `${isFinal ? "Final" : "Interim"} transcript: ${transcript}`
          );
        }
      });

      // Handle errors
      recognizeStream.on("error", (err) => {
        console.error("Watson error:", err);
        socket.emit("error", {
          message: err.message || "Watson transcription error",
        });
        stopRecording(socket.id);
      });

      // Handle end of streaming
      recognizeStream.on("close", () => {
        console.log("Watson connection closed");
      });

      // Pipe microphone input to Watson
      micInputStream.pipe(recognizeStream);

      // Start recording
      micInstance.start();

      // Store references to close them later
      activeMics.set(socket.id, {
        mic: micInstance,
        stream: recognizeStream,
      });

      socket.emit("recordingStarted");
    } catch (error) {
      console.error("Error starting recording:", error);
      socket.emit("error", {
        message: error.message || "Failed to start recording",
      });
    }
  });

  // Stop recording
  socket.on("stopRecording", () => {
    stopRecording(socket.id);
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    stopRecording(socket.id);
  });
});

// Function to stop recording for a client
function stopRecording(socketId) {
  const recording = activeMics.get(socketId);
  if (recording) {
    console.log("Stopping recording for client:", socketId);

    try {
      recording.mic.stop();
      recording.stream.end();
      activeMics.delete(socketId);

      // Notify client
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit("recordingStopped");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }
}

// API endpoint to get Watson token
app.post("/api/watson-token", async (req, res) => {
  try {
    const authParams = {
      url: "https://iam.cloud.ibm.com/identity/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      form: {
        grant_type: "urn:ibm:params:oauth:grant-type:apikey",
        apikey: "81F7RrschMIJRrtJXTEyWr2VRSz0MzKCMqm3vwWkaOJM", // Replace with your Watson API key
      },
    };

    // In a real implementation, you would use a library like axios or request
    // to make this HTTP request to IBM. Here we're simplifying by returning
    // the IamAuthenticator's token directly.
    const authenticator = new IamAuthenticator({
      apikey: "81F7RrschMIJRrtJXTEyWr2VRSz0MzKCMqm3vwWkaOJM",
    });

    const token = await authenticator.tokenManager.getToken();
    res.json({ token });
  } catch (error) {
    console.error("Error getting Watson token:", error);
    res.status(500).json({ error: "Failed to get token" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
