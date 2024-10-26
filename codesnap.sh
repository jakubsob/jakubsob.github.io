#!/bin/bash

# Check if the input file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <input_markdown_file>"
  exit 1
fi

# Input Markdown file
INPUT_FILE="$1"

# Directory to store the extracted code blocks
OUTPUT_DIR=$(dirname "$INPUT_FILE")

# Initialize variables
in_code_block=0
code_block=""
language=""
block_count=0

# Read the input file and extract code blocks
while IFS= read -r line; do
  if [[ "$line" =~ ^\`\`\` ]]; then
    if [ $in_code_block -eq 0 ]; then
      # Start of a code block
      in_code_block=1
      language=$(echo "$line" | sed 's/^```//')
      block_count=$((block_count + 1))
      code_block=""
    else
      # End of a code block
      in_code_block=0
      if [ -z "$language" ]; then
        language="txt"
      fi
      output_file="$OUTPUT_DIR/code_block_$block_count.$language"
      echo "$code_block" | sed -e :a -e '/^\n*$/{$d;N;};/\n$/ba' > "$output_file"
      echo "Created file: $output_file"
    fi
  elif [ $in_code_block -eq 1 ]; then
    # Inside a code block
    code_block+="$line"$'\n'
  fi
done < "$INPUT_FILE"

for source_file in "$OUTPUT_DIR"/code_block_*; do
  output_image="${source_file%.*}"
  carbon-now "$source_file" -p blog --save-as "$output_image"
  echo "Created image: $output_image"
  rm "$source_file"
done
