import os
import requests
import json
import re

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

PRIMARY_TECH_SKILLS = {
    # Languages & Core Tech
    "java", "python", "sql", "unix", "linux", "c", "html", "dotnet", ".net", "springboot", "spring",
    # Cloud & DevOps
    "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "git", "digitalocean",
    # Tools & Platforms
    "splunk", "datadog", "servicenow", "pagerduty", "jira", "grafana", "prometheus", "elk", "kibana",
    "appdynamics", "autosys", "remedy", "servicenow", "winscp", "putty", "postman", "jmeter",
    # ML & Modern Tech
    "ai", "genai", "generative ai", "ml", "machine learning", "nlp", "data engineering",
    # Domains & Roles
    "support", "incident management", "noc", "l1", "l2", "l3", "production support", "application support",
    "telecom", "dwdm", "sdh", "transmission", "testing", "api testing", "api", "database management", "oracle"
}

def extract_skills_from_text(text):
    """
    Calls the LLM to extract skills from JD or Resume text.
    Returns a list of skills.
    """
    if not text or not text.strip():
        print("extract_skills_from_text: Empty text input, returning empty list")
        return []

    import time
    prompt = f"""
    Extract only the skills from the text below.
    Return them as a comma-separated list, nothing else.

    TEXT:
    {text}
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 200
        }
    }
    headers = {"Content-Type": "application/json"}
    
    for attempt in range(4):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            if resp.status_code == 429:
                sleep_time = (2 ** attempt) + 1
                print(f"Rate limited (429) in Content API. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            
            if resp.status_code != 200:
                print(f"Gemini Content API Error (Status {resp.status_code}): {resp.text}")
            resp.raise_for_status()
            res_data = resp.json()
            content = res_data["candidates"][0]["content"]["parts"][0]["text"]
            # Split by comma and return clean list
            return [s.strip() for s in content.split(",") if s.strip()]
        except Exception as e:
            print(f"Error calling Gemini Content API (attempt {attempt+1}): {e}")
            if attempt == 3:
                return []
            time.sleep(1)
            
    return []



def normalize_skill(s):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9\s]+', '', s)   # remove punctuation but keep spaces
    s = re.sub(r'\s+', ' ', s)           # collapse multiple spaces
    return s


def split_skills(skills):
    if isinstance(skills, list):
        raw = skills
    else:
        raw = skills.split(",")  # handles comma-separated resume fields
    
    cleaned = [normalize_skill(s) for s in raw]
    return [s for s in cleaned if s]  # remove empty items


def get_primary_skill(jd_skills, resume_skills):
    
    jd_list = split_skills(jd_skills)
    resume_list = split_skills(resume_skills)

    jd_norm = set(jd_list)
    resume_norm = set(resume_list)

    overlap = jd_norm.intersection(resume_norm)

    # filter only primary tech skills
    primary = [s for s in overlap if s in PRIMARY_TECH_SKILLS]

    if not primary:
        return "None"

    # Return top 5 primary skills as a comma-separated string!
    formatted_skills = [s.title() for s in primary[:5]]
    return ", ".join(formatted_skills)



def calculate_skill_overlap(jd_skills, resume_skills):
    
    jd_list = split_skills(jd_skills)
    resume_list = split_skills(resume_skills)

    jd_norm = set(jd_list)
    resume_norm = set(resume_list)

    overlap = jd_norm.intersection(resume_norm)

    if len(jd_norm) == 0:
        return 0
    
    return (len(overlap) / len(jd_norm)) * 100, list(overlap)


def compute_final_score(semantic_similarity, overlap_score, alpha=0.7):
    """
    Combines semantic similarity and skill overlap into a final score.
    alpha: weight for semantic similarity (0 to 1)
    """
    final_score = (alpha * semantic_similarity) + ((1 - alpha) * overlap_score)

    return round(final_score, 2)


def format_results_for_ui(results_all, top_n=5):
    """
    Accepts results_all (a list of dicts), e.g.:

    [
        {
            "br_id": "38358BR",
            "job_description": "...",
            "jd_skills": "...",
            "matches": [...]
        },
        ...
    ]

    Returns a list of:
    {
        "br_id": "...",
        "matches": "12345 (90.2%), 67890 (88.1%), ..."
    }
    """

    ui_rows = []

    for item in results_all:
        br_id = item.get("br_id")
        matches = item.get("matches", [])

        # Sort by final_score DESC
        sorted_matches = sorted(
            matches, key=lambda x: x.get("final_score", 0), reverse=True
        )

        # Take top N
        top_matches = sorted_matches[:top_n]

        # Format “resume_id (score%)”
        formatted = [
            f"{m['resume_id']} ({m['final_score']:.2f}%)"
            for m in top_matches
        ]

        ui_rows.append({
            "br_id": br_id,
            "matches": ", ".join(formatted)
        })

    return ui_rows
