import requests
import base64
import json

# --- Configuration ---
webhook_url = "https://n8n.ecobetug.com/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d"
# webhook_url = "https://n8n.ecobetug.com/webhook-test/bf4dd093-bb02-472c-9454-7ab9af97bd1d"
api_key = "YOUR_API_KEY_HERE"
audio_file_path = "hello.mp3"  # Replace with your actual file path

# --- Encode audio file as base64 ---
with open(audio_file_path, "rb") as f:
    audio_data = base64.b64encode(f.read()).decode("utf-8")

# --- Construct request body ---
payload = [
    {
        "headers": {
            "host": "n8n.ecobetug.com",
            "user-agent": "PythonScript/1.0",
            "content-type": "application/json",
            "x-api-key": api_key
        },
        "params": {},
        "query": {},
        "body": [
            {
                "sessionId": 1,
                "update_id": 999,
                "message": {
                    "message_id": 777,
                    "from": {
                        "id": 12345,
                        "is_bot": False,
                        "first_name": "Paul",
                        "username": "Jean",
                        "language_code": "en"
                    },
                    "chat": {
                        "id": 5384581914,
                        "first_name": "Jean Paul",
                        "username": "JeanLacroix",
                        "type": "private"
                    },
                    "date": 1748687507,
                    "voice": {
                        "file_name": audio_file_path,
                        "mime_type": "audio/mp3",
                        "data": audio_data
                    }
                }
            }
        ],
        "webhookUrl": webhook_url,
        "executionMode": "production"
    }
]

# --- Send POST request ---
headers = {
    "Content-Type": "application/json",
    "x-api-key": api_key
}

response = requests.post(webhook_url, headers=headers,
                         data=json.dumps(payload))

# --- Print response ---
print(response)

# print(f"Status Code: {response.status_code}")
# print(f"Response: {response.text}")

if response.status_code == 200:
    with open("downloaded_audio.mp3", "wb") as f:
        f.write(response.content)
    print("✅ Audio downloaded as downloaded_audio.mp3")
else:
    print(f"❌ Failed: {response.status_code}")
    print(response.text)
