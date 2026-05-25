#!/usr/bin/env python3
"""
After quarto renders a .qmd to .md, restore the original frontmatter
and strip the H1 heading that Quarto injects from the title field.
"""

import re
import sys
from pathlib import Path


def extract_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter_block, rest) where frontmatter_block includes the --- delimiters."""
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---", 3)
    if end == -1:
        return "", text
    split = end + 4  # include the closing ---
    return text[:split], text[split:]


def fix(qmd_path: Path) -> None:
    md_path = qmd_path.with_suffix(".md")

    original_fm, _ = extract_frontmatter(qmd_path.read_text())
    rendered = md_path.read_text()

    _, body = extract_frontmatter(rendered)

    # Remove H1 heading Quarto injects from the title
    body = re.sub(r"^# .+\n?", "", body, count=1, flags=re.MULTILINE)

    # Strip leading blank lines left after removal
    body = body.lstrip("\n")

    md_path.write_text(original_fm + "\n\n" + body)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: fix_md.py path/to/file.qmd", file=sys.stderr)
        sys.exit(1)
    fix(Path(sys.argv[1]))
