import "dotenv/config";
import { writeFile } from "fs/promises";
import prompts from "prompts";

const env = process.env;

async function genKeys() {
	const privateKey = (await Bun.$`wg genkey`.text()).trim();

	const publicKey = (await Bun.$`bash -c "echo ${privateKey} | wg pubkey"`)
		.text()
		.trim();

	return {
		privateKey,
		publicKey,
	};
}

async function main() {
	const answers = await prompts([
		{
			type: "text",
			name: "name",
			message: "Peer name:",
		},
		{
			type: "number",
			name: "last",
			message: "Last IP octet:",
		},
	]);

	if (!answers.name || !answers.last) process.exit(0);

	const keys = await genKeys();
	const clientIP = `${env.VPN_SUBNET}.${answers.last}`;

	/* ---------------- MIKROTIK COMMAND ---------------- */

	const mikrotikCommand = `/interface/wireguard/peers/add \\
interface=${env.WG_INTERFACE} \\
comment="${answers.name}" \\
public-key="${keys.publicKey}" \\
private-key="${keys.privateKey}" \\
allowed-address=${clientIP}/32 \\
client-address=${clientIP}/24 \\
client-dns=${env.DNS_SERVER} \\
client-endpoint=${env.ENDPOINT} \\
client-keepalive=25`;

	console.log("\n========================================");
	console.log(" MIKROTIK COMMAND");
	console.log("========================================\n");
	console.log(mikrotikCommand);

	/* ---------------- CLIENT CONFIG ---------------- */

	const clientConfig = `[Interface]
PrivateKey = ${keys.privateKey}
Address = ${clientIP}/24
DNS = ${env.DNS_SERVER}

[Peer]
PublicKey = ${env.SERVER_PUBLIC_KEY}
Endpoint = ${env.ENDPOINT}
AllowedIPs = ${env.VPN_SUBNET}.0/24, ${env.INTERNAL_LAN}
PersistentKeepalive = 25
`;

	console.log("\n========================================");
	console.log(" CLIENT CONFIG");
	console.log("========================================\n");
	console.log(clientConfig);

	/* ---------------- SAVE FILE ---------------- */

	const configSuffix = (env.CONFIG_NAME || "client").replace(/\.conf$/, "");
	const filename = `${answers.name}-${configSuffix}.conf`;

	await writeFile(filename, clientConfig);

	console.log(`\nSaved config -> ${filename}`);
}

main();
