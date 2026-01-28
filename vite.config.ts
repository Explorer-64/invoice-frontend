import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";

const buildVariables = () => {
	const authConfigRaw = process.env.FIREBASE_AUTH_CONFIG || "{}";
	let authConfig: Record<string, unknown> = {};
	try {
		authConfig = JSON.parse(authConfigRaw);
	} catch {
		// ignore
	}
	const firebaseConfig = (authConfig.firebaseConfig as Record<string, unknown>) || {};
	const projectId = (firebaseConfig.projectId as string) || process.env.FIREBASE_PROJECT_ID || "";
	const siteName = (authConfig.siteName as string) || "Invoice";

	const defines: Record<string, string> = {
		__APP_ID__: JSON.stringify(projectId),
		__API_PATH__: JSON.stringify(""),
		__API_HOST__: JSON.stringify(""),
		__API_PREFIX_PATH__: JSON.stringify(""),
		__API_URL__: JSON.stringify("http://localhost:8000"),
		__WS_API_URL__: JSON.stringify("ws://localhost:8000"),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify(siteName),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg"),
		__APP_DEPLOY_USERNAME__: JSON.stringify(""),
		__APP_DEPLOY_APPNAME__: JSON.stringify(""),
		__APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
		__STACK_AUTH_CONFIG__: "{}",
		__FIREBASE_CONFIG__: authConfigRaw,
	};

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		proxy: {
			"/routes": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: [
			{ find: "@/components/ui", replacement: path.resolve(__dirname, "./src/extensions/shadcn/components") },
			{ find: "@", replacement: path.resolve(__dirname, "./src") },
		],
	},
});
