import Fuse from 'fuse.js';
import { useState, useEffect, useMemo } from "react";

const DEFAULT_FUSE_OPTIONS = {
  keys: ["title", "description", "content"],
  shouldSort: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  threshold: 0.6,
};

function Search({
  searchList,
  onSearch,
  showFullListOnEmptySearch = true,
  fuseOptions = DEFAULT_FUSE_OPTIONS,
  maxResults = 10,
  placeholder = "Search...",
}) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () => new Fuse(searchList, fuseOptions),
    [searchList, fuseOptions]
  );

  const results = useMemo(() => {
    return query
      ? fuse
          .search(query)
          .map((result) => result.item)
          .slice(0, maxResults)
      : showFullListOnEmptySearch
      ? searchList
      : [];
  }, [query, fuse]);

  useEffect(() => {
    onSearch?.(results);
  }, [results]);

  return (
    <div className="relative">
      <div className="mx-auto">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-sky-500 focus:border-sky-500"
            placeholder={placeholder}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default Search;
