import os
import requests
import json
import numpy as np
import faiss

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# -------------------------
# Helper: get embedding (wraps your embedding call)
# -------------------------
def get_embedding(text: str):
    if not text or not text.strip():
        print("get_embedding: Empty input text, returning zero vector of dimension 3072")
        return np.zeros(3072, dtype="float32")

    import time
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": "models/gemini-embedding-2",
        "content": {
            "parts": [{"text": text}]
        }
    }
    headers = {"Content-Type": "application/json"}
    
    for attempt in range(4):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            if resp.status_code == 429:
                sleep_time = (2 ** attempt) + 1
                print(f"Rate limited (429) in Embedding API. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            
            if resp.status_code != 200:
                print(f"Gemini Embedding API Error (Status {resp.status_code}): {resp.text}")
            resp.raise_for_status()
            res_data = resp.json()
            embedding_values = res_data["embedding"]["values"]
            emb = np.array(embedding_values, dtype="float32")
            faiss.normalize_L2(emb.reshape(1, -1))
            return emb
        except Exception as e:
            print(f"Error calling Gemini Embedding API (attempt {attempt+1}): {e}")
            if attempt == 3:
                # Return a zero vector of 3072 elements (dimension of gemini-embedding-2) on failure
                return np.zeros(3072, dtype="float32")
            time.sleep(1)