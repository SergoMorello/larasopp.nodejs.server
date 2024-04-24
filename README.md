# Laravel websocket server

#### Client
```
https://www.npmjs.com/package/larasopp
```
#### Laravel package
```
composer require larasopp/larasopp
```

#### Install
```
npm i larasopp-server -g
```

### Run
```
larasopp-server start
or
npx larasopp-server start
```

#### Config
##### ./larasopp-server.json
```json
{
	"appHost": "http://127.0.0.1:8000",
	"key": "secret key",
	"host": "0.0.0.0",
	"port": 3001,
	"debug": true,
	"log": true,
	"logPath": "./",
	// "ssl": {
	// 	"cert": "",
	// 	"key": "",
	// 	"ca": ""
	// }
}
```
