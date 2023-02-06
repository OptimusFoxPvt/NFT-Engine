require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

const { NFT_ENGINE_PRIVATE_KEY, PROVIDER, BLOCKCHAIN_ID } = process.env;

const settings = {
  optimizer: {
    enabled: true,
    runs: 1000,
  },
};

task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  accounts.forEach(account => {
    console.log(account.address);
  });
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  networks: {
    hardhat: {},
    primary: {
      url: PROVIDER,
      chainId: parseInt(BLOCKCHAIN_ID),
      accounts: [`0x${NFT_ENGINE_PRIVATE_KEY}`],
    },
  },
  solidity: {
    compilers: [{ version: '0.8.3', settings }],
  },
  paths: {
    sources: 'src/contracts',
    tests: 'src/test',
    artifacts: 'src/artifacts',
  },
};
