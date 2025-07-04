import React from 'react';

const FileTreeItem = ({ item, depth = 0, onFileSelect, selectedFile }) => {
  const paddingLeft = `${(depth + 1) * 12}px`;

  if (item.type === 'dir') {
    return (
      <div>
        <div
          className="flex items-center py-1 px-2 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer"
          style={{ paddingLeft }}
        >
          <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
          </svg>
          <span>{item.name}</span>
        </div>
        {item.children && item.children.map((child, index) => (
          <FileTreeItem
            key={`${child.path}-${index}`}
            item={child}
            depth={depth + 1}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    );
  } else {
    const isSelected = selectedFile && selectedFile.path === item.path;
    return (
      <div
        className={`flex items-center py-1 px-2 text-xs cursor-pointer transition-colors file-button ${
          isSelected
            ? 'bg-sky-100 text-sky-700'
            : 'text-slate-700 hover:bg-slate-200'
        }`}
        style={{ paddingLeft }}
        onClick={() => onFileSelect(item)}
        data-file-url={item.download_url}
        data-file-name={item.name}
        data-file-path={item.path}
      >
        <svg className="w-3 h-3 mr-1 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
        </svg>
        <span>{item.name}</span>
      </div>
    );
  }
};

const FileTreeComponent = ({ items, onFileSelect, selectedFile }) => {
  if (!items || !Array.isArray(items)) {
    return (
      <div className="p-4 text-center">
        <div className="text-slate-500 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-sm">Unable to load file tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {items.map((item, index) => (
        <FileTreeItem
          key={`${item.path}-${index}`}
          item={item}
          depth={0}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
};

export default FileTreeComponent;
