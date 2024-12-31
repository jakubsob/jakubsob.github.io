---
title: 'Efficient Snapshot Testing in R with CI and GitHub API'
description: 'Learn how to manage snapshot tests in R using CI and GitHub API to ensure consistency across different environments.'
pubDate:  'Dec 13 2024'
tags: ["r", "tests"]
---

Snapshot testing gets difficult when there is more than one variant of the same result.

The reason why snapshot testing might be discouraging is due to the fact that snapshots will most likely fail due to environment settings. If one person runs the tests on a Mac and another on a Linux machine, the snapshots of rendered images will almost certainly be different. Comparing these snapshots will result in a failed test even though the code is correct.

Add CI to the mix, and you have a hot mess.

## The easiest solution is to introduce variants.

Variants are versions of snapshots which were created on different environments.

In [{testthat}](https://testthat.r-lib.org/reference/expect_snapshot.html) variants are stored in separate directories. You can pass a name of the variant to the `variant` argument of `testthat::test_snapshot`. If you have a Linux, set `variant = "linux"`, if you have a Mac, set `variant = "mac"`.

running tests on both will result in two directories:

- tests/testthat/_snaps/linux
- tests/testthat/_snaps/mac

This way we will only compare snapshots generated on the same environment.

## Variants are difficult to work with.

Imagine you have generated a new set of snapshots on you Linux machine.

You check them in and push to the repository. Even if you use the same version of Linux on CI, and the same version of R, the snapshots generated there might differ from the ones you have generated on your machine. It can happen due to different versions of system dependencies which aren't so easy to control.

What can we do about it?

## Use snapshots generated on CI as the source of truth.

Don't check in snapshots generated on your machine. Generate them on CI and download them to your machine instead.

### Step 1: Archive snapshots on CI

Add this step to you CI testing workflow to allow downloading generated snapshots.

```yaml
- name: Archive test snapshots
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-snapshots
    path: |
      tests/testthat/_snaps/**/**/*
```

### Step 2: Detect the environment to create variants

We can create a `make_variant` function to detect the version of the platform, as well as if we are running on CI.

This way even if we use the same OS on CI and locally, we can still differentiate between snapshots generated on CI and locally.

```r
#' tests/testthat/setup.R
is_ci <- function() {
  isTRUE(as.logical(Sys.getenv("CI")))
}

make_variant <- function(platform = shinytest2::platform_variant()) {
  ci <- if (is_ci()) "ci" else NULL
  paste(c(ci, platform), collapse = "-")
}

# In tests: testthat::expect_snapshot(..., variant = make_variant())
```

If we're running on Linux and using R 4.4, the produced variants will be:

- tests/testthat/_snaps/ci-linux-4.4
- tests/testthat/_snaps/linux-4.4

This way we can differentiate between snapshots generated on CI and locally.

### Step 3: Ignore your local snapshots

Don't check in snapshots generated on your machine. Add them to `.gitignore` instead.

```.gitignore
tests/testthat/_snaps/linux-4.4
```

This way we can still generate snapshots locally to get fast feedback, but we'll only keep a single source of truth checked in the repository.

Since you don't track changes in local snapshots, you need to regenerate them before you start making changes to see if they change. It adds some complexity to the process, but it allows to keep the number of shared snapshots in the version control minimal.

Alternatively, you can keep local snapshots, but when doing code review, focus only on the ones generated on CI.

### Step 4: Automate downloading snapshots from CI

To update snapshots generated on CI in Github, we need to:

- Go to Actions.
- Find our workflow run.
- Download the `test-snapshots` artifact.
- Unpack and overwrite the local snapshots.
- `testthat::snapshot_review()` to review the changes.
- Commit and push the changes.

This is a lot of steps. We can automate the most laborious ones with Github API.

The `.download_ci_snaps` function will:
- Get the list of artifacts in the repository identified by `repo` and `owner`. It'll search workflows generated from the branch we're currently on. It will download the latest artifact with the provided `name` (in our case its "test-snapshots") in the repository
- Unzip them and overwrite the local copy of snapshots.

```r
#' Run the following command in the terminal first to authenticate the API:
#' ```sh
#' gh auth login
#' ```
.download_ci_snaps <- function(
    branch = .get_active_branch(),
    repo,
    owner,
    name) {
  artifacts <- gh::gh(glue::glue("GET /repos/{owner}/{repo}/actions/artifacts"))
  id <- artifacts |>
    purrr::pluck(2) |>
    purrr::map(\(x) {
      x$branch <- x$workflow_run$head_branch
      x
    }) |>
    dplyr::bind_rows() |>
    dplyr::filter(branch == !!branch) |>
    dplyr::filter(name == !!name) |>
    dplyr::filter(updated_at == max(updated_at)) |>
    dplyr::filter(!expired) |>
    dplyr::slice_head(n = 1) |>
    dplyr::pull(id)
  system(glue::glue(
    'gh api \\
    -H "Accept: application/vnd.github+json" \\
    -H "X-GitHub-Api-Version: 2022-11-28" \\
    /repos/{owner}/{repo}/actions/artifacts/{id}/zip > _snaps.zip'
  ))
  unzip("_snaps.zip", exdir = "_snaps")
  fs::file_delete("_snaps.zip")
  dir_variant_new <- fs::dir_ls("_snaps")[1]
  dir_variant_old <- fs::path("tests", "testthat", dir_variant_new)
  fs::file_delete(dir_variant_old)
  fs::file_move(dir_variant_new, dir_variant_old)
  invisible(NULL)
}

.get_active_branch <- **function**() {
  res <- system("git status", intern = TRUE)
  stringr::str_remove(res[1], "On branch ")
}
```

After running it we can just do `testthat::snapshot_review()` to review the changes.

---

**💾 Save this function for later, it is in [this gist](https://gist.github.com/jakubsob/83a88e62cdb01ba49f0c292399c5a77d). 💾**

---

## Don't let snapshot testing overwhelm you

Use this process to keep things under control.

- Get a single source of truth for snapshots.
- Don't duplicate snapshots with variants, reduce the maintenance cost.
- Use automation to keep the process fast and smooth.
