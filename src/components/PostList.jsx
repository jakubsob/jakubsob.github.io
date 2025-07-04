import { useState, useMemo } from "react";
import PillButton from "./PillButton";
import Search from "./Search";
import { getReadingTime } from "../utils/getReadingTime";
import FormattedDate from "./FormattedDate";

function PostList({ posts, showControls = true }) {
  const [searchResults, setSearchResults] = useState(posts);
  const [selectedTags, setSelectedTags] = useState(
    new Set(posts.flatMap((post) => post.data.tags))
  );
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const searchOptions = useMemo(
    () => ({
      keys: ["data.title", "data.description"],
      shouldSort: true,
      findAllMatches: true,
      minMatchCharLength: 2,
      threshold: 0.6,
    }),
    []
  );

  const getTagsWithCounts = () => {
    const counts = searchResults.reduce((acc, post) => {
      post.data.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return [...new Set(posts.flatMap((post) => post.data.tags))].map((tag) => ({
      value: tag,
      count: counts[tag] || 0,
    }));
  };

  const handleTagFilter = (tag) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const filteredPosts = searchResults.filter((post) => {
    const hasMatchingTag = post.data.tags.some((tag) => selectedTags.has(tag));
    return hasMatchingTag;
  });

  return (
    <div className="grid grid-cols-1 gap-4 mb-4 w-full bg-noise-sky">
      <div className="w-full max-w-[65ch] mx-auto py-4">
        {showControls && (
          <div className="flex flex-row gap-2 w-full items-center my-4">
            <div className="flex-grow">
              <Search
                searchList={posts}
                fuseOptions={searchOptions}
                onSearch={setSearchResults}
                placeholder={`Search through ${posts.length} posts...`}
              />
            </div>
            <button
              className={`text-gray-900 relative flex p-3 border border-2 rounded-lg
                transition-colors duration-300
                ${
                  isFiltersVisible
                    ? "bg-sky-900 text-white border-sky-900"
                    : "bg-gray-100 border-gray-100 hover:text-white hover:bg-sky-900"
                }`}
              onClick={() => {
                setIsFiltersVisible(!isFiltersVisible);
              }}
            >
              <div className="size-6">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.38589 5.66687C2.62955 4.82155 2.25138 4.39889 2.23712 4.03968C2.22473 3.72764 2.35882 3.42772 2.59963 3.22889C2.87684 3 3.44399 3 4.57828 3H19.4212C20.5555 3 21.1227 3 21.3999 3.22889C21.6407 3.42772 21.7748 3.72764 21.7624 4.03968C21.7481 4.39889 21.3699 4.82155 20.6136 5.66687L14.9074 12.0444C14.7566 12.2129 14.6812 12.2972 14.6275 12.3931C14.5798 12.4781 14.5448 12.5697 14.5236 12.6648C14.4997 12.7721 14.4997 12.8852 14.4997 13.1113V18.4584C14.4997 18.6539 14.4997 18.7517 14.4682 18.8363C14.4403 18.911 14.395 18.9779 14.336 19.0315C14.2692 19.0922 14.1784 19.1285 13.9969 19.2012L10.5969 20.5612C10.2293 20.7082 10.0455 20.7817 9.89802 20.751C9.76901 20.7242 9.6558 20.6476 9.583 20.5377C9.49975 20.4122 9.49975 20.2142 9.49975 19.8184V13.1113C9.49975 12.8852 9.49975 12.7721 9.47587 12.6648C9.45469 12.5697 9.41971 12.4781 9.37204 12.3931C9.31828 12.2972 9.2429 12.2129 9.09213 12.0444L3.38589 5.66687Z"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}
        {showControls && isFiltersVisible && (
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-1 border border-1 border-gray-300 rounded-lg ps-1 w-fit">
              <label className="text-sm tracking-tight mr-2 font-semibold">
                Tags
              </label>
              {getTagsWithCounts().map(({ value, count }) => (
                <PillButton
                  key={value}
                  isActive={selectedTags.has(value)}
                  onClick={() => handleTagFilter(value)}
                >
                  <span className="text-sm tracking-tight uppercase">
                    {value}{" "}
                  </span>
                  <span className="text-xs">{count}</span>
                </PillButton>
              ))}
            </div>
          </div>
        )}
        <div className="w-full">
          <ul className="list-none space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <li
                  key={post.slug}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group p-6 space-y-4"
                >
                  <a className="space-y-2" href={`/blog/${post.slug}/`}>
                    <h3 className="font-medium text-slate-900 capitalize">
                      {post.data.title}
                    </h3>
                    <h4 className="text-slate-500 text-sm">
                      {post.data.description}
                    </h4>
                  </a>
                  <div className="flex flex-row items-baseline gap-6 text-sm text-gray-500">
                    <FormattedDate date={post.data.pubDate} />
                    <div className="flex flex-row gap-1">
                      {post.data.tags.map((tag) => (
                        <PillButton
                          key={tag}
                          isActive={selectedTags.has(tag)}
                          className="pointer-events-none"
                        >
                          <span className="text-sm tracking-tight uppercase">
                            {tag}
                          </span>
                        </PillButton>
                      ))}
                    </div>
                    <div className="ms-auto uppercase">
                      {getReadingTime(post.body)}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="w-full mb-4 p-8 rounded-lg transition-all bg-sky-100/20 border border-[1px] border-transparent space-y-4 text-center">
                <div className="flex flex-col items-center gap-4">
                  <svg
                    width="100%"
                    height="100%"
                    className="size-12 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 10.5V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H11.5M22 22L20.5 20.5M21.5 18C21.5 19.933 19.933 21.5 18 21.5C16.067 21.5 14.5 19.933 14.5 18C14.5 16.067 16.067 14.5 18 14.5C19.933 14.5 21.5 16.067 21.5 18Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium">No posts found</h3>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PostList;
