const { helpers, configs } = require('backend-utility');
const { repositories, database } = require('data-access-utility');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'trace' });

const hardhatConfigurations = require('./config/config');
const { deployErc721, deployErc1155 } = require('./scripts/deployment');
const { abi: erc721Abi } = require('./artifacts/src/contracts/ERC721UpgradeableNftEngine.sol/ERC721UpgradeableNftEngine.json');
const { abi: erc1155Abi } = require('./artifacts/src/contracts/ERC1155UpgradeableNftEngine.sol/ERC1155UpgradeableNftEngine.json');

const { STAGE } = process.env;
const { updateKey } = helpers.ssm;

const { enums, defaults } = configs;
const { NftEngineSmartContractPlatformName } = defaults;
const { SmartContractTypes, SmartContractIdentity, TokenProtocol } = enums;

const { ERC721, ERC1155 } = TokenProtocol;
const { PLATFORM } = SmartContractTypes;
const { INTERNAL } = SmartContractIdentity;

const envConfigs = hardhatConfigurations[STAGE];
pino.info(envConfigs);

const {
  ERC721_CONTRACT_ADDRESS: ERC721_CONTRACT_ADDRESS_SSM_KEY,
  ERC1155_CONTRACT_ADDRESS: ERC1155_CONTRACT_ADDRESS_SSM_KEY,
} = envConfigs;

/**
 * Function to deploy smart contracts
 */
(async () => {
  let connection;
  let transaction;

  try {
    const contractAddressErc721 = await deployErc721();
    const contractAddressErc1155 = await deployErc1155();

    pino.info(`ERC721 ADDRESS : ${contractAddressErc721} | ERC1155 ADDRESS : ${contractAddressErc1155}`);
    pino.info(`ERC1155 SSM KEY : ${ERC721_CONTRACT_ADDRESS_SSM_KEY} | ERC1155 SSM KEY : ${ERC1155_CONTRACT_ADDRESS_SSM_KEY}`);

    await updateKey(ERC721_CONTRACT_ADDRESS_SSM_KEY, contractAddressErc721, 'String');
    await updateKey(ERC1155_CONTRACT_ADDRESS_SSM_KEY, contractAddressErc1155, 'String');

    connection = database.openConnection();
    const smartContractAbiRepo = new repositories.SmartContractAbi(connection);
    const smartContractRepo = new repositories.SmartContract(connection);

    transaction = await connection.sequelize.transaction();

    await smartContractRepo.markActiveByCriteria(PLATFORM, INTERNAL, false, transaction);

    await smartContractRepo.create(contractAddressErc721, NftEngineSmartContractPlatformName, ERC721, PLATFORM, INTERNAL, true, transaction);
    await smartContractRepo.create(contractAddressErc1155, NftEngineSmartContractPlatformName, ERC1155, PLATFORM, INTERNAL, true, transaction);

    await smartContractAbiRepo.create(contractAddressErc721, erc721Abi, transaction);
    await smartContractAbiRepo.create(contractAddressErc1155, erc1155Abi, transaction);

    transaction.commit();
  } catch (exp) {
    pino.error(exp);
    transaction.rollback();
  } finally {
    if (connection) {
      database.closeConnection(connection);
    }
  }
})();
