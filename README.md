# TokenTransfer_dAPP-to-Connect-Blockchain-N

```md
# Manifestation Token DApp

A simple dApp to deploy and interact with the **Manifestation** (MNF) ERC-20 token on Ethereum.

## Features
- Deployable **ERC-20** smart contract using **OpenZeppelin**.
- Transfer tokens via a browser-based interface.
- Connect & authenticate with **MetaMask**.
- Track balances and display recent transfers.

## Getting Started
1. **Install** dependencies:
   ```bash
   npm install
   ```
2. **Compile & Deploy** smart contracts:
   ```bash
   npx hardhat compile
   npx hardhat run deploy/deploy.js --network <your_network>
   ```
3. **Run** the app (example with a simple server):
   ```bash
   npx live-server
   ```
4. **Open** the `index.html` in your browser and connect your wallet.

## License
[MIT](LICENSE)
```
