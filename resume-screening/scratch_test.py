import requests

key = "AIzaSyBRn0swmMrdbvgwOwKDQUGyA1CBtfiukLE"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
r = requests.get(url)
print("Status:", r.status_code)
if r.status_code == 200:
    for m in r.json().get("models", []):
        print(m.get("name"))
else:
    print(r.text)
