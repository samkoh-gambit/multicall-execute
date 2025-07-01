# MulticallBN Scripts

This project provides scripts to interact with your MulticallBN smart contract, including reading, writing, and executing multicall transactions.

## Setup

1. **Install dependencies:**

```sh
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the project root with the following content (replace with your actual values):

```
PRIVATE_KEY=your_private_key_here
RPC_URL=your_rpc_url_here
MULTICALL_ADDRESS=your_multicall_contract_address_here
TOKEN_CONTRACT=your_erc20_token_contract_address_here
```

**Note:** Never commit your `.env` file or private keys to version control.

## Usage

### Read from Contract

Run the read script to call read-only functions:

```sh
node read.js
```

### Write to Contract

Run the write script to send transactions (write functions):

```sh
node write.js
```

### Execute Multicall Aggregate

Run the execute script to batch multiple ERC-20 transfers using the MulticallBN contract:

```sh
node execute.js
```

This script will:

- Build a batch of ERC-20 `transferFrom` calls.
- Submit them to the MulticallBN contract's `aggregate` function.
- Print the transaction hash and receipt.

## Security

- **Never share or commit your private key.**
- Use environment variables for all sensitive data.
- For production, use a secure key management solution.

---

## Running the Backend as an API Server

You can also run the backend as an Express API server. This is useful for local development or when you want to expose API endpoints for the frontend to consume.

Start the backend API server with:

```sh
node server.js
```

## Execute okk approve

```sh
node execute-okk-approve.js
```
