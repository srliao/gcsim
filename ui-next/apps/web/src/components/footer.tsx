export function Footer() {
  return (
    <footer className="border-t border-[var(--line-1)] bg-[var(--bg-0)] px-4 py-6 text-[var(--fg-2)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-sm md:flex-row md:justify-between">
        <p>gcsim - Genshin Impact simulation tool</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/genshinsim/gcsim"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fg-0)]"
          >
            GitHub
          </a>
          <a
            href="https://discord.gg/m7jvjdxx7q"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fg-0)]"
          >
            Discord
          </a>
          <a
            href="https://docs.gcsim.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fg-0)]"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
