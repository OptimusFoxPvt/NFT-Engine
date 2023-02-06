const { ethers, upgrades } = require('hardhat');

async function deployErc721() {
  const ERC721UpgradeableNftEngine = await ethers.getContractFactory(
    'ERC721UpgradeableNftEngine',
  );

  const ERC721UpgradeableNftEngineProxy = await upgrades.deployProxy(
    ERC721UpgradeableNftEngine,
    ['NftEngine', 'BLOC', '1.0.0'],
    {
      initializer: 'InitializeERC721UpgradeableNftEngine',
    },
  );

  await ERC721UpgradeableNftEngineProxy.deployed();
  const contractAddress = ERC721UpgradeableNftEngineProxy.address;

  return contractAddress;
}

module.exports = {
  deployErc721,
};
