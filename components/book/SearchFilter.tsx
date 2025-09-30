"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  filters?: { label: string; value: string }[];
  activeFilter?: string;
  placeholder?: string;
}

export function SearchFilter({
  onSearch,
  onFilterChange,
  filters,
  activeFilter,
  placeholder = "Search...",
}: SearchFilterProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {filters && filters.length > 0 && onFilterChange && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!activeFilter ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onFilterChange("")}
          >
            All
          </Badge>
          {filters.map((filter) => (
            <Badge
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFilterChange(filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
