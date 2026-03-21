import {
  Badge,
  cn,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gcsim/primitives";
import { useMemo, useState } from "react";
import type { FrameGroup, SimEvent, SimEventType } from "../events/index.js";
import { filterPresets, getEventDisplay } from "../events/index.js";

export interface EventLogProps {
  frameGroups: FrameGroup[];
  characterNames: string[];
  className?: string;
}

type PresetKey = "simple" | "advanced" | "verbose" | "debug";

function matchesSearch(event: SimEvent, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  return event.message.toLowerCase().includes(lower) || event.type.toLowerCase().includes(lower);
}

function isVisible(event: SimEvent, enabledTypes: Set<SimEventType>, searchQuery: string): boolean {
  return enabledTypes.has(event.type) && matchesSearch(event, searchQuery);
}

export function EventLog({ frameGroups, characterNames, className }: EventLogProps) {
  const [preset, setPreset] = useState<PresetKey>("simple");
  const [searchQuery, setSearchQuery] = useState("");

  const enabledTypes = useMemo(() => new Set<SimEventType>(filterPresets[preset]), [preset]);

  const filteredGroups = useMemo(() => {
    return frameGroups
      .map((group) => ({
        ...group,
        slots: group.slots.map((slot) =>
          slot.filter((e) => isVisible(e, enabledTypes, searchQuery)),
        ),
      }))
      .filter((group) => group.slots.some((slot) => slot.length > 0));
  }, [frameGroups, enabledTypes, searchQuery]);

  const slotHeaders = ["Sim", ...characterNames];

  return (
    <div className={cn("flex flex-col gap-2", className)} data-testid="event-log">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as PresetKey)}>
          <SelectTrigger className="w-[140px]" data-testid="filter-preset-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="verbose">Verbose</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[200px]"
          data-testid="event-search-input"
        />
      </div>

      {/* Event Grid */}
      <ScrollArea className="h-[600px] rounded border" data-testid="event-log-scroll">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div
            className="bg-muted sticky top-0 z-10 grid border-b font-medium"
            style={{ gridTemplateColumns: `80px repeat(${slotHeaders.length}, 1fr)` }}
            data-testid="event-log-header"
          >
            <div className="border-r px-2 py-1 text-sm">Frame</div>
            {slotHeaders.map((name, i) => (
              <div key={i} className="border-r px-2 py-1 text-sm last:border-r-0">
                {name}
              </div>
            ))}
          </div>

          {/* Frame rows */}
          {filteredGroups.length === 0 ? (
            <div
              className="text-muted-foreground p-4 text-center text-sm"
              data-testid="event-log-empty"
            >
              No events match the current filter.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.frame}
                className="grid border-b"
                style={{ gridTemplateColumns: `80px repeat(${slotHeaders.length}, 1fr)` }}
                data-testid="event-log-row"
              >
                {/* Frame number */}
                <div className="bg-muted/50 border-r px-2 py-1 text-xs tabular-nums">
                  {group.frame}
                </div>

                {/* Slots */}
                {group.slots.map((events, slotIdx) => (
                  <div
                    key={slotIdx}
                    className={cn(
                      "border-r px-1 py-1 last:border-r-0",
                      slotIdx === group.activeCharacter + 1 && "bg-accent/20",
                    )}
                  >
                    {events
                      .filter((e) => isVisible(e, enabledTypes, searchQuery))
                      .map((event, eventIdx) => (
                        <EventItem key={eventIdx} event={event} />
                      ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EventItem({ event }: { event: SimEvent }) {
  const display = getEventDisplay(event.type);

  return (
    <div className="flex items-start gap-1 py-0.5 text-xs" data-testid="event-item">
      <Badge
        variant="outline"
        className="shrink-0 px-1 py-0 text-[10px]"
        style={{ borderColor: display.color, color: display.color }}
      >
        {display.label}
      </Badge>
      <span className="text-muted-foreground break-words">{event.message}</span>
    </div>
  );
}
