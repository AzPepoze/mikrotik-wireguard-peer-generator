import "dotenv/config";
import { writeFile } from "fs/promises";
import { join } from "path";
import prompts from "prompts";
import { generateMikrotikCommand, generateWireGuardConfig } from "./utils/config-generator";
import { DEFAULT_README_TEMPLATE } from "./utils/template";
import { zipSync, strToU8 } from "fflate";

const environmentVariables = process.env;

async function generateKeyPair() {
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
	const userInputs = await prompts([
		{
			type: "text",
			name: "name",
			message: "Peer name:",
		},
		{
			type: "number",
			name: "lastOctet",
			message: "Last IP octet:",
		},
	]);

	if (!userInputs.name || !userInputs.lastOctet) process.exit(0);

	const keys = await generateKeyPair();
	const clientIpAddress = `${environmentVariables.VPN_SUBNET}.${userInputs.lastOctet}`;

	const mikrotikCommand = generateMikrotikCommand({
		interfaceName: environmentVariables.WG_INTERFACE || "",
		peerName: userInputs.name,
		publicKey: keys.publicKey,
		privateKey: keys.privateKey,
		clientIp: clientIpAddress,
		dnsServer: environmentVariables.DNS_SERVER || "",
		endpoint: environmentVariables.ENDPOINT || "",
	});

	console.log("\n========================================");
	console.log(" MIKROTIK COMMAND");
	console.log("========================================\n");
	console.log(mikrotikCommand);

	const configOptions = {
		privateKey: keys.privateKey,
		clientIp: clientIpAddress,
		dnsServer: environmentVariables.DNS_SERVER || "",
		serverPublicKey: environmentVariables.SERVER_PUBLIC_KEY || "",
		endpoint: environmentVariables.ENDPOINT || "",
		vpnSubnet: environmentVariables.VPN_SUBNET || "",
		internalLan: environmentVariables.INTERNAL_LAN || "",
		dnsDomain: environmentVariables.DNS_DOMAIN || "",
	};

	const normalClientConfig = generateWireGuardConfig(configOptions);
	const linuxClientConfig = generateWireGuardConfig({ ...configOptions, isLinux: true });
	const hasDns = !!environmentVariables.DNS_SERVER;
	const noDnsClientConfig = hasDns ? generateWireGuardConfig({ ...configOptions, noDns: true }) : "";

	console.log("\n========================================");
	console.log(" CLIENT CONFIG (NORMAL)");
	console.log("========================================\n");
	console.log(normalClientConfig);

	console.log("\n========================================");
	console.log(" CLIENT CONFIG (LINUX)");
	console.log("========================================\n");
	console.log(linuxClientConfig);

	if (hasDns) {
		console.log("\n========================================");
		console.log(" CLIENT CONFIG (NO DNS)");
		console.log("========================================\n");
		console.log(noDnsClientConfig);
	}

	const configSuffix = (environmentVariables.CONFIG_NAME || "client").replace(/\.conf$/, "");
	const folderName = `${userInputs.name}-${configSuffix}`;
	
	const normalFilename = `${folderName}.conf`;
	const linuxFilename = `${folderName}-linux.conf`;
	const noDnsFilename = `${folderName}-no-dns.conf`;

	let readmeContent = DEFAULT_README_TEMPLATE
		.replace(/{{name}}/g, userInputs.name)
		.replace(/{{suffix}}/g, configSuffix);

	if (hasDns) {
		readmeContent = readmeContent
			.replace("{{no_dns_section}}", `\n${noDnsFilename} - Windows / Linux / macOs / Mobile\nUse this if you don't want to use the VPN DNS.\n`)
			.replace("{{dns_note}}", `\n* NOTE : VPN DNS is for able to use servername instead of ip.`);
	} else {
		readmeContent = readmeContent
			.replace("{{no_dns_section}}", "")
			.replace("{{dns_note}}", "");
	}

	const zipFiles: Record<string, Uint8Array> = {
		[normalFilename]: strToU8(normalClientConfig),
		[linuxFilename]: strToU8(linuxClientConfig),
		"README.txt": strToU8(readmeContent.trim() + "\n"),
	};

	if (hasDns) {
		zipFiles[noDnsFilename] = strToU8(noDnsClientConfig);
	}

	const zipData = zipSync(zipFiles);

	const zipFilename = `${folderName}.zip`;
	await writeFile(join(process.cwd(), zipFilename), zipData);
	console.log(`\n- ${zipFilename}: Created successfully`);

	console.log(`\nSaved configs to -> ${zipFilename}`);
}

main();
