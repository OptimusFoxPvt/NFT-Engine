// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

library LibERC1155LazyMint {
    struct NFT {
        address creator;
        uint256 tokenId;
        uint256 editions;
    }
}
