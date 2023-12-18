const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const CADepTransferV2 = await ethers.getContractFactory("CADepTransferV2");
  console.log("Upgrading CADepTransfer...");
  await upgrades.upgradeProxy(
    process.env.PROXY_CONTRACT_ADDRESS,
    CADepTransferV2
  );
  console.log("Contract upgraded");
}

main();
