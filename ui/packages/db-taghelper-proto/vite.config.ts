import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";

// Archive-only prototype. `/api` is proxied to the live gcsim backend so the
// Database surfaces can do a real fetch; everything still renders offline from
// the baked fixture when the proxy is unreachable.
export default defineConfig({
	plugins: [tailwindcss(), react()],
	server: {
		proxy: {
			"/api": {
				target: "https://gcsim.app",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
	},
});
