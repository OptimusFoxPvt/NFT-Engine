// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./LibERC1155LazyMint.sol";

abstract contract ERC1155UpgradeableNftEngineLazy is Initializable, EIP712Upgradeable, ERC1155Upgradeable{
    using StringsUpgradeable for uint256;
    using AddressUpgradeable for address;

    event LazyMintedTransfer(address indexed from, address indexed to, uint256 tokenId, uint256 amount);

    function __ERC1155UpgradeableNftEngineLazy_init(string memory name, string memory uri, string memory version) internal initializer{
        __ERC1155_init(uri);
        __EIP712_init(name, version);
    }

    function mintAndTransferLazy(address to, LibERC1155LazyMint.NFT memory nft, string memory tokenURI, address signer, bytes calldata signature) internal{
        require(_verify(signer, _hash(nft), signature), "invalid signature");
        require(signer == nft.creator, "creator not matched. invalid signature");
        require(to != address(0), "transfer to the zero address");
        _mint(signer, nft.tokenId, nft.editions, "0x00");
        _setURI(tokenURI);
        _safeTransferFrom(signer, to, nft.tokenId, nft.editions, "0x00");
        emit LazyMintedTransfer(signer, to, nft.tokenId, nft.editions);
    }

    function _hash(LibERC1155LazyMint.NFT memory nft) internal view returns (bytes32){
        return _hashTypedDataV4(keccak256(abi.encode(keccak256("NFT(address creator,uint256 tokenId,uint256 editions)"), nft.creator, nft.tokenId, nft.editions)));
    }

    function _verify(address signer, bytes32 digest, bytes memory signature) internal view returns (bool){
        return SignatureCheckerUpgradeable.isValidSignatureNow(signer, digest, signature);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable) returns (bool){
        return super.supportsInterface(interfaceId);
    }

    uint256[50] private __gap;
}
