const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CADepTransferV1", () => {
  let caDepTransfer;
  let owner;
  let sender;
  let recipient1;
  let recipient2;
  let recipient3;

  // Initial commission percentage for the contract
  const initialPercent = 5;

  beforeEach(async () => {
    // Getting the contract factory for CADepTransferV1
    const CADepTransferV1 = await ethers.getContractFactory("CADepTransferV1");

    // Retrieving signers/accounts
    [owner, sender, recipient1, recipient2, recipient3] =
      await ethers.getSigners();

    // Deploying the contract as an upgradable proxy with initial percent
    caDepTransfer = await upgrades.deployProxy(
      CADepTransferV1,
      [initialPercent],
      {
        initializer: "initialize",
      }
    );

    // Awaiting deployment completion
    await caDepTransfer.waitForDeployment();
  });

  // Test to check if commission percent is set correctly
  it("should set the correct commission percent", async function () {
    const commissionPercent = await caDepTransfer.getCommissionPercent();
    expect(commissionPercent).to.equal(initialPercent);
  });

  // Test to ensure proper Ether transfer to multiple recipients
  it("should transfer Ether to multiple recipients", async function () {
    // Defining payment details for each recipient
    const payments = [
      {
        recipient: recipient1.address,
        amount: ethers.parseEther("1"),
      },
      {
        recipient: recipient2.address,
        amount: ethers.parseEther("2"),
      },
      {
        recipient: recipient3.address,
        amount: ethers.parseEther("3"),
      },
    ];

    let totalAmount = 0;

    // Calculating the total amount to be transferred
    await payments.forEach((payment) => {
      totalAmount += Number(ethers.formatEther(payment.amount));
    });

    // Calculating the total commission and remaining amount after commission
    const totalCommission = (totalAmount * initialPercent) / 100;
    const remainingAmount = totalAmount - totalCommission;

    // Recording balances of recipients before the transfer
    const beforeRecipient1Balance = ethers.formatEther(
      await ethers.provider.getBalance(recipient1.address)
    );

    const beforeRecipient2Balance = ethers.formatEther(
      await ethers.provider.getBalance(recipient2.address)
    );

    const beforeRecipient3Balance = ethers.formatEther(
      await ethers.provider.getBalance(recipient3.address)
    );

    // Executing the transfer to multiple addresses
    await caDepTransfer.connect(sender).transferToMultipleAddresses(payments, {
      value: ethers.parseEther(totalAmount.toString()),
    });

    // Verifying balances of recipients after the transfer
    // Each recipient's balance should increase proportionally to their payment amount
    const recipient1Balance = await ethers.provider.getBalance(
      recipient1.address
    );
    const recipient2Balance = await ethers.provider.getBalance(
      recipient2.address
    );
    const recipient3Balance = await ethers.provider.getBalance(
      recipient3.address
    );

    expect(recipient1Balance).to.equal(
      ethers.parseEther(
        (
          Number(beforeRecipient1Balance) +
          (remainingAmount * ethers.formatEther(payments[0].amount)) /
            totalAmount
        ).toString()
      )
    );

    expect(recipient2Balance).to.equal(
      ethers.parseEther(
        (
          Number(beforeRecipient2Balance) +
          (remainingAmount * ethers.formatEther(payments[1].amount)) /
            totalAmount
        ).toString()
      )
    );

    expect(recipient3Balance).to.equal(
      ethers.parseEther(
        (
          Number(beforeRecipient3Balance) +
          (remainingAmount * ethers.formatEther(payments[2].amount)) /
            totalAmount
        ).toString()
      )
    );
  });

  // Test to verify the withdrawal of commissions from the contract
  it("should withdraw commissions", async function () {
    await caDepTransfer
      .connect(sender)
      .transferToMultipleAddresses(
        [{ recipient: recipient1.address, amount: ethers.parseEther("10") }],
        { value: ethers.parseEther("10") }
      );

    // Checking initial balances of the owner and contract
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const contractBalance = await ethers.provider.getBalance(
      caDepTransfer.target
    );

    expect(await ethers.provider.getBalance(caDepTransfer.target)).to.equal(
      ethers.parseEther(((10 * initialPercent) / 100).toString())
    );

    // Withdraw commissions
    const withdrawTx = await caDepTransfer.withdrawCommissions();

    // Check if the contract balance is now 0
    expect(await ethers.provider.getBalance(caDepTransfer.target)).to.equal(0);

    // Check if the owner's balance increased by the contract balance minus gas costs
    const receipt = await withdrawTx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const expectedBalance = initialOwnerBalance + contractBalance - gasUsed;
    expect(await ethers.provider.getBalance(owner.address)).to.equal(
      expectedBalance
    );
  });
});
