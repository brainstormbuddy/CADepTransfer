const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("CADepTransferV1");
  const contract = await upgrades.deployProxy(Contract, [1], {
    initializer: "initialize",
  });

  await contract.waitForDeployment();
  console.log("CADepTransferV1 deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
