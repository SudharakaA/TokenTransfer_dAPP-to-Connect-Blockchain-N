const hre = require("hardhat");

async function main() {
    const Manifestation = await hre.ethers.getContractFactory("Manifestation");
    const manifestation = await Manifestation.deploy();
    await manifestation.deployed();
    console.log("Manifestation deployed to:", manifestation.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });