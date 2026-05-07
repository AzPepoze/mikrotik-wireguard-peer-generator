import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface PeerEntry {
	name: string;
	octet_number: number;
	mikrotik_command: string;
	normal_conf: string;
	linux_conf: string;
	no_dns_conf: string;
}

const MAP_CSV_FILENAME = "map.csv";
const MAP_CSV_PATH = join(process.cwd(), MAP_CSV_FILENAME);
const CSV_COLUMNS = ["name", "octet_number", "mikrotik_command", "normal_conf", "linux_conf", "no_dns_conf"];

export function readMapCsv(): PeerEntry[] {
	if (!existsSync(MAP_CSV_PATH)) {
		return [];
	}

	try {
		const fileContent = readFileSync(MAP_CSV_PATH, "utf-8");
		return parse(fileContent, {
			columns: true,
			skip_empty_lines: true,
			cast: true,
		});
	} catch (error) {
		console.error("Error reading map.csv:", error);
		return [];
	}
}

export function getNextOctet(peers: PeerEntry[]): number {
	if (peers.length === 0) {
		return 2;
	}

	const octetNumbers = peers.map((peer) => peer.octet_number);
	const maximumOctet = Math.max(...octetNumbers);
	
	return maximumOctet + 1;
}

export function appendMapCsv(peer: PeerEntry): void {
	const fileExists = existsSync(MAP_CSV_PATH);
	const csvContent = stringify([peer], {
		header: !fileExists,
		columns: CSV_COLUMNS,
	});

	if (fileExists) {
		appendFileSync(MAP_CSV_PATH, csvContent);
	} else {
		writeFileSync(MAP_CSV_PATH, csvContent);
	}
}

export function removePeerByName(name: string): PeerEntry[] {
	const peers = readMapCsv();
	const filteredPeers = peers.filter((peer) => peer.name !== name);
	const removedPeers = peers.filter((peer) => peer.name === name);

	if (removedPeers.length > 0) {
		const csvContent = stringify(filteredPeers, {
			header: true,
			columns: CSV_COLUMNS,
		});
		writeFileSync(MAP_CSV_PATH, csvContent);
	}

	return removedPeers;
}
