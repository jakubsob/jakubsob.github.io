import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/ResourceCard";
import { Filter, Search as SearchIcon } from "lucide-react";

interface ResourceItem {
  title: string;
  description: string;
  href: string;
  actionability: string;
  format: string;
  group: string;
}

interface ResourcesProps {
  items: ResourceItem[];
}

const Resources: React.FC<ResourcesProps> = ({ items }) => {
  const [sortKey, setSortKey] = useState<keyof ResourceItem>("group");
  const [filters, setFilters] = useState({
    group: new Set(items.map((item) => item.group)),
    actionability: new Set(items.map((item) => item.actionability)),
    format: new Set(items.map((item) => item.format)),
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(items);

  const handleSortChange = (key: keyof ResourceItem) => {
    setSortKey(key);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
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

  const uniqueValuesWithCounts = (key: keyof ResourceItem) => {
    const counts = filteredItems.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [...new Set(items.map((item) => item[key]))].map((value) => ({
      value,
      count: counts[value] || 0,
    }));
  };

  const renderItemsWithHeaders = (items: ResourceItem[], key: keyof ResourceItem) => {
    let currentHeader: string | null = null;
    return (
      <ul className="list-none space-y-4">
        {items.map((item, index) => {
          const header = item[key];
          const showHeader = header !== currentHeader;
          currentHeader = header;
          return (
            <li key={index} className="space-y-4">
              {showHeader && (
                <h2 className="flex gap-2 items-center text-3xl font-semibold my-2">
                  <div className="w-8 h-8">
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
                      />
                    </svg>
                  </div>
                  <span className="capitalize">{header}</span>
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
    <div className="grid grid-cols-1 gap-4 mb-4 w-full">
      <div className="w-full max-w-[65ch] mx-auto py-4">
        <div className="flex flex-row gap-2 w-full items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {isFiltersVisible && (
          <div className="rounded-sm border bg-card p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">Sort by:</span>
                {(["group", "actionability", "format"] as const).map((key) => (
                  <Button
                    key={key}
                    variant={sortKey === key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleSortChange(key)}
                    className="h-8 px-3 text-xs capitalize"
                  >
                    {key}
                  </Button>
                ))}
              </div>

              {(["group", "actionability", "format"] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <h3 className="text-sm capitalize">
                    Filter by {key}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValuesWithCounts(key).map(({ value, count }) => (
                      <Button
                        key={value}
                        variant={filters[key].has(value) ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleFilterChange(key, value)}
                        className="h-8 px-3 text-xs uppercase"
                      >
                        <span className="capitalize">{value}</span>
                        <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-xs">
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full">
          {sortedItems.length > 0 ? (
            renderItemsWithHeaders(sortedItems, sortKey)
          ) : (
              <div className="w-full mb-4 p-8 rounded-lg bg-card border border-dashed text-center">
              <div className="flex flex-col items-center gap-4">
                <SearchIcon className="h-12 w-12 text-muted-foreground" />
                <div className="text-muted-foreground">
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
