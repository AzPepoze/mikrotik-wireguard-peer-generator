import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const DIST_DIR = "./dist";
const ENTRY_POINT = "./index.ts";

interface Target {
	os: string;
	arch: string;
	outfile: string;
}

const targets: Record<string, Target[]> = {
	linux: [
		{
			os: "linux",
			arch: "x64",
			outfile: "mikrotik-wireguard-peer-generator-linux",
		},
	],
	windows: [
		{
			os: "windows",
			arch: "x64",
			outfile: "mikrotik-wireguard-peer-generator-windows.exe",
		},
	],
	mac: [
		{
			os: "darwin",
			arch: "x64",
			outfile: "mikrotik-wireguard-peer-generator-mac-x64",
		},
		{
			os: "darwin",
			arch: "arm64",
			outfile: "mikrotik-wireguard-peer-generator-mac-arm64",
		},
	],
};

async function buildTarget(target: Target) {
	const targetString = `bun-${target.os}-${target.arch}`;
	const outfilePath = join(DIST_DIR, target.outfile);

	console.log(`Building for ${targetString}...`);

	try {
		await Bun.$`bun build ${ENTRY_POINT} --compile --minify --target=${targetString} --outfile ${outfilePath}`;
		console.log(`Finished building for ${targetString}`);
	} catch (error) {
		console.error(`Failed to build for ${targetString}:`, error);
		process.exit(1);
	}
}

async function main() {
	const arg = process.argv[2] || "all";

	console.log("Starting build process...");

	// Ensure dist directory exists
	await mkdir(DIST_DIR, { recursive: true });

	if (arg === "all") {
		for (const targetList of Object.values(targets)) {
			for (const target of targetList) {
				await buildTarget(target);
			}
		}
	} else {
		const targetList = targets[arg];
		if (targetList) {
			for (const target of targetList) {
				await buildTarget(target);
			}
		} else {
			console.error(`Unknown build target: ${arg}`);
			console.log("Available targets: linux, windows, mac, all");
			process.exit(1);
		}
	}

	console.log("\nBuild completed!");
}

main();
