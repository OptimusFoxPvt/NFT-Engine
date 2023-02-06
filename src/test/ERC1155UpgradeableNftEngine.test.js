const { ethers, upgrades } = require('hardhat');
const { expect } = require('chai');

describe('ERC1155UpgradeableNftEngine contract', () => {
  let ERC1155UpgradeableNftEngine;
  let _ERC1155UpgradeableNftEngine;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    ERC1155UpgradeableNftEngine = await ethers.getContractFactory(
      'ERC1155UpgradeableNftEngine',
    );
    _ERC1155UpgradeableNftEngine = await upgrades.deployProxy(
      ERC1155UpgradeableNftEngine,
      ['NftEngine', 'BLOC', '', '1.0.0'],
      {
        initializer: 'InitializeERC1155UpgradeableNftEngine',
      },
    );

    await _ERC1155UpgradeableNftEngine.deployed();
  });

  describe('Upgradeable', () => {
    beforeEach(async () => {
      const ERC1155UpgradeableNftEngineV2 = await ethers.getContractFactory(
        'ERC1155UpgradeableNftEngineV2',
      );

      await upgrades.upgradeProxy(
        _ERC1155UpgradeableNftEngine.address,
        ERC1155UpgradeableNftEngineV2,
      );
      UpgradeableV2 = ERC1155UpgradeableNftEngineV2.attach(
        _ERC1155UpgradeableNftEngine.address,
      );
    });

    it('Should execute a new function once the contract is upgraded', async () => {
      const testID = 2;
      await UpgradeableV2.set(testID);
      expect(await UpgradeableV2.get()).to.equal(testID);
    });

    it('Should get the same stored values after the contract is upgraded', async () => {
      const testID = 2;
      const tokenID = 2;
      const supply = 5;
      const tokenURI = 'https:ipfs/blocommecre/erc1155/id/';
      await _ERC1155UpgradeableNftEngine
        .connect(addr1)
        .mint(tokenID, supply, tokenURI);
      expect(await _ERC1155UpgradeableNftEngine.uri(tokenID)).to.equal(
        tokenURI,
      );
      expect(await _ERC1155UpgradeableNftEngine.owner()).to.equal(
        owner.address,
      );
      expect(await UpgradeableV2.uri(tokenID)).to.equal(tokenURI);
      await UpgradeableV2.set(testID);
      expect(await UpgradeableV2.get()).to.equal(testID);
    });
  });

  describe('Deployement', () => {
    it('Should retirive the right owner of the contract.', async () => {
      expect(await _ERC1155UpgradeableNftEngine.owner()).to.equal(
        owner.address,
      );
    });

    it('Should fail if not the right owner of the contract.', async () => {
      expect(await _ERC1155UpgradeableNftEngine.owner()).to.not.equal(
        addr1.address,
      );
    });
  });

  describe('ERC1155 NFT Minting', () => {
    beforeEach(async () => {
      const tokenID = 2;
      const supply = 5;
      const tokenURI = 'https:ipfs/blocommecre/erc1155/id/';
      await _ERC1155UpgradeableNftEngine
        .connect(addr1)
        .mint(tokenID, supply, tokenURI);
    });

    it('Should mintBatch.', async () => {
      const tokenID = [2, 3, 4];
      const supply = [5, 10, 15];
      const tokenURI = [
        'https:ipfs/blocommecre/erc1155/id/',
        'https:ipfs/blocommecre/erc1155/id/',
        'https:ipfs/blocommecre/erc1155/id/',
      ];
      expect(
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .mintBatch(tokenID, supply, tokenURI),
      );
    });

    it('Should allow to mint for everyone.', async () => {
      const tokenID = 2;
      const supply = 5;
      const tokenURI = 'https:ipfs/blocommecre/erc1155/id/';
      expect(
        await _ERC1155UpgradeableNftEngine
          .connect(addr2)
          .mint(tokenID, supply, tokenURI),
      );
    });

    it('Should allow to mint for Contract owner.', async () => {
      const tokenID = 2;
      const supply = 5;
      const tokenURI = 'https:ipfs/blocommecre/erc1155/id/';
      expect(
        await _ERC1155UpgradeableNftEngine
          .connect(owner)
          .mint(tokenID, supply, tokenURI),
      );
    });

    it('Should return total supply for exixtent erc1155 NFT.', async () => {
      const tokenID = 2;
      const balance = await _ERC1155UpgradeableNftEngine.balanceOf(
        addr1.address,
        tokenID,
      );
      expect(
        await _ERC1155UpgradeableNftEngine.totalSupply(tokenID),
      ).to.equal(balance);
    });
    it('Should return uri for exsistent erc1155 NFT.', async () => {
      const tokenID = 2;
      const _uri = 'https:ipfs/blocommecre/erc1155/id/';
      expect(await _ERC1155UpgradeableNftEngine.uri(tokenID)).to.equal(
        _uri,
      );
    });

    it('Should fail for not owner of the erc1155 NFT.', async () => {
      const tokenID = 2;
      const balance = await _ERC1155UpgradeableNftEngine.balanceOf(
        addr1.address,
        tokenID,
      );
      expect(
        await _ERC1155UpgradeableNftEngine.creators(balance),
      ).to.not.equal(addr2.address);
    });

    it('Should get creator of erc1155 NFT.', async () => {
      const tokenID = 2;
      expect(await _ERC1155UpgradeableNftEngine.creators(tokenID)).to.equal(
        addr1.address,
      );
    });

    it('Contract owner should not be the erc1155 NFT owner if its not minted.', async () => {
      const tokenID = 2;
      const balance = await _ERC1155UpgradeableNftEngine.balanceOf(
        addr1.address,
        tokenID,
      );
      expect(
        await _ERC1155UpgradeableNftEngine.balanceOf(owner.address, tokenID),
      ).to.not.equal(balance);
    });

    describe('ERC1155 NFT Metadata', () => {
      it('Should update the metdada', async () => {
        const tokenID = 2;
        const newUri = 'https:ipfs/blocommecre/erc1155/id/testing/';
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .updateURI(tokenID, newUri);
        expect(await _ERC1155UpgradeableNftEngine.uri(tokenID)).to.equal(
          newUri,
        );
      });

      it('Should update the mintBatched erc1155 NFT metdada', async () => {
        const tokenID = [2, 3, 4];
        const supply = [5, 10, 15];
        const tokenURI = [
          'https:ipfs/blocommecre/erc1155/id/',
          'https:ipfs/blocommecre/erc1155/id/',
          'https:ipfs/blocommecre/erc1155/id/',
        ];
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .mintBatch(tokenID, supply, tokenURI);
        const newUri = 'https:ipfs/blocommecre/erc1155/id/testing/';
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .updateURI(2, newUri);
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .updateURI(3, newUri);
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .updateURI(4, newUri);
        expect(await _ERC1155UpgradeableNftEngine.uri(2)).to.equal(
          newUri,
        );
        expect(await _ERC1155UpgradeableNftEngine.uri(3)).to.equal(
          newUri,
        );
        expect(await _ERC1155UpgradeableNftEngine.uri(4)).to.equal(
          newUri,
        );
      });

      it('Should revert if not owner', async () => {
        const tokenID = 2;
        const newUri = 'https:ipfs/blocommecre/erc1155/id/testing/';
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr2)
            .updateURI(tokenID, newUri),
        ).to.be.reverted;
      });

      it('Should revert even for the contract owner', async () => {
        const tokenID = 2;
        const newUri = 'https:ipfs/blocommecre/erc1155/id/testing/';
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(owner)
            .updateURI(tokenID, newUri),
        ).to.be.reverted;
      });
    });

    describe('ERC1155 NFT Transfer', () => {
      it('Should transfer by the owner', async () => {
        const tokenID = 2;
        const amount = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          ['safeTransferFrom(address,address,uint256,uint256,bytes)'](addr1.address, addr2.address, tokenID, amount, "0x00");
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr2.address, tokenID),
        ).to.equal(amount);
      });

      it('Should return the remaining editions owner after transfer by the owner', async () => {
        const tokenID = 2;
        const totalAmount = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        const amountToTransfer = 3;
        const amountAfterTransfer = totalAmount - amountToTransfer;
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          ['safeTransferFrom(address,address,uint256,uint256,bytes)'](addr1.address, addr2.address, tokenID, amountToTransfer, "0x00");
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr1.address, tokenID),
        ).to.equal(amountAfterTransfer);
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr2.address, tokenID),
        ).to.equal(amountToTransfer);
      });

      it('Should revert if not the owner', async () => {
        const tokenID = 2;
        const amount = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr2)
            ['safeTransferFrom(address,address,uint256,uint256,bytes)'](addr1.address, addr2.address, tokenID, amount, "0x00")
        ).to.be.reverted;
      });

      it('Should revert if not owned NFT into their wallets', async () => {
        const tokenID = 2;
        const amount = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr2.address,
          tokenID,
        );
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr2)
            ['safeTransferFrom(address,address,uint256,uint256,bytes)'](addr1.address, addr2.address, tokenID, amount, "0x00")
        ).to.be.reverted;
      });

      it('Should revert for non existent NFT', async () => {
        const tokenID = 123; // random tokenID which is not existent OR no one is the owner of it.
        const amount = 100; // random amount which is not existent OR no one is the owner of it.
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr1)
            ['safeTransferFrom(address,address,uint256,uint256,bytes)'](addr1.address, addr2.address, tokenID, amount, "0x00")
        ).to.be.reverted;
      });
    });

    describe('NFT Burn', () => {
      it('Should burn by the owner', async () => {
        const tokenID = 2;
        const edtions = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .burn(tokenID, edtions);
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr1.address, tokenID),
        ).to.equal(0);
      });

      it('Should revert for non existent NFT', async () => {
        const tokenID = 123; // random tokenID which is not existent OR no one is the owner of it.
        const editions = 456; // not exixtent amount /editions to burn
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr1)
            .burn(tokenID, editions),
        ).to.be.reverted;
      });

      it('Should revert if not the owner', async () => {
        const tokenID = 2;
        const edtions = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(addr2)
            .burn(tokenID, edtions),
        ).to.be.reverted;
      });

      it('Should revert even for the Contract owner', async () => {
        const tokenID = 2;
        const edtions = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        await expect(
          _ERC1155UpgradeableNftEngine
            .connect(owner)
            .burn(tokenID, edtions),
        ).to.be.reverted;
      });

      it('Should return the remaining editions\'owner after burn by the owner', async () => {
        const tokenID = 2;
        const totalEditions = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        const amountToBurn = 3;
        const amountAfterBurn = totalEditions - amountToBurn;
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .burn(tokenID, amountToBurn);
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr1.address, tokenID),
        ).to.equal(amountAfterBurn);
      });

      it('Should return 0 owned if all editions are burned by the owner', async () => {
        const tokenID = 2;
        const totalEditions = await _ERC1155UpgradeableNftEngine.balanceOf(
          addr1.address,
          tokenID,
        );
        const amountToBurn = 5;
        await _ERC1155UpgradeableNftEngine
          .connect(addr1)
          .burn(tokenID, amountToBurn);
        expect(
          await _ERC1155UpgradeableNftEngine.balanceOf(addr1.address, tokenID),
        ).to.equal(0);
      });
    });
  });
});
