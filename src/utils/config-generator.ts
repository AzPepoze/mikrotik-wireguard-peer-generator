interface MikrotikConfigOptions {
	interfaceName: string;
	peerName: string;
	publicKey: string;
	privateKey: string;
	clientIp: string;
	dnsServer: string;
	endpoint: string;
}

interface WireGuardConfigOptions {
	privateKey: string;
	clientIp: string;
	dnsServer: string;
	serverPublicKey: string;
	endpoint: string;
	vpnSubnet: string;
	internalLan: string;
	isLinux?: boolean;
}

export function generateMikrotikCommand(options: MikrotikConfigOptions): string {
	return `/interface/wireguard/peers/add \\
interface=${options.interfaceName} \\
comment="${options.peerName}" \\
public-key="${options.publicKey}" \\
private-key="${options.privateKey}" \\
allowed-address=${options.clientIp}/32 \\
client-address=${options.clientIp}/24 \\
client-dns=${options.dnsServer} \\
client-endpoint=${options.endpoint} \\
client-keepalive=25`;
}

export function generateWireGuardConfig(options: WireGuardConfigOptions): string {
	const interfaceSection = [
		"[Interface]",
		`PrivateKey = ${options.privateKey}`,
		`Address = ${options.clientIp}/24`,
		`DNS = ${options.dnsServer}`,
	];

	if (options.isLinux) {
		interfaceSection.push(`PostUp = resolvectl dns %i ${options.dnsServer} && resolvectl domain %i "~."`);
	}

	const peerSection = [
		"",
		"[Peer]",
		`PublicKey = ${options.serverPublicKey}`,
		`Endpoint = ${options.endpoint}`,
		`AllowedIPs = ${options.vpnSubnet}.0/24, ${options.internalLan}`,
		"PersistentKeepalive = 25",
	];

	return [...interfaceSection, ...peerSection].join("\n") + "\n";
}
