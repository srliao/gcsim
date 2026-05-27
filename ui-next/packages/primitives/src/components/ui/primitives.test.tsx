import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card.js";
import { Input } from "./input.js";
import { Kbd } from "./kbd.js";
import { NumberStepper } from "./number-stepper.js";
import { Skeleton } from "./skeleton.js";
import { StatusPill } from "./status-pill.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";

afterEach(cleanup);

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("fires click handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeDefined();
    expect(link.tagName).toBe("A");
  });

  it("renders primary variant with accent token classes", () => {
    render(<Button variant="primary">Go</Button>);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.getAttribute("data-variant")).toBe("primary");
    expect(btn.className).toContain("bg-[var(--accent)]");
    expect(btn.className).toContain("text-[var(--accent-fg)]");
  });

  it("keeps legacy default variant working with same accent styling", () => {
    render(<Button variant="default">Go</Button>);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.getAttribute("data-variant")).toBe("default");
    expect(btn.className).toContain("bg-[var(--accent)]");
  });

  it("renders leading and trailing slots", () => {
    render(
      <Button
        leading={<span data-testid="lead">L</span>}
        trailing={<span data-testid="trail">T</span>}
      >
        Hi
      </Button>,
    );
    const lead = screen.getByTestId("lead");
    const trail = screen.getByTestId("trail");
    const btn = screen.getByRole("button");
    // leading wrapper precedes children which precede trailing wrapper
    expect(btn.textContent).toBe("LHiT");
    expect(lead.parentElement?.getAttribute("data-slot")).toBe("button-leading");
    expect(trail.parentElement?.getAttribute("data-slot")).toBe("button-trailing");
  });

  it("supports new md size as alias of default 32px height", () => {
    render(<Button size="md">M</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-8");
  });
});

describe("Card", () => {
  it("renders card composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.getByText("Footer")).toBeDefined();
  });
});

describe("Input", () => {
  it("renders and accepts input", () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: "hello" } });
    expect((input as HTMLInputElement).value).toBe("hello");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });
});

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeDefined();
  });

  it("applies status tone classes", () => {
    const { container, rerender } = render(<Badge tone="ok">OK</Badge>);
    let el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-tone")).toBe("ok");
    expect(el.className).toContain("bg-[var(--ok-soft)]");
    expect(el.className).toContain("text-[var(--ok)]");

    rerender(<Badge tone="warn">Warn</Badge>);
    el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-[var(--warn-soft)]");
    expect(el.className).toContain("text-[var(--warn)]");
  });

  it("applies element tone classes for each element", () => {
    const elements: Array<
      ["anemo" | "pyro" | "hydro" | "electro" | "cryo" | "geo" | "dendro" | "physical", string]
    > = [
      ["anemo", "el-anemo"],
      ["pyro", "el-pyro"],
      ["hydro", "el-hydro"],
      ["electro", "el-electro"],
      ["cryo", "el-cryo"],
      ["geo", "el-geo"],
      ["dendro", "el-dendro"],
      ["physical", "el-physical"],
    ];
    for (const [tone, token] of elements) {
      const { container, unmount } = render(<Badge tone={tone}>{tone}</Badge>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain(`bg-[var(--${token}-soft)]`);
      expect(el.className).toContain(`text-[var(--${token})]`);
      unmount();
    }
  });

  it("renders dot circle when dot prop is set", () => {
    const { container } = render(
      <Badge tone="ok" dot>
        Ready
      </Badge>,
    );
    const el = container.firstChild as HTMLElement;
    const dot = el.querySelector("span[aria-hidden='true']");
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain("rounded-full");
    expect(dot?.className).toContain("bg-current");
  });

  it("does not leak primary hover class when tone is set", () => {
    const { container } = render(<Badge tone="accent">x</Badge>);
    const el = container.querySelector('[data-slot="badge"]') as HTMLElement;
    expect(el.className).not.toContain("hover:bg-primary");
    expect(el.className).not.toContain("bg-primary");
  });

  it("uses outlined styling when soft=false", () => {
    const { container } = render(
      <Badge tone="accent" soft={false}>
        Beta
      </Badge>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("border-[var(--accent-line)]");
    expect(el.className).toContain("text-[var(--accent)]");
  });
});

describe("StatusPill", () => {
  const cases: Array<["ready" | "running" | "queued" | "failed" | "idle", string, string]> = [
    ["ready", "Ready", "ok"],
    ["running", "Running", "info"],
    ["queued", "Queued", "warn"],
    ["failed", "Failed", "error"],
    ["idle", "Idle", "neutral"],
  ];

  for (const [status, label, tone] of cases) {
    it(`renders ${status} with tone=${tone} and default label "${label}"`, () => {
      const { container } = render(<StatusPill status={status} />);
      const el = container.firstChild as HTMLElement;
      expect(el.getAttribute("data-status")).toBe(status);
      expect(el.getAttribute("data-tone")).toBe(tone);
      expect(el.textContent).toContain(label);
      expect(el.querySelector("span[aria-hidden='true']")).not.toBeNull();
    });
  }

  it("uses children to override the default label", () => {
    render(<StatusPill status="ready">WASM ready</StatusPill>);
    expect(screen.getByText("WASM ready")).toBeDefined();
  });
});

describe("NumberStepper", () => {
  it("renders the value and suffix", () => {
    render(<NumberStepper value={42} suffix="s" aria-label="Iterations" />);
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("s")).toBeDefined();
  });

  it("increments by step on + button click", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={5} step={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("decrements by step on − button click", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={5} step={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Decrement"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("clamps to max", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={9} max={10} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("clamps to min", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={1} min={0} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Decrement"));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("disables increment when at max", () => {
    render(<NumberStepper value={10} max={10} />);
    expect(screen.getByLabelText("Increment")).toBeDisabled();
  });

  it("disables decrement when at min", () => {
    render(<NumberStepper value={0} min={0} />);
    expect(screen.getByLabelText("Decrement")).toBeDisabled();
  });

  it("disables both buttons when disabled prop is set", () => {
    render(<NumberStepper value={5} disabled />);
    expect(screen.getByLabelText("Increment")).toBeDisabled();
    expect(screen.getByLabelText("Decrement")).toBeDisabled();
  });

  it("displays clamped value when prop is above max", () => {
    const { container } = render(<NumberStepper value={15} max={10} onChange={() => {}} />);
    const valueEl = container.querySelector("[data-slot='number-stepper-value']") as HTMLElement;
    expect(valueEl.textContent).toBe("10");
  });

  it("displays clamped value when prop is below min", () => {
    const { container } = render(<NumberStepper value={-5} min={0} onChange={() => {}} />);
    const valueEl = container.querySelector("[data-slot='number-stepper-value']") as HTMLElement;
    expect(valueEl.textContent).toBe("0");
  });

  it("decrements by step from the clamped value when prop is above max", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={15} max={10} step={1} onChange={onChange} />);
    // Increment is disabled because the displayed value equals max.
    expect(screen.getByLabelText("Increment")).toBeDisabled();
    // Decrement should subtract `step` from the clamped value (10), not the
    // raw prop (15), so the next value is 9 — not 14.
    fireEvent.click(screen.getByLabelText("Decrement"));
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("increments by step from the clamped value when prop is below min", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={-5} min={0} step={1} onChange={onChange} />);
    expect(screen.getByLabelText("Decrement")).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("does not call onChange on mount when value is out of range", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={15} max={10} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Kbd", () => {
  it("renders a <kbd> element with mono font class", () => {
    const { container } = render(<Kbd>⌘K</Kbd>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("KBD");
    expect(el.textContent).toBe("⌘K");
    expect(el.className).toContain("font-mono");
  });
});

describe("Tabs", () => {
  it("renders underline variant with data-variant attribute", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList variant="underline">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
        <TabsContent value="b">B content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[data-slot='tabs-list']") as HTMLElement;
    expect(list.getAttribute("data-variant")).toBe("underline");
  });

  it("keeps legacy line variant working", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList variant="line">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[data-slot='tabs-list']") as HTMLElement;
    expect(list.getAttribute("data-variant")).toBe("line");
  });

  it("supports size=sm", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList size="sm">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[data-slot='tabs-list']") as HTMLElement;
    expect(list.getAttribute("data-size")).toBe("sm");
    expect(list.className).toContain("h-7");
  });
});

describe("Skeleton", () => {
  it("renders", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toBeDefined();
  });
});
