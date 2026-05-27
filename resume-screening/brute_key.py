import requests
import concurrent.futures

# Base key: AIzaSyBRn0swmMrdbvgwOwKDQUGyA1CBfiukLE (38 chars)
base = "AIzaSyBRn0swmMrdbvgwOwKDQUGyA1CBfiukLE"

# Let's generate variations
keys = set()

# Visual substitutions
subs = {
    30: ["1", "l", "I", "L", "i"], # A1CB -> AlCB, AICB, etc.
    20: ["O", "0", "o"],          # gwOwKD -> gw0wKD
    9: ["0", "O", "o"],           # BRn0 -> BRnO
    25: ["Q", "O", "0"],          # KDQU -> KDOU
    26: ["U", "V", "u", "v"],     # U vs V
    27: ["G", "6", "C", "O"],     # G vs 6 vs C
    33: ["i", "l", "1", "I"],     # fiuk -> fluk, f1uk
    12: ["m", "n", "r"],          # swm -> swn
    13: ["M", "N", "H"],          # mM -> mN
}

# Generate single-substitution keys
for pos, chars in subs.items():
    for c in chars:
        k_list = list(base)
        k_list[pos] = c
        keys.add("".join(k_list))

# Generate insertion keys at visual boundaries (e.g. index 30, index 20, etc.)
chars_to_insert = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
for pos in [10, 13, 20, 25, 30, 33, 37]:
    for c in chars_to_insert:
        k = base[:pos] + c + base[pos:]
        keys.add(k)

print(f"Generated {len(keys)} unique key variations to test.")

def test_key(key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            return key
    except Exception:
        pass
    return None

# Test keys in parallel
valid_key = None
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    results = executor.map(test_key, list(keys))
    for r in results:
        if r:
            valid_key = r
            print(f"\n>>> SUCCESS! Valid Key: {valid_key}")
            break

if not valid_key:
    print("\nNo valid key found in variations.")
