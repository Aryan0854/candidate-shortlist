import requests

# Test files from workspace root
jd_file_path = "../BR_RawData 3.xlsx"
resume_zip_path = "../Resumes 2.zip"

url = "http://localhost:8001/search_resumes_v2"

print("Sending request to local resume screening service...")
try:
    with open(jd_file_path, "rb") as jd, open(resume_zip_path, "rb") as res:
        files = {
            "jd_file": ("BR_RawData 3.xlsx", jd, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            "resume_zip": ("Resumes 2.zip", res, "application/zip")
        }
        resp = requests.post(url, files=files)
        print(f"Response Status: {resp.status_code}")
        if resp.status_code == 200:
            import json
            with open("output.json", "w", encoding="utf-8") as out:
                json.dump(resp.json(), out, indent=2, ensure_ascii=False)
            print("Response successfully written to output.json")
        else:
            print(f"Response Text: {resp.text}")
except Exception as e:
    print(f"Error: {e}")

