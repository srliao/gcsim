import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gcsim/primitives";

export function Dash() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <section className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">gcsim</h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Genshin Impact team damage simulation and optimization tool
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/simulator" className="no-underline">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Simulator</CardTitle>
              <CardDescription>
                Build and run team damage simulations with the gcsl config language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">Open simulator &rarr;</span>
            </CardContent>
          </Card>
        </Link>

        <a href="https://db.gcsim.app" target="_blank" rel="noopener noreferrer" className="no-underline">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Teams DB</CardTitle>
              <CardDescription>
                Browse community-submitted team configurations and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">Visit database &rarr;</span>
            </CardContent>
          </Card>
        </a>

        <a href="https://docs.gcsim.app" target="_blank" rel="noopener noreferrer" className="no-underline">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Learn the gcsl language, explore character and weapon data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">Read docs &rarr;</span>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
