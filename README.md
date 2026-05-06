# MikroTik WireGuard Peer Generator

Quickly generate MikroTik peer commands and client configuration files.

## Table of Contents
- [Installation](#installation)
  - [Linux](#linux)
  - [macOS](#macos)
  - [Windows](#windows)
- [Quick Start](#quick-start)
  - [Configuration](#configuration)
  - [Usage](#usage)
- [Building from Source](#building-from-source)

## Installation

### Linux
```bash
wget https://github.com/AzPepoze/mikrotik-wireguard-peer-generator/releases/latest/download/mikrotik-wireguard-peer-generator-linux && chmod +x mikrotik-wireguard-peer-generator-linux
```

### macOS
Download the binary for your architecture:
- [Apple Silicon (arm64)](https://github.com/AzPepoze/mikrotik-wireguard-peer-generator/releases/latest/download/mikrotik-wireguard-peer-generator-mac-arm64)
- [Intel (x64)](https://github.com/AzPepoze/mikrotik-wireguard-peer-generator/releases/latest/download/mikrotik-wireguard-peer-generator-mac-x64)

```bash
chmod +x mikrotik-wireguard-peer-generator-mac-*
```

### Windows
Download the `.exe` file:
- [Windows x64](https://github.com/AzPepoze/mikrotik-wireguard-peer-generator/releases/latest/download/mikrotik-wireguard-peer-generator-windows.exe)

---

## Quick Start

### Configuration
1. **Configure Environment**:
   Create a `.env` file **in the same folder as the executable**. You can copy the example from the repository or create it manually:

   > [!IMPORTANT]
   > The `.env` file must be located in the same directory where you run the binary.

   | Variable | Description | Example |
   | :--- | :--- | :--- |
   | `VPN_SUBNET` | Base subnet for VPN (without the last octet) | `10.8.0` |
   | `WG_INTERFACE` | Name of the WireGuard interface on MikroTik | `wireguard1` |
   | `DNS_SERVER` | DNS server to be used by clients | `10.8.0.1` |
   | `ENDPOINT` | Public IP/Domain and port of your MikroTik | `vpn.example.com:51820` |
   | `SERVER_PUBLIC_KEY` | Public key of your MikroTik WireGuard interface | `RT8JMP...` |
   | `INTERNAL_LAN` | Internal network routes (comma separated) | `192.168.1.0/24` |
   | `CONFIG_NAME` | (Optional) Default filename for generated config | `client.conf` |

### Usage
2. **Run the Generator**:
   - **Linux/macOS**: Run via terminal.
   - **Windows**: You can simply double-click the `.exe` file or run it via PowerShell.

   ```bash
   # Linux
   ./mikrotik-wireguard-peer-generator-linux

   # macOS
   ./mikrotik-wireguard-peer-generator-mac-arm64

   # Windows
   .\mikrotik-wireguard-peer-generator-windows.exe
   ```

3. **Follow Prompts**: Enter the peer name and the last octet of the client IP.

4. **Apply**: Copy the generated command to your MikroTik terminal and use the generated `.conf` file on your client.

---

## Building from Source
If you have [Bun](https://bun.sh) installed:
```bash
bun install
bun run build:all
```
