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
    <div className="w-96">
      <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlass />
        </div>
        <input
          type="text"
          id="search"
          value={query}
          onChange={handleOnSearch}
          className="block w-full p-4 pl-10 text-sm
            text-gray-900
            border border-gray-300
          bg-gray-50

            focus:outline-none
            focus:border-gray-dark"
          placeholder="Search for anything..."
        />
      </div>

      {query.length > 1 && (
        <div className="my-4 ps-4 pe-4">
          Found {posts.length} {posts.length === 1 ? 'result' : 'results'} for '{query}'
        </div>
      )}

      <ul className="list-none w-100">
        {posts &&
          posts.map((post) => (
            <li className="py-1">
              <a
                className="text-wrap text-lg text-green-700 hover:text-green-900 hover:underline underline-offset-2"
                href={`/blog/${post.slug}`}
              >
                {post.data.title}
              </a>
              <p className="text-sm text-gray-800 my-0">{post.data.description}</p>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Search;
