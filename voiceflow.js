const axios = require('axios');

// View our quick start guide to get your API key:
// https://developer.voiceflow.com/reference/overview
const apiKey = '{VF.DM.65af15c182dc5400075b72e3.2x8FxR4ZVmpZQ9vQ}';

const userID = 'user_123'; // Unique ID used to track conversation state
const userInput = 'Hello world!'; // User's message to your Voiceflow assistant

const body = {
  action: {
    type: 'text',
    payload: userInput,
  },
};

async function startInteract() {
  // Start a conversation
  const response = await axios({
    method: 'POST',
    baseURL: 'https://general-runtime.voiceflow.com',
    url: `/state/user/${userID}/interact`,
    headers: {
      Authorization: apiKey,
    },
    data: body,
  });

  // Log the response
  console.log(response.data);
}

startInteract().catch((error) => console.error(error));
