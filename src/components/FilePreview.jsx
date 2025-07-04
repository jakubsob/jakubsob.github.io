import React, { useState, useEffect, useRef } from 'react';

const FilePreview = ({ selectedFile, readmeContent, dirName }) => {
  const [fileContent, setFileContent] = useState('');
  const [highlightedContent, setHighlightedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileSize, setFileSize] = useState(0);

  // Cache for file contents
  const fileCache = useRef(new Map());
  const MAX_CACHE_SIZE = 50;
  const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Helper function to determine language from file extension
  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const langMap = {
      'r': 'r',
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'zsh',
      'fish': 'fish',
      'ps1': 'powershell',
      'xml': 'xml',
      'sql': 'sql',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'ini': 'ini',
      'conf': 'ini',
      'log': 'log',
      'csv': 'csv',
      'rmd': 'rmd',
      'rnw': 'rnw',
      'qmd': 'qmd',
      'description': 'text',
      'namespace': 'text',
      'rproj': 'text',
      'gitignore': 'text',
      'gitmodules': 'text',
      'gitattributes': 'text',
      'renvlock': 'json',
      'lock': 'json'
    };
    return langMap[ext] || 'text';
  };

  // Helper function to escape HTML
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Helper function to highlight code with Shiki
  const highlightCode = async (code, language) => {
    try {
      // Try to use Shiki via dynamic import
      const { codeToHtml } = await import('shiki');

      const html = await codeToHtml(code, {
        lang: language,
        theme: 'github-light'
      });
      return html;
    } catch (error) {
      console.error('Shiki highlighting failed:', error);

      // Final fallback to plain text
      return `<pre class="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded border overflow-x-auto"><code>${escapeHtml(code)}</code></pre>`;
    }
  };

  // Cache management functions
  const isExpired = (timestamp) => {
    return Date.now() - timestamp > CACHE_EXPIRY;
  };

  const cleanupExpiredCache = () => {
    const now = Date.now();
    for (const [key, value] of fileCache.current.entries()) {
      if (isExpired(value.timestamp)) {
        fileCache.current.delete(key);
      }
    }
  };

  const enforceMaxCacheSize = () => {
    if (fileCache.current.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(fileCache.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, fileCache.current.size - MAX_CACHE_SIZE + 1);
      toRemove.forEach(([key]) => {
        fileCache.current.delete(key);
      });
    }
  };

  // Function to load file content when selectedFile changes
  useEffect(() => {
    if (!selectedFile) {
      setFileContent('');
      setHighlightedContent('');
      setError(null);
      setFileSize(0);
      return;
    }

    const loadFileContent = async () => {
      const fileUrl = selectedFile.download_url;
      const fileName = selectedFile.name;

      if (!fileUrl) return;

      setError(null);

      // Check if content is already cached and not expired
      if (fileCache.current.has(fileUrl)) {
        const cachedData = fileCache.current.get(fileUrl);

        if (!isExpired(cachedData.timestamp)) {
          setFileContent(cachedData.content);
          setHighlightedContent(cachedData.highlightedContent);
          setFileSize(cachedData.content.length);
          return;
        } else {
          fileCache.current.delete(fileUrl);
        }
      }

      // Content not cached or expired - fetch it
      setIsLoading(true);

      try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        setFileContent(content);
        setFileSize(content.length);

        // Determine language and highlight code
        const language = getLanguageFromExtension(fileName);
        const highlighted = await highlightCode(content, language);
        setHighlightedContent(highlighted);

        // Cleanup and enforce cache size limits before adding new entry
        cleanupExpiredCache();
        enforceMaxCacheSize();

        // Cache the content with highlighting
        fileCache.current.set(fileUrl, {
          content: content,
          highlightedContent: highlighted,
          fileName: fileName,
          timestamp: Date.now(),
        });

      } catch (err) {
        console.error("Error loading file:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [selectedFile]);

  // Recursive function to render file tree
  const renderFileTree = (items, depth = 0) => {
    if (!items || !Array.isArray(items)) return null;

    return items.map((item, index) => {
      const paddingLeft = `${(depth + 1) * 12}px`;

      if (item.type === 'dir') {
        return (
          <div key={`${item.path}-${index}`}>
            <div
              className="flex items-center py-1 px-2 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer"
              style={{ paddingLeft }}
            >
              <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
              <span>{item.name}</span>
            </div>
            {item.children && renderFileTree(item.children, depth + 1)}
          </div>
        );
      } else {
        const isSelected = selectedFile && selectedFile.path === item.path;
        return (
          <div
            key={`${item.path}-${index}`}
            className={`flex items-center py-1 px-2 text-xs cursor-pointer transition-colors ${
              isSelected
                ? 'bg-sky-100 text-sky-700'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
            style={{ paddingLeft }}
            onClick={() => handleFileSelect(item)}
          >
            <svg className="w-3 h-3 mr-1 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
            </svg>
            <span>{item.name}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="bg-white flex flex-col">
      {/* Tab Bar */}
      <div className="border-b border-slate-200 bg-slate-50 p-2">
        <div className="flex items-center text-sm text-slate-500">
        {selectedFile ? (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span className="text-slate-700 font-medium">{selectedFile.name}</span>
            </div>
          ) : (
            <span>Select a file to view its content</span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {!selectedFile ? (
          /* Default Content: README */
          readmeContent && (
            <div className="p-6">
              <div className="prose prose-slate max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-blue-800 font-medium mb-2">README</h3>
                  <div className="text-blue-700 text-sm whitespace-pre-wrap font-mono">
                    {readmeContent}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* File Content */
          <>
            {isLoading ? (
              /* Loading indicator */
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  <span className="ml-2 text-slate-600">Loading file content...</span>
                </div>
              </div>
            ) : error ? (
              /* Error Message */
              <div className="p-6">
                <div className="text-red-600">
                  <p>Error loading file content: {error}</p>
                </div>
              </div>
            ) : (
              /* File Content Container */
              <div>
                <div className="flex items-center justify-end border-b border-slate-200 px-4 py-2 bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">
                      Size: {Math.round(fileSize / 1024)} KB
                    </span>
                    <a
                      href={selectedFile.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Raw
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <div
                    className="text-sm overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: highlightedContent }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
