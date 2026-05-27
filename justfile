# gcsim dev convenience tasks
#
# Run `just` (no args) to see the available recipes.
# https://just.systems/

set shell := ["bash", "-cu"]

repo_root := justfile_directory()
wasm_src  := repo_root / "cmd/wasm"
wasm_exec_src := repo_root / "ui-next/assets/wasm/wasm_exec.js"
web_public := repo_root / "ui-next/apps/web/public"

# default: list recipes
default:
    @just --list

# Build the gcsim WASM binary and copy it (plus wasm_exec.js) into apps/web/public/
wasm:
    @echo "→ building cmd/wasm → main.wasm"
    cd {{wasm_src}} && GOOS=js GOARCH=wasm go build -o main.wasm -ldflags="-X 'main.shareKey=${GCSIM_SHARE_KEY:-}'"
    @echo "→ copying main.wasm + wasm_exec.js → {{web_public}}"
    mkdir -p {{web_public}}
    cp {{wasm_src}}/main.wasm {{web_public}}/main.wasm
    cp {{wasm_exec_src}} {{web_public}}/wasm_exec.js
    @echo "✓ wasm ready at {{web_public}}/main.wasm"

# Build wasm, then start the @gcsim/web Vite dev server (port 5173).
# VITE_WASM_BASE_URL is overridden to point at the local /main.wasm.
dev: wasm
    @echo "→ starting @gcsim/web dev server (http://localhost:5173)"
    cd {{repo_root}}/ui-next && VITE_WASM_BASE_URL=/main.wasm pnpm --filter @gcsim/web dev

# Start the Storybook dev server (port 6006). No wasm needed.
storybook:
    @echo "→ starting @gcsim/storybook dev server (http://localhost:6006)"
    cd {{repo_root}}/ui-next && pnpm --filter @gcsim/storybook dev

# Run web dev and storybook side-by-side. Stops both on Ctrl+C.
dev-all: wasm
    @echo "→ starting web (5173) and storybook (6006) in parallel"
    cd {{repo_root}}/ui-next && \
        VITE_WASM_BASE_URL=/main.wasm pnpm --filter @gcsim/web dev & \
        pnpm --filter @gcsim/storybook dev & \
        wait
