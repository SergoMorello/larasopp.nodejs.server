# Laravel WebSocket Server

WebSocket server for Laravel applications, providing real-time communication between clients and server.

## Description

`larasopp-server` is a Node.js WebSocket server designed specifically for Laravel applications. It provides bidirectional communication between clients and server, supports channels, user authentication, and connection management.

## Features

- ✅ WebSocket connections with SSL/TLS support
- ✅ User authentication via Laravel API
- ✅ Support for public, private, and protected channels
- ✅ Channel subscription management
- ✅ Logging and debugging system
- ✅ Server management via commands (control channel)
- ✅ Presence channels with user data
- ✅ Automatic connection and disconnection management

## Requirements

- Node.js 14.x or higher
- Laravel application with installed `larasopp/larasopp` package
- npm or yarn

## Installation

### Global Installation

```bash
npm i larasopp-server -g
```

### Local Installation

```bash
npm i larasopp-server
```

### Usage Without Installation

```bash
npx larasopp-server start
```

## Running

After installation, start the server with:

```bash
larasopp-server start
```

or with npx:

```bash
npx larasopp-server start
```

## Configuration

Create a `larasopp-server.json` file in the project root or in the directory from which the server is started.

### Configuration Example

```json
{
	"appHost": "http://127.0.0.1:8000",
	"key": "your-secret-key-here",
	"host": "0.0.0.0",
	"port": 3001,
	"debug": true,
	"log": true,
	"logPath": "./",
	"ssl": {
		"cert": "/path/to/certificate.crt",
		"key": "/path/to/private.key",
		"ca": "/path/to/ca.crt"
	}
}
```

### Configuration Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appHost` | string | Yes | URL of your Laravel application (e.g., `http://127.0.0.1:8000`) |
| `key` | string | Yes | Secret key for server management via control channel |
| `host` | string | No | Host to listen on (default: `0.0.0.0`) |
| `port` | number | Yes | Port for WebSocket connections (default: `3001`) |
| `debug` | boolean | No | Enable debug mode (default: `false`) |
| `log` | boolean | No | Enable file logging (default: `false`) |
| `logPath` | string | No | Path to log directory (default: `./`) |
| `ssl` | object | No | SSL/TLS configuration for secure connections |

### SSL/TLS Configuration

To enable SSL/TLS connections, add the `ssl` section to the configuration:

```json
{
	"ssl": {
		"cert": "/path/to/certificate.crt",
		"key": "/path/to/private.key",
		"ca": "/path/to/ca.crt"
	}
}
```

## Related Packages

### JavaScript/TypeScript Client

```bash
npm install larasopp
```

Documentation: [https://www.npmjs.com/package/larasopp](https://www.npmjs.com/package/larasopp)

### Laravel Package

```bash
composer require larasopp/larasopp
```

## Development

### Cloning the Repository

```bash
git clone <repository-url>
cd larasopp-nodejs
```

### Installing Dependencies

```bash
npm install
```

### Building the Project

```bash
npm run build
```

### Running in Development Mode

```bash
npm start
```

## Architecture

The server is built on the following components:

- **Server** - main server class, manages WebSocket connections
- **Client** - client class, handles authentication and messages
- **Channel** - channel and subscription management
- **Core** - base class with common functionality
- **Http** - HTTP client for interacting with Laravel API
- **Config** - configuration management

## Security

- Use a strong secret key (`key`) to protect the control channel
- Enable SSL/TLS for production environments
- Configure proper CORS policies in your Laravel application
- Regularly update dependencies

## License

MIT

## Author

Sergey Serov

## Support

If you encounter any issues or have questions, please create an issue in the project repository.
