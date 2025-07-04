import { useState, useMemo } from "react";
import PillButton from "./PillButton";
import Search from "./Search.jsx";

const ResourceCard = ({
  title,
  description,
  href,
  actionability,
  format,
  group,
}) => {
  const handleClick = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg group w-full max-w-[65ch] border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
    >
      <div className="flex gap-2 text-2xl text-black items-center group">
        <h4 className="text-lg font-medium text-slate-900 capitalize">
          {title}
        </h4>
        <div className="relative whitespace-nowrap overflow-hidden flex flex-row">
          <div className="transform transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
            ↗
          </div>
          <div className="absolute inset-0 transform translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0">
            ↗
          </div>
        </div>
      </div>
      <div className="text-slate-500 text-sm">{description}</div>
      <div className="flex flex-row gap-2 mt-4 text-gray-500">
        <PillButton isActive={true} className="pointer-events-none">
          {actionability}
        </PillButton>
        <PillButton isActive={true} className="pointer-events-none">
          {group}
        </PillButton>
        <PillButton isActive={true} className="pointer-events-none">
          {format}
        </PillButton>
      </div>
    </div>
  );
};

const Resources = ({ items }) => {
  const [sortKey, setSortKey] = useState("group");
  const [filters, setFilters] = useState({
    group: new Set(items.map((item) => item.group)),
    actionability: new Set(items.map((item) => item.actionability)),
    format: new Set(items.map((item) => item.format)),
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(items);

  const searchOptions = useMemo(
    () => ({
      keys: ["group", "actionability", "format", "title", "description"],
      shouldSort: true,
      findAllMatches: true,
      minMatchCharLength: 2,
      threshold: 0.6,
    }),
    []
  );

  const handleSortChange = (key) => {
    setSortKey(key);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => {
      const newFilters = new Set(prevFilters[key]);
      if (newFilters.has(value)) {
        newFilters.delete(value);
      } else {
        newFilters.add(value);
      }
      return {
        ...prevFilters,
        [key]: newFilters,
      };
    });
  };

  const filteredItems = searchResults.filter((item) => {
    return (
      filters.group.has(item.group) &&
      filters.actionability.has(item.actionability) &&
      filters.format.has(item.format)
    );
  });

  const sortedItems = filteredItems.sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return -1;
    if (a[sortKey] > b[sortKey]) return 1;
    return 0;
  });

  const uniqueValuesWithCounts = (key) => {
    const counts = filteredItems.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
    return [...new Set(items.map((item) => item[key]))].map((value) => ({
      value,
      count: counts[value] || 0,
    }));
  };

  const renderItemsWithHeaders = (items, key) => {
    let currentHeader = null;
    return (
      <ul className="list-none">
        {items.map((item, index) => {
          const header = item[key];
          const showHeader = header !== currentHeader;
          currentHeader = header;
          return (
            <li key={index} className="mb-4">
              {showHeader && (
                <h2 className="flex gap-2 align-baseline text-3xl font-syne my-2">
                  <div className="size-8">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2V22M19.0711 4.92893L4.92893 19.0711M22 12H2M19.0711 19.0711L4.92893 4.92893"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </div>
                  {header}
                </h2>
              )}
              <ResourceCard {...item} />
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-4 w-full bg-noise-sky">
      <div className="w-full max-w-[65ch] mx-auto py-4">
        <div className="flex flex-row gap-2 w-full items-center my-4">
          <div className="flex-grow">
            <Search
              searchList={items}
              fuseOptions={searchOptions}
              onSearch={setSearchResults}
            />
          </div>
          <div>
            <button
              className={`text-gray-900 relative flex p-3 border border-2 rounded-lg
                transition-colors duration-300
                ${
                  isFiltersVisible
                    ? "bg-sky-900 text-white border-sky-900"
                    : "bg-gray-100 border-gray-100 hover:text-white hover:bg-sky-900"
                }`}
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
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
        </div>
        <div>
          {isFiltersVisible && (
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-1 border border-1 border-gray-300 rounded-lg p-1 w-fit bg-gray-50">
                <label className="text-sm tracking-tight mr-2 font-semibold">
                  Sort by
                </label>
                {["group", "actionability", "format"].map((key) => (
                  <PillButton
                    key={key}
                    isActive={sortKey === key}
                    onClick={() => handleSortChange(key)}
                  >
                    <span className="text-sm tracking-tight text-nowrap capitalize">
                      {key}
                    </span>
                  </PillButton>
                ))}
              </div>
              {["group", "actionability", "format"].map((key) => (
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-1 border border-1 border-gray-300 rounded-lg p-1 w-fit bg-gray-50"
                >
                  <label className="text-sm tracking-tight mr-2 font-semibold capitalize">
                    {key}
                  </label>
                  {uniqueValuesWithCounts(key).map(({ value, count }) => (
                    <PillButton
                      key={value}
                      isActive={filters[key].has(value)}
                      onClick={() => handleFilterChange(key, value)}
                    >
                      <span className="text-nowrap">
                        <span className="text-sm tracking-tight text-nowrap capitalize">
                          {value}{" "}
                        </span>
                        <span className="text-xs">{count}</span>
                      </span>
                    </PillButton>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full">
          {sortedItems.length > 0 ? (
            renderItemsWithHeaders(sortedItems, sortKey)
          ) : (
            <div className="w-full mb-4 p-8 rounded-lg bg-sky-100/20 border border-[1px] border-transparent space-y-4 text-center">
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
                  <h3 className="text-lg font-medium">No resources found</h3>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
