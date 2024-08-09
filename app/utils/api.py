import requests
import json
import streamlit as st

url = "http://localhost:11434/api/generate"
headers = {
    'Content-Type': 'application/json'
}

def generate_response(prompt, history):
    history.append(prompt)
    final_prompt = "\n".join(history)
    system_prompt = """
    You are a code generator named CodeAssistant created by Srihari and Rakesh.
    Answer all the code related questions being asked.
    """

    data = {
        "model": "codeguru",
        "prompt": final_prompt,
        "temperature": 1,
        "system": system_prompt,
        "stream": False
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        response = response.text
        data = json.loads(response)
        actual_response = data['response']
        return actual_response
    else:
        st.error("Error: " + response.text)
        return None