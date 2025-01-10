# Worker Web3 SDK Project

## Description

This project is a middleware application that uses Web3 to interact with smart contracts on the Sepolia network. It also connects to WebSocket services to receive real-time data and handle other information.

## Environment Configuration

To run this project, you need to create a `.env` file in the root directory of your project and add the following environment variables:

## Environment vars
```
This project uses the following environment variables:

HTTP_PROVIDER=https://example.infura.io/v3/YOUR_INFURA_PROJECT_ID

CONTRACT_ADDRESS_DEVICE_MANAGER=0xYourDeviceManagerContractAddress

CONTRACT_ADDRESS_ORDER_MANAGER=0xYourOrderManagerContractAddress

CONTRACT_ADDRESS_MAIN=0xYourMainContractAddress

WALLET_MAIN_ADDRESS=0xYourMainWalletAddress

SOCKET_URL=https://example.com

SOCKET_PATH=/path/to/socket.io

JWT_TOKEN=your.jwt.token.here
```

## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://git.x-or.cloud/x-or/worker-web3-sdk
```

```bash
npm install
```

## Steps for read-only access

To start the express server, run the following

```bash
node index.js
```


## Use Docker
You can also run this app as a Docker container:

Step 1: Clone the repo

```bash
git clone https://git.x-or.cloud/x-or/worker-web3-sdk
```

Step 2: Build the Docker image

```bash
docker build -t workersdk .
```

Step 3: Run the Docker container locally:

```bash
docker run --env-file .env -d --name Worker  workersdk
```
