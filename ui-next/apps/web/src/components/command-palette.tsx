import { latestChars } from "@gcsim/data";
import { ACTION_NAMES, CHARACTER_NAMES, STAT_NAMES } from "@gcsim/editor";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@gcsim/primitives";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ARTIFACT_NAMES, ENEMY_NAMES, WEAPON_NAMES } from "./command-palette-data";

export type CommandPaletteGroup =
  | "characters"
  | "weapons"
  | "artifacts"
  | "enemies"
  | "actions"
  | "stats";

export interface CommandPaletteInsertDetail {
  token: string;
  group: CommandPaletteGroup;
}

const RECENT_STORAGE_KEY = "gcsim-palette-recent";
const RECENT_MAX = 5;
const OPEN_EVENT = "gcsim:open-palette";
const INSERT_EVENT = "gcsim:insert-at-cursor";

interface RecentItem {
  token: string;
  group: CommandPaletteGroup;
}

function loadRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is RecentItem =>
          x != null && typeof x.token === "string" && typeof x.group === "string",
      )
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

function pushRecent(current: RecentItem[], item: RecentItem): RecentItem[] {
  const deduped = [item, ...current.filter((x) => x.token !== item.token)];
  return deduped.slice(0, RECENT_MAX);
}

/**
 * Derive a deduped sorted list of character keys from @gcsim/data's
 * latestChars map + the editor's CHARACTER_NAMES list. The editor list is the
 * complete shortcut alias set; latestChars is the version-grouped list. Taking
 * their union gives us a full surface for the palette.
 */
function getCharacterTokens(): string[] {
  const fromLatest = Object.values(latestChars).flat();
  const set = new Set<string>([...CHARACTER_NAMES, ...fromLatest]);
  return Array.from(set).sort();
}

const GROUP_META: Array<{
  id: CommandPaletteGroup;
  heading: string;
  shortcut: string;
}> = [
  { id: "characters", heading: "Characters", shortcut: "⌘C" },
  { id: "weapons", heading: "Weapons", shortcut: "⌘W" },
  { id: "artifacts", heading: "Artifacts", shortcut: "⌘A" },
  { id: "enemies", heading: "Enemies", shortcut: "⌘E" },
  { id: "actions", heading: "Actions", shortcut: "⌘X" },
  { id: "stats", heading: "Stats", shortcut: "⌘S" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentItem[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRecent();
  });

  // Global ⌘K shortcut + custom open event.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        // Let editable controls (inputs, textareas, contenteditable like the
        // CodeMirror .cm-content) handle ⌘K themselves.
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName;
        const ceAttr = active?.getAttribute?.("contenteditable");
        const isEditable =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          active?.isContentEditable === true ||
          ceAttr === "" ||
          ceAttr === "true" ||
          ceAttr === "plaintext-only";
        if (isEditable) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Reset query whenever the dialog closes.
  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  }, []);

  const characters = useMemo(() => getCharacterTokens(), []);
  const weapons = WEAPON_NAMES;
  const artifacts = ARTIFACT_NAMES;
  const enemies = ENEMY_NAMES;
  const actions = ACTION_NAMES;
  const stats = STAT_NAMES;

  const handleSelect = useCallback(
    (group: CommandPaletteGroup, token: string) => {
      const detail: CommandPaletteInsertDetail = { token, group };
      window.dispatchEvent(new CustomEvent(INSERT_EVENT, { detail }));
      setRecent((prev) => {
        const next = pushRecent(prev, { token, group });
        try {
          localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota / privacy errors
        }
        return next;
      });
      handleOpenChange(false);
    },
    [handleOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl gap-0 overflow-hidden p-0"
        data-testid="command-palette-dialog"
      >
        {/* Visually hidden but required for accessibility */}
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search characters, weapons, artifacts, enemies, actions, or stats to insert into the
          simulator config.
        </DialogDescription>

        <Command label="Command palette" data-testid="command-palette">
          <CommandInput
            placeholder="Search characters, weapons, actions…"
            value={query}
            onValueChange={setQuery}
            data-testid="command-palette-input"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {recent.length > 0 && (
              <>
                <CommandGroup heading="Recent" data-testid="command-group-recent">
                  {recent.map((item) => (
                    <CommandItem
                      key={`recent-${item.group}-${item.token}`}
                      value={`recent-${item.token}`}
                      onSelect={() => handleSelect(item.group, item.token)}
                    >
                      <span className="truncate">{item.token}</span>
                      <CommandShortcut>{item.group}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup
              heading={GROUP_META[0].heading}
              className="relative"
              data-testid="command-group-characters"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[0].shortcut}
              </span>
              {characters.map((token) => (
                <CommandItem
                  key={`char-${token}`}
                  value={`character ${token}`}
                  onSelect={() => handleSelect("characters", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading={GROUP_META[1].heading}
              className="relative"
              data-testid="command-group-weapons"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[1].shortcut}
              </span>
              {weapons.map((token) => (
                <CommandItem
                  key={`weap-${token}`}
                  value={`weapon ${token}`}
                  onSelect={() => handleSelect("weapons", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading={GROUP_META[2].heading}
              className="relative"
              data-testid="command-group-artifacts"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[2].shortcut}
              </span>
              {artifacts.map((token) => (
                <CommandItem
                  key={`arti-${token}`}
                  value={`artifact ${token}`}
                  onSelect={() => handleSelect("artifacts", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading={GROUP_META[3].heading}
              className="relative"
              data-testid="command-group-enemies"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[3].shortcut}
              </span>
              {enemies.map((token) => (
                <CommandItem
                  key={`enem-${token}`}
                  value={`enemy ${token}`}
                  onSelect={() => handleSelect("enemies", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading={GROUP_META[4].heading}
              className="relative"
              data-testid="command-group-actions"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[4].shortcut}
              </span>
              {actions.map((token) => (
                <CommandItem
                  key={`act-${token}`}
                  value={`action ${token}`}
                  onSelect={() => handleSelect("actions", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading={GROUP_META[5].heading}
              className="relative"
              data-testid="command-group-stats"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1.5 font-mono text-[10px] tracking-wider text-[var(--fg-3)]"
              >
                {GROUP_META[5].shortcut}
              </span>
              {stats.map((token) => (
                <CommandItem
                  key={`stat-${token}`}
                  value={`stat ${token}`}
                  onSelect={() => handleSelect("stats", token)}
                >
                  {token}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// TODO(phase 7 follow-up): viewer-context filter mode (when opened from the
//   viewer, items should act as filters, not insertions).
// TODO(phase 7 follow-up): wire keyboard prefix jumps (⌘C/⌘W/⌘A/⌘E/⌘X/⌘S
//   while the palette is open should scroll & select the first item in the
//   target group).
