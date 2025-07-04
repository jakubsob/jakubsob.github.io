import React, { useState, useEffect } from "react";
import FileTreeComponent from "./FileTreeComponent.jsx";
import FilePreview from "./FilePreview.jsx";

const IDEInterface = ({ fileTree, dirName, hasError }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper function to recursively find the first file in tests/testthat or tests/ directories
  const findFirstTestFile = (
    items,
    targetPaths = ["tests/testthat", "tests"]
  ) => {
    if (!items || !Array.isArray(items)) return null;

    // First, try to find files in the prioritized test directories
    for (const targetPath of targetPaths) {
      const result = findFileInPath(items, targetPath);
      if (result) return result;
    }

    return null;
  };

  // Helper function to find the first file in a specific path
  const findFileInPath = (items, targetPath) => {
    const pathParts = targetPath.split("/");

    // Navigate through the directory structure
    let currentItems = items;
    for (const part of pathParts) {
      const dir = currentItems.find(
        (item) => item.type === "dir" && item.name === part
      );
      if (!dir || !dir.children) {
        return null; // Path doesn't exist
      }
      currentItems = dir.children;
    }

    // Find the first file in the target directory
    const firstFile = currentItems.find((item) => item.type === "file");
    return firstFile || null;
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  // Auto-select first test file when component mounts or fileTree changes
  useEffect(() => {
    if (fileTree && !selectedFile) {
      const firstTestFile = findFirstTestFile(fileTree);
      if (firstTestFile) {
        setSelectedFile(firstTestFile);
      }
    }
  }, [fileTree, selectedFile]);

  if (hasError) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-xl font-medium text-red-700 mb-2">
              Unable to Load Repository Data
            </h3>
            <p className="text-red-600 max-w-md mx-auto">
              There was an error fetching the repository contents. This could be
              due to GitHub API rate limits or network issues. Please try again
              later.
            </p>
          </div>
          <div className="mt-6">
            <a
              href={`https://github.com/jakubsob/r-tests-gallery/tree/main/${dirName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-16rem)]
        grid
        grid-cols-1
        lg:grid-cols-[300px_1fr]
        container mx-auto
        border border-slate-200"
    >
      {/* Left Sidebar - File Tree */}
      <div className="bg-slate-100 border-r border-slate-200 overflow-y-auto">
        <div className="p-2 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-medium text-slate-700 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
              ></path>
            </svg>
            {dirName}
          </h3>
        </div>

        <FileTreeComponent
          items={fileTree}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
      </div>

      {/* Right Panel - File Content */}
      <FilePreview selectedFile={selectedFile} dirName={dirName} />
    </div>
  );
};

export default IDEInterface;
