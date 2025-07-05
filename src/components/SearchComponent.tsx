import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import Fuse from "fuse.js";

interface SearchProps {
  searchList: any[];
  onSearch: (results: any[]) => void;
  placeholder?: string;
  fuseOptions?: any;
  className?: string;
}

export function Search({
  searchList,
  onSearch,
  placeholder = "Search...",
  fuseOptions = {},
  className
}: SearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);

  useEffect(() => {
    const fuseInstance = new Fuse(searchList, {
      keys: ["data.title", "data.description"],
      threshold: 0.4,
      includeScore: true,
      ...fuseOptions,
    });
    setFuse(fuseInstance);
  }, [searchList, fuseOptions]);

  useEffect(() => {
    if (!fuse) {
      onSearch(searchList);
      return;
    }

    if (searchTerm.trim() === "") {
      onSearch(searchList);
    } else {
      const results = fuse.search(searchTerm).map(result => result.item);
      onSearch(results);
    }
  }, [searchTerm, fuse, searchList, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
