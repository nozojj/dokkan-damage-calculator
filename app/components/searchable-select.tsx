"use client";

import { useMemo, useState } from "react";

const SEARCH_RESULT_LIMIT = 50;

export function SearchableSelect<T>({
  label,
  items,
  getKey,
  getLabel,
  onSelect,
  placeholder = "検索",
  emptyHint = "登録すると選択できます",
}: {
  label: string;
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  placeholder?: string;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? items.filter((item) => getLabel(item).toLowerCase().includes(q))
      : items;
    return matches.slice(0, SEARCH_RESULT_LIMIT);
  }, [items, query, getLabel]);

  return (
    <div className="relative flex flex-col gap-1 text-sm sm:col-span-2">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
      <input
        type="text"
        value={query}
        disabled={items.length === 0}
        placeholder={items.length === 0 ? "未登録" : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {items.length === 0 && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{emptyHint}</span>
      )}
      {isOpen && items.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">該当がありません</li>
          ) : (
            filtered.map((item) => (
              <li key={getKey(item)}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(item);
                    setQuery(getLabel(item));
                    setIsOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {getLabel(item)}
                </button>
              </li>
            ))
          )}
          {items.length > filtered.length && (
            <li className="px-3 py-1 text-xs text-zinc-400 dark:text-zinc-500">
              他{items.length - filtered.length}件あります。検索で絞り込んでください
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
