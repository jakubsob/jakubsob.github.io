import Fuse from 'fuse.js';
import { useState } from 'react';
import { MagnifyingGlass } from './Icons';

const options = {
	keys: ['id', 'slug'],
	includeMatches: true,
	minMatchCharLength: 2,
	threshold: 0.5,
};

function Search({ searchList, maxResults = 5 }) {
	const [query, setQuery] = useState('');

	const fuse = new Fuse(searchList, options);

	const posts = fuse
    .search(query)
    .map((result) => result.item)
    .slice(0, maxResults);

	function handleOnSearch({ target = {} }) {
		const { value } = target;
		setQuery(value);
	}

  return (
    <div className="overflow-visible">
      <label
        htmlFor="search"
        className="mb-2 text-sm text-sky-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative overflow-visible">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlass />
        </div>
        <input
          type="text"
          id="search"
          value={query}
          onChange={handleOnSearch}
          autoComplete="off"
          className="p-4 pl-10 text-sm
            w-full
            text-gray-900
            rounded-lg
            bg-transparent
            outline outline-[1px] outline-sky-200
            focus:outline focus:outline-sky-900
            focus:border-gray-dark"
          placeholder="Search"
        />
        <div className="absolute z-100 translate-y-1 bg-white w-full shadow-lg">
          {query.length > 1 && (
            <div className="my-4 ps-4 pe-4">
              Found {posts.length} {posts.length === 1 ? "result" : "results"}{" "}
              for '{query}'
            </div>
          )}

          <ul className="list-none">
            {posts &&
              posts.map((post) => (
                <li
                  className="p-2
                    transition duration-300 ease-in-out
                    last:rounded-b-lg
                    hover:bg-sky-900 hover:text-white group"
                >
                  <a
                    className="text-wrap text-black group-hover:text-white"
                    href={`/blog/${post.slug}`}
                  >
                    {post.data.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Search;
