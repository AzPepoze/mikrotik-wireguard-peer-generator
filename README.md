# MikroTik WireGuard Peer Generator

Quickly generate MikroTik peer commands and client configuration files.


## Table of Contents
- [MikroTik WireGuard Peer Generator](#mikrotik-wireguard-peer-generator)
	- [Table of Contents](#table-of-contents)
	- [Installation](#installation)
		- [Linux](#linux)
		- [macOS](#macos)
		- [Windows](#windows)
	- [Quick Start](#quick-start)
		- [Configuration](#configuration)
		- [Usage](#usage)
	- [Command Line Arguments](#command-line-arguments)
	- [Data Management](#data-management)
	- [Building from Source](#building-from-source)

---

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
Create a `.env` file **in the same folder as the executable**. You can copy `.env.example` from the repository.

> [!IMPORTANT]
> The `.env` file must be located in the current working directory where you run the binary.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VPN_SUBNET` | Base subnet for VPN (without the last octet) | `10.8.0` |
| `WG_INTERFACE` | Name of the WireGuard interface on MikroTik | `wireguard1` |
| `DNS_SERVER` | DNS server to be used by clients | `10.8.0.1` |
| `ENDPOINT` | Public IP/Domain and port of your MikroTik | `vpn.example.com:51820` |
| `SERVER_PUBLIC_KEY` | Public key of your MikroTik WireGuard interface | `RT8JMP...` |
| `DNS_DOMAIN` | (Optional) DNS search domain for clients | `example.local` |
| `INTERNAL_LAN` | Internal network routes (comma separated) | `192.168.1.0/24` |
| `CONFIG_NAME` | (Optional) Filename suffix (defaults to `client`) | `company` |

### Usage
Run the generator and follow the interactive prompts.

```bash
# Linux
./mikrotik-wireguard-peer-generator-linux

# macOS
./mikrotik-wireguard-peer-generator-mac-arm64

# Windows
.\mikrotik-wireguard-peer-generator-windows.exe
```

1. **Enter Peer Name**: Use a descriptive name (e.g., `john-laptop`).
2. **Confirm IP Octet**: The tool suggests the next available IP based on `map.csv`.
3. **Extract Results**: Check the `out/` folder for the generated `.zip` file.

---

## Command Line Arguments

The tool supports several command line arguments for management tasks:

| Argument | Description | Usage |
| :--- | :--- | :--- |
| `--remove <name>` | Removes a peer from `map.csv` and deletes its generated ZIP files from the `out/` folder. | `./generator --remove john-laptop` |

---

## Data Management

- **`map.csv`**: This file is created in the root directory. It keeps a record of all generated peers, their IPs, and the generated commands. **Do not delete this file** if you want the tool to continue suggesting the next available IP correctly.
- **`out/` folder**: All generated client packages (ZIP files) are stored here.

---

## Building from Source

If you have [Bun](https://bun.sh) installed:

```bash
bun install
bun run build:all
```

The binaries will be generated in the `dist/` folder.

