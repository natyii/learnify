import os, re, json, time
from pathlib import Path
import pdfplumber
import requests
from tqdm import tqdm
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_ROLE = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET = os.environ.get("SUPABASE_BUCKET", "school_textbooks")
LOCAL_ROOT = Path(os.environ.get("LOCAL_TEXTBOOKS_ROOT", str(Path.home() / "Desktop" / "textbooks_src")))

REST = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

grade_dir_re = re.compile(r"^Grade\s*([0-9]{1,2})$", re.IGNORECASE)

def normalize_subject(s: str) -> str:
  return re.sub(r"[ _]+", "-", s.strip().lower())

def infer_from_path(pdf: Path):
  # Expect: <LOCAL_ROOT>/Grade X/<subject>/<file.pdf>
  rel = pdf.relative_to(LOCAL_ROOT)
  parts = rel.parts
  if len(parts) < 3:
    raise ValueError(f"Bad layout (need Grade X/subject/file.pdf): {rel}")
  m = grade_dir_re.match(parts[0])
  if not m:
    raise ValueError(f"Cannot parse grade: {parts[0]}")
  grade = int(m.group(1))
  subject_raw = parts[1]
  subject = normalize_subject(subject_raw)
  fname = parts[-1]
  # Our canonical storage key:
  key = f"grade-{grade}/{subject}/{fname}"
  return grade, subject, key

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.8, max=6))
def sb_select(table, params):
  r = requests.get(f"{REST}/{table}", headers=HEADERS, params=params, timeout=60)
  r.raise_for_status()
  return r.json()

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.8, max=6))
def sb_insert(table, rows):
  r = requests.post(f"{REST}/{table}", headers=HEADERS, data=json.dumps(rows), timeout=120)
  r.raise_for_status()
  return r.json()

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.8, max=6))
def sb_delete(table, params):
  r = requests.delete(f"{REST}/{table}", headers=HEADERS, params=params, timeout=120)
  r.raise_for_status()
  return r.text

def ensure_textbook(grade: int, subject: str, title: str, file_key: str) -> int:
  rows = sb_select("textbooks", {
    "select": "id",
    "grade": f"eq.{grade}",
    "subject": f"eq.{subject}",
    "file_url": f"eq.{file_key}",
    "limit": 1
  })
  if rows:
    return rows[0]["id"]
  new = sb_insert("textbooks", [{
    "grade": grade,
    "subject": subject,
    "title": title,
    "file_url": file_key,
  }])
  return new[0]["id"]

def chunked(iterable, n):
  buf = []
  for x in iterable:
    buf.append(x)
    if len(buf) >= n:
      yield buf
      buf = []
  if buf:
    yield buf

def index_pdf(pdf: Path):
  grade, subject, key = infer_from_path(pdf)
  title = pdf.stem.replace("-", " ").replace("_", " ").title()

  tb_id = ensure_textbook(grade, subject, title, key)
  sb_delete("textbook_pages", {"textbook_id": f"eq.{tb_id}"})

  with pdfplumber.open(str(pdf)) as book:
    pages = []
    for i, page in enumerate(book.pages, start=1):
      text = page.extract_text() or ""
      text = re.sub(r"\s+\n", "\n", text)
      text = re.sub(r"[ \t]+", " ", text).strip()
      pages.append({
        "textbook_id": tb_id,
        "grade": grade,
        "subject": subject,
        "page_number": i,
        "content": text[:65000],
      })
    for batch in tqdm(list(chunked(pages, 200)), desc=f"Insert pages: {key}"):
      sb_insert("textbook_pages", batch)

def main():
  if not LOCAL_ROOT.exists():
    raise SystemExit(f"LOCAL_TEXTBOOKS_ROOT not found: {LOCAL_TEXTBOOKS_ROOT}")
  pdfs = sorted(LOCAL_ROOT.glob("Grade */*/*.pdf"))
  if not pdfs:
    raise SystemExit(f"No PDFs under {LOCAL_ROOT}/Grade */<subject>/*.pdf")
  print(f"Found {len(pdfs)} PDFs to index.")
  t0 = time.time()
  for pdf in pdfs:
    try:
      index_pdf(pdf)
    except Exception as e:
      print(f"[WARN] {pdf}: {e}")
  print(f"Done in {time.time()-t0:.1f}s")

if __name__ == "__main__":
  main()
