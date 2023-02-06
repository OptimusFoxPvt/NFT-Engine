// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ERC721Enumerable is Initializable, ERC721EnumerableUpgradeable {
    function __Enumerable_init() internal initializer {
        __ERC721Enumerable_init();
    }

    uint256[50] private __gap;
}
