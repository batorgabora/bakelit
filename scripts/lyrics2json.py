#!/usr/bin/env python3
# lyrics2json.py
# usage: copy the lyrics to your clipboard, then run:
#   python3 lyrics2json.py "everything in its right place"
# the finished json line is printed and copied back to your clipboard

import json
import subprocess
import sys

if len(sys.argv) < 2:
    sys.exit('usage: python3 lyrics2json.py "song title"')

title = sys.argv[1].strip().lower()

text = subprocess.run(["pbpaste"], capture_output=True, text=True).stdout
text = (
    text.replace("\r\n", "\n")
        .replace("\u2019", "'")   # curly apostrophe -> straight
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .strip()
        .lower()
)

line = f"{json.dumps(title, ensure_ascii=False)}: {json.dumps(text, ensure_ascii=False)},"

subprocess.run(["pbcopy"], input=line, text=True)
print(line)