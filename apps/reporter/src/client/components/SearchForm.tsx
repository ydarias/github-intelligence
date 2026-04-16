import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card.js";
import { Label } from "./ui/label.js";
import { Input } from "./ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.js";
import { Checkbox } from "./ui/checkbox.js";
import { Button } from "./ui/button.js";

export interface SearchFilters {
  type: "all" | "issue" | "pr";
  title: string;
  state: "all" | "open" | "closed";
  author: string;
  assignee: string;
  oneDayOnly: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  type: "all",
  title: "",
  state: "all",
  author: "",
  assignee: "",
  oneDayOnly: false,
};

interface Props {
  authors: string[];
  assignees: string[];
  onSearch: (filters: SearchFilters) => void;
}

export function SearchForm({ authors, assignees, onSearch }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    onSearch(DEFAULT_FILTERS);
  }

  function handleSearch() {
    onSearch(filters);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 items-center">
          <Label htmlFor="filter-type">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(v) => setFilters((f) => ({ ...f, type: v as SearchFilters["type"] }))}
          >
            <SelectTrigger id="filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="issue">Issues</SelectItem>
              <SelectItem value="pr">PRs</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="filter-title">Title</Label>
          <Input
            id="filter-title"
            value={filters.title}
            onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
            placeholder="Search…"
          />

          <Label htmlFor="filter-state">State</Label>
          <Select
            value={filters.state}
            onValueChange={(v) => setFilters((f) => ({ ...f, state: v as SearchFilters["state"] }))}
          >
            <SelectTrigger id="filter-state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="filter-author">Author</Label>
          <Select
            value={filters.author}
            onValueChange={(v) => setFilters((f) => ({ ...f, author: v === "__all__" ? "" : v }))}
          >
            <SelectTrigger id="filter-author">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {authors.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="filter-assignee">Assignee</Label>
          <Select
            value={filters.assignee}
            onValueChange={(v) => setFilters((f) => ({ ...f, assignee: v === "__all__" ? "" : v }))}
          >
            <SelectTrigger id="filter-assignee">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="filter-oneday">One Day?</Label>
          <Checkbox
            id="filter-oneday"
            checked={filters.oneDayOnly}
            onCheckedChange={(checked) =>
              setFilters((f) => ({ ...f, oneDayOnly: checked === true }))
            }
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
