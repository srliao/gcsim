export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>gcsim - Genshin Impact simulation tool</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/genshinsim/gcsim"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://discord.gg/m7jvjdxx7q"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Discord
          </a>
          <a
            href="https://docs.gcsim.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
