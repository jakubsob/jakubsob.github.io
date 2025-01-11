library(fs)
library(stringr)
library(processx)

dirs <- dir_ls("src/content/blog", type = "directory")

for (dir in dirs) {
  cat("Processing directory:", dir, "\n")
  ext <- dir_ls(dir, regexp = "index\\..+$") |> path_ext()
  if (isTRUE(!ext %in% c("md", "mdx"))) {
    next
  }

  input_file <- path(dir, "index", ext = ext)
  cat("Input file:", input_file, "\n")
  # Directory to store the extracted code blocks
  output_dir <- path_dir(input_file)

  # Initialize variables
  in_code_block <- FALSE
  code_block <- ""
  language <- ""
  block_count <- 0

  # Read the input file and extract code blocks
  lines <- readLines(input_file)

  is_draft <- isTRUE(any(str_detect(lines, "^draft: true")))
  if (is_draft) {
    cat("Skipping draft post: ", input_file, "\n")
    next
  }

  for (line in lines) {
    if (str_starts(line, "```")) {
      if (!in_code_block) {
        # Start of a code block
        in_code_block <- TRUE
        language <- str_replace(line, "^```", "")
        block_count <- block_count + 1
        code_block <- ""
      } else {
        # End of a code block
        in_code_block <- FALSE
        if (language == "") {
          language <- "txt"
        }
        language <- str_replace_all(language, "\\{|\\}", "")
        output_file <- path(output_dir, paste0("code_block_", block_count, ".", language))
        writeLines(str_trim(code_block), output_file)
        cat("Created file:", output_file, "\n")
      }
    } else if (in_code_block) {
      # Inside a code block
      code_block <- paste0(code_block, line, "\n")
    }
  }

  # Exit if no code blocks were found
  if (block_count == 0) {
    cat("No code blocks found in", input_file, "\n")
    next
  }

  # Process code blocks with carbon-now
  files <- dir_ls(output_dir, regexp = "code_block_[0-9]+\\..+$")
  for (file in files) {
    source_file <- file
    output_image <- str_replace(source_file, "\\.[^/.]+$", "")
    result <- purrr::safely(run)("carbon-now", c(source_file, "-p", "blog", "--save-as", output_image, "--config", ".carbon-now.json"), spinner = TRUE)
    if (isTRUE(purrr::pluck(result, "result", "status", .default = -1) != 0)) {
      print(result$error)
      next
    }
    cat("Created image:", output_image, "\n")
    file_delete(source_file)

    # Move the image to the public/blog directory
    rel_path <- str_replace(input_file, "^src/content/blog/", "")
    blog_dir <- path_dir(rel_path)
    public_dir <- path("public/blog", blog_dir)
    dir_create(public_dir, recurse = TRUE)
    file_move(paste0(output_image, ".png"), path(public_dir, path_file(paste0(output_image, ".png"))))
    cat("Moved to:", path(public_dir, path_file(paste0(output_image, ".png"))), "\n")
  }
}
