#!/usr/bin/env bash
set -euo pipefail

# REQUIREMENTS:
#   - supabase CLI installed and logged in (`supabase login`)
#   - BUCKET exists (school_textbooks)
#   - macOS/Linux with bash

SRC_ROOT="${LOCAL_TEXTBOOKS_ROOT:-$HOME/Desktop/textbooks_src}"
BUCKET="${SUPABASE_BUCKET:-school_textbooks}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: supabase CLI not found. Install with: brew install supabase/tap/supabase" >&2
  exit 1
fi

if [ ! -d "$SRC_ROOT" ]; then
  echo "ERROR: SRC_ROOT not found: $SRC_ROOT" >&2
  exit 1
fi

normalize_subject() {
  # lowercase, spaces -> -, underscores -> -
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[ _]+/-/g'
}

# Find PDFs under "Grade */<subject>/*.pdf"
# This supports spaces in filenames/dirs
echo "Scanning $SRC_ROOT for PDFs..."
mapfile -d '' FILES < <(find "$SRC_ROOT" -type f -name '*.pdf' -print0)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No PDFs found under $SRC_ROOT" >&2
  exit 1
fi

echo "Found ${#FILES[@]} PDFs. Uploading to bucket \"$BUCKET\" ..."
for f in "${FILES[@]}"; do
  # Expect .../Grade X/<subject>/<file.pdf>
  # Extract grade ("X") and subject
  rel="${f#"$SRC_ROOT"/}"
  IFS='/' read -r grade_dir subject fname <<< "$rel"

  if [[ ! "$grade_dir" =~ ^Grade[[:space:]]*([0-9]{1,2})$ ]]; then
    echo "WARN: skip (cannot parse grade): $rel" >&2
    continue
  fi
  grade="${BASH_REMATCH[1]}"

  if [ -z "${subject:-}" ] || [ -z "${fname:-}" ]; then
    echo "WARN: skip (cannot parse subject/file): $rel" >&2
    continue
  fi

  subj_norm="$(normalize_subject "$subject")"
  dest_path="grade-${grade}/${subj_norm}/${fname}"

  # Upload single file to normalized destination path
  # supabase CLI requires --path include the filename
  supabase storage upload \
    --bucket "$BUCKET" \
    --file "$f" \
    --path "$dest_path" \
    --no-confirm >/dev/null || {
      echo "WARN: upload failed for $f -> $dest_path (may already exist)" >&2
    }

  echo "OK  $grade_dir/$subject/$fname  -->  $dest_path"
done

echo "Done. Sample list:"
supabase storage list --bucket "$BUCKET" --path "grade-12/amharic" || true
