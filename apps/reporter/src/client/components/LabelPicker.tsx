import { useState } from "react";

import { Badge } from "./ui/badge.js";

interface Props {
  available: string[];
  selected: string[];
  onChange: (labels: string[]) => void;
}

export function LabelPicker({ available, selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = available.filter(
    (l) => !selected.includes(l) && l.toLowerCase().includes(query.toLowerCase()),
  );

  function add(label: string) {
    onChange([...selected, label]);
    setQuery("");
  }

  function remove(label: string) {
    onChange(selected.filter((l) => l !== label));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && suggestions.length === 1) {
      add(suggestions[0]!);
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      onChange(selected.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-panel px-2 py-1.5 min-h-9 focus-within:ring-2 focus-within:ring-accent">
        {selected.map((label) => (
          <Badge key={label} variant="pr" className="gap-1 pr-1">
            {label}
            <button
              type="button"
              onClick={() => remove(label)}
              className="ml-0.5 rounded-full hover:bg-accent/20 leading-none w-3.5 h-3.5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </Badge>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Type to filter labels…" : ""}
          className="flex-1 min-w-24 bg-transparent text-sm text-text placeholder:text-muted outline-none"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 rounded-md border border-border bg-panel shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((label) => (
            <div
              key={label}
              onMouseDown={() => add(label)}
              className="px-3 py-1.5 text-sm text-text cursor-pointer hover:bg-surface"
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
