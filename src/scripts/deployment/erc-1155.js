const { ethers, upgrades } = require('hardhat');

async function deployErc1155() {
  const ERC1155UpgradeableNftEngine = await ethers.getContractFactory(
    'ERC1155UpgradeableNftEngine',
  );

  const ERC1155UpgradeableNftEngineProxy = await upgrades.deployProxy(
    ERC1155UpgradeableNftEngine,
    ['NftEngine', 'BLOC', '', '1.0.0'],
    {
      initializer: 'InitializeERC1155UpgradeableNftEngine',
    },
  );

  await ERC1155UpgradeableNftEngineProxy.deployed();
  const contractAddress = ERC1155UpgradeableNftEngineProxy.address;

  return contractAddress;
}

module.exports = {
  deployErc1155,
};
