import "dotenv/config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prompts from "prompts";
import { generateMikrotikCommand, generateWireGuardConfig } from "./utils/config-generator";
import { DEFAULT_README_TEMPLATE } from "./utils/template";

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
	};

	const normalClientConfig = generateWireGuardConfig(configOptions);
	const linuxClientConfig = generateWireGuardConfig({ ...configOptions, isLinux: true });
	const noDnsClientConfig = generateWireGuardConfig({ ...configOptions, noDns: true });

	console.log("\n========================================");
	console.log(" CLIENT CONFIG (NORMAL)");
	console.log("========================================\n");
	console.log(normalClientConfig);

	console.log("\n========================================");
	console.log(" CLIENT CONFIG (LINUX)");
	console.log("========================================\n");
	console.log(linuxClientConfig);

	console.log("\n========================================");
	console.log(" CLIENT CONFIG (NO DNS)");
	console.log("========================================\n");
	console.log(noDnsClientConfig);

	const configSuffix = (environmentVariables.CONFIG_NAME || "client").replace(/\.conf$/, "");
	const folderName = `${userInputs.name}-${configSuffix}`;
	
	const normalFilename = `${folderName}.conf`;
	const linuxFilename = `${folderName}-linux.conf`;
	const noDnsFilename = `${folderName}-no-dns.conf`;

	const folderPath = join(process.cwd(), folderName);
	await mkdir(folderPath, { recursive: true });

	const normalFilePath = join(folderPath, normalFilename);
	const linuxFilePath = join(folderPath, linuxFilename);
	const noDnsFilePath = join(folderPath, noDnsFilename);

	await writeFile(normalFilePath, normalClientConfig);
	await writeFile(linuxFilePath, linuxClientConfig);
	await writeFile(noDnsFilePath, noDnsClientConfig);

	const readmeContent = DEFAULT_README_TEMPLATE
		.replace(/{{name}}/g, userInputs.name)
		.replace(/{{suffix}}/g, configSuffix);

	await writeFile(join(folderPath, "README.txt"), readmeContent);
	console.log("- README.txt: Created from template");

	console.log(`\nSaved configs to folder -> ${folderName}`);
	console.log(`- Normal: ${normalFilename}`);
	console.log(`- Linux:  ${linuxFilename}`);
	console.log(`- No DNS: ${noDnsFilename}`);
}

main();
