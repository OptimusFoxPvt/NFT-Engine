// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./LibERC721LazyMint.sol";

abstract contract ERC721UpgradeableNftEngineLazy is Initializable, EIP712Upgradeable, ERC721URIStorageUpgradeable{
    using StringsUpgradeable for uint256;
    using AddressUpgradeable for address;

    event LazyMintedTransfer(address indexed from, address indexed to, uint256 tokenId);

    function __ERC721UpgradeableNftEngineLazy_init(string memory name, string memory version) internal initializer{
        __ERC721URIStorage_init();
        __EIP712_init(name, version);
    }

    function mintAndTransferLazy(address to, LibERC721LazyMint.NFT memory nft, string memory tokenURI, address signer, bytes calldata signature) internal{
        require(_verify(signer, _hash(nft), signature), "invalid signature");
        require(signer == nft.creator, "creator not matched. invalid signature"
        );
        require(to != address(0), "can not transfer to the zero address");
        _safeMint(signer, nft.tokenId);
        _setTokenURI(nft.tokenId, tokenURI);
        _safeTransfer(signer, to, nft.tokenId, "0x00");
        emit LazyMintedTransfer(signer, to, nft.tokenId);
    }

    function _hash(LibERC721LazyMint.NFT memory nft) internal view returns (bytes32){
        return _hashTypedDataV4(keccak256(abi.encode(keccak256("NFT(address creator,uint256 tokenId)"), nft.creator, nft.tokenId)));
    }

    function _verify(address signer, bytes32 digest, bytes memory signature) internal view returns (bool){
        return SignatureCheckerUpgradeable.isValidSignatureNow(signer, digest, signature);
    }

    uint256[50] private __gap;
}
