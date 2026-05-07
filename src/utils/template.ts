export const DEFAULT_README_TEMPLATE = `{{name}}-{{suffix}}.conf - Windows / Linux / macOs / Mobile
Normal config this should work with all devices if not have any issue.

{{name}}-{{suffix}}-linux.conf - Linux.
Fix for some linux that unable to use the VPN DNS. 

{{name}}-{{suffix}}-no-dns.conf - Windows / Linux / macOs / Mobile
Use this if you don't want to use the VPN DNS.

How to Use

Windows / macOs / Mobile
Import the {{name}}-{{suffix}}.conf file into your WireGuard client application.

Linux (wg-quick)
1. sudo cp {{name}}-{{suffix}}-linux.conf /etc/wireguard/{{suffix}}.conf
2. sudo wg-quick up {{suffix}}

* NOTE : VPN DNS is for able to use servername instead of ip.
`;
