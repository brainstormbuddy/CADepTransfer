# FriendtechShares

## Installation
To install the necessary dependencies, run the following command:
```sh
yarn install
```

## Compile the Contract
To compile the contract, run the following command:
```sh
npx hardhat compile
```

## Test the Contract
To run the contract tests, use the following command:
```sh
npx hardhat test
```

## Deploy the Contract
To deploy the contract to the base-goerli test net, execute the following command:
```sh
npx hardhat run scripts/deploy.js --network base-goerli
```

## Verify the Contract
To verify the deployed contract on the base-goerli network, run the following command:
```sh
npx hardhat verify --network base-goerli PROXY_CONTRACT_ADDRESS
```
Replace PROXY_CONTRACT_ADDRESS with the actual address of the deployed contract.

## Update the Contract
To update the deployed contract on the base-goerli network, use the following command:
```sh
npx hardhat run scripts/update.js --network base-goerli
```

**Hope that helps! Let me know if you need anything else. 😊**