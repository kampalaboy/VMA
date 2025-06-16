let token: string | null = null;
let tokenUpdatedAt: Date = new Date(0);
let headers: Record<string, string> = {};

async function getAuthToken(apiKey: string): Promise<string> {
  const authUrl = "https://iam.cloud.ibm.com/identity/token";

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const data = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  });

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: headers,
      body: data,
      // Note: In a browser environment, you can't disable SSL verification
      // For Node.js, you would need to use node-fetch or configure the global agent
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(response);
      return responseData.access_token;
    } else {
      throw new Error("Failed to get authentication token");
    }
  } catch (error) {
    throw new Error(`Failed to get authentication token: ${error}`);
  }
}

async function updateTokenIfNeeded(apiKey: string): Promise<void> {
  const twentyMinutesInMs = 20 * 60 * 1000;
  if (
    token === null ||
    new Date().getTime() - tokenUpdatedAt.getTime() > twentyMinutesInMs
  ) {
    console.log("updating token");
    token = await getAuthToken(apiKey);
    console.log(token);
    tokenUpdatedAt = new Date();
    headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
}

export { getAuthToken, updateTokenIfNeeded, headers };
