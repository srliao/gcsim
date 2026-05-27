import { Badge, Button, Kbd, StatusPill } from "@gcsim/primitives";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

const externalLinks = [
  { label: "Teams DB", href: "https://db.gcsim.app" },
  { label: "Docs", href: "https://docs.gcsim.app" },
  { label: "Discord", href: "https://discord.gg/m7jvjdxx7q" },
  { label: "Releases", href: "https://github.com/genshinsim/gcsim/releases" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Dispatch the open event; the global <CommandPalette> mounted in the
  // root layout listens for this and opens itself.
  const handleCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("gcsim:open-palette"));
  };

  return (
    <nav className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <img src="/assets/gcsim-logo.png" alt="gcsim" className="h-8 w-8" />
            <span className="text-base font-semibold">gcsim</span>
          </Link>
          <Badge tone="accent">web-rewrite</Badge>
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            to="/simulator"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:text-foreground"
          >
            Simulator
          </Link>
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right cluster: WASM status + ⌘K */}
        <div className="hidden items-center gap-2 md:flex">
          {/* TODO: wire to executor-provider readiness once that signal is exposed. */}
          <StatusPill status="ready" aria-label="WASM ready">
            WASM ready
          </StatusPill>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCommandPalette}
            aria-label="Open command palette"
            className="gap-2 text-muted-foreground"
          >
            <span>Search</span>
            <Kbd>⌘K</Kbd>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-nav-menu" className="border-t border-border px-4 py-2 md:hidden">
          <Link
            to="/simulator"
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Simulator
          </Link>
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
