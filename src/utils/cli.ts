import { readdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { removePeerByName } from "./csv-handler";

export async function handleCommandLineArguments(): Promise<boolean> {
	const commandLineArguments = process.argv.slice(2);

	if (commandLineArguments.includes("--remove")) {
		const peerNameIndex = commandLineArguments.indexOf("--remove") + 1;
		const peerNameToRemove = commandLineArguments[peerNameIndex];

		if (!peerNameToRemove) {
			console.error("Please provide a name to remove. Usage: --remove <name>");
			process.exit(1);
		}

		const removedEntries = removePeerByName(peerNameToRemove);
		if (removedEntries.length === 0) {
			console.log(`Peer "${peerNameToRemove}" not found in map.csv`);
		} else {
			console.log(`Removed peer "${peerNameToRemove}" from map.csv`);

			const outputDirectoryPath = join(process.cwd(), "out");
			if (existsSync(outputDirectoryPath)) {
				const directoryFiles = await readdir(outputDirectoryPath);
				const targetZipPrefix = `${peerNameToRemove}-`;
				const matchingZipFiles = directoryFiles.filter(
					(fileName) => fileName.startsWith(targetZipPrefix) && fileName.endsWith(".zip")
				);

				for (const zipFile of matchingZipFiles) {
					await unlink(join(outputDirectoryPath, zipFile));
					console.log(`Successfully removed file: out/${zipFile}`);
				}
			}
		}
		return true;
	}

	return false;
}
