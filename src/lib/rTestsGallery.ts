export type GitHubHeaders = Record<string, string>;

interface GitTreeItem {
  type: string;
  path: string;
}

interface GitTreeResponse {
  tree?: GitTreeItem[];
}

export interface ParsedReadme {
  title: string;
  description: string;
  fullContent: string;
}

export interface RepositoryFileItem {
  type: string;
  path: string;
  name: string;
  children?: RepositoryFileItem[];
  isExpanded?: boolean;
  [key: string]: unknown;
}

const REPO_OWNER = "jakubsob";
const REPO_NAME = "r-tests-gallery";
const REPO_BRANCH = "main";

function treeApiUrl(): string {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_BRANCH}?recursive=1`;
}

function contentsApiUrl(path: string): string {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
}

function readmeRawUrl(dirName: string): string {
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${dirName}/README.md`;
}

export function createGitHubAuthHeaders(token?: string): GitHubHeaders {
  if (!token) {
    return {};
  }

  return { Authorization: `token ${token}` };
}

function isRelevantTopLevelDirectory(dirName: string): boolean {
  return !dirName.startsWith(".") && dirName !== "renv";
}

export function parseReadmeContent(
  content: string,
  fallbackName: string,
): ParsedReadme {
  const lines = content.split("\n");
  let title = fallbackName.replace(/-/g, " ");
  let description = "";

  const titleMatch = lines.find((line) => line.startsWith("#"));
  if (titleMatch) {
    title = titleMatch.replace(/^#+\s*/, "").trim();
  }

  let foundWhenToUse = false;
  const descriptionLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## When to use this pattern?")) {
      foundWhenToUse = true;
      continue;
    }

    if (foundWhenToUse) {
      if (line.startsWith("#")) {
        break;
      }

      if (line.trim()) {
        descriptionLines.push(line.trim());
      } else if (descriptionLines.length > 0) {
        break;
      }
    }
  }

  if (descriptionLines.length > 0) {
    description = descriptionLines.join(" ").trim();
  }

  return {
    title,
    description,
    fullContent: content,
  };
}

export async function fetchTopLevelDirectories(
  headers: GitHubHeaders,
): Promise<string[]> {
  try {
    const response = await fetch(treeApiUrl(), { headers });
    if (!response.ok) {
      console.error(
        "GitHub Tree API request failed:",
        response.status,
        response.statusText,
      );
      return [];
    }

    const treeData = (await response.json()) as GitTreeResponse;
    const directories = new Set<string>();

    for (const item of treeData.tree || []) {
      if (item.type !== "tree" || !item.path) {
        continue;
      }

      const topLevelDir = item.path.split("/")[0];
      if (isRelevantTopLevelDirectory(topLevelDir)) {
        directories.add(topLevelDir);
      }
    }

    return Array.from(directories);
  } catch (error) {
    console.error("Error fetching repository tree:", error);
    return [];
  }
}

export async function fetchDirectoryReadme(
  dirName: string,
  headers: GitHubHeaders,
): Promise<string> {
  try {
    const response = await fetch(readmeRawUrl(dirName), { headers });
    if (!response.ok) {
      return "";
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching README for ${dirName}:`, error);
    return "";
  }
}

export async function fetchDirectoryReadmeParsed(
  dirName: string,
  headers: GitHubHeaders,
): Promise<ParsedReadme> {
  const readmeContent = await fetchDirectoryReadme(dirName, headers);

  if (!readmeContent) {
    const title = dirName.replace(/-/g, " ");
    return {
      title,
      description: "",
      fullContent: "No README available.",
    };
  }

  return parseReadmeContent(readmeContent, dirName);
}

export async function buildRepositoryFileTree(
  path: string,
  headers: GitHubHeaders,
  maxDepth = 3,
  currentDepth = 0,
): Promise<RepositoryFileItem[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const response = await fetch(contentsApiUrl(path), { headers });
    if (!response.ok) {
      console.error(
        `API failed for ${path}: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const contents = (await response.json()) as RepositoryFileItem[];
    if (!Array.isArray(contents)) {
      console.error(`Contents for ${path} is not an array`);
      return [];
    }

    const tree: RepositoryFileItem[] = [];

    for (const item of contents) {
      if (item.type === "dir") {
        const children = await buildRepositoryFileTree(
          item.path,
          headers,
          maxDepth,
          currentDepth + 1,
        );

        tree.push({
          ...item,
          children,
          isExpanded: true,
        });
        continue;
      }

      tree.push(item);
    }

    return tree;
  } catch (error) {
    console.error(`Error fetching contents for ${path}:`, error);
    return [];
  }
}
