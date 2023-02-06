// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC1155UpgradeableNftEngineLazy.sol";

contract ERC1155UpgradeableNftEngine is Initializable, OwnableUpgradeable, ERC1155Upgradeable, ERC1155UpgradeableNftEngineLazy{
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    string public name;
    string public symbol;

    mapping(uint256 => string) private tokenURI;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) private tokenSupply;

    function InitializeERC1155UpgradeableNftEngine(string memory _name, string memory _symbol, string memory _uri, string memory _version) public initializer{
        __Ownable_init();
        __Context_init();
        __ERC165_init_unchained();
        __ERC1155Base_init_unchained(_name, _symbol);
        __ERC1155UpgradeableNftEngineLazy_init(_name, _uri, _version);
    }

    modifier onlyERC1155Creator(uint256 _tokenId) {
        require(creators[_tokenId] == _msgSender(), "must be the creator of the token");
        _;
    }

    modifier onlyERC1155Owner (uint256 _tokenId) {
        require(balanceOf(_msgSender(), _tokenId) > 0, "must be the owner of the token");
        _;
    }

    function __ERC1155URI_init_unchained(string memory _tokenUri) internal initializer{
        __ERC1155_init_unchained(_tokenUri);
    }

    function __ERC1155Base_init_unchained(string memory _name, string memory _symbol) internal initializer{
        name = _name;
        symbol = _symbol;
    }
    
    function _setCreator(address _to, uint256 _tokenId) internal{
        creators[_tokenId] = _to;
    }

    function _setTokenURI(uint256 _tokenId, string memory _tokenUri) internal {
        tokenURI[_tokenId] = _tokenUri;
    }

    function mint(uint256 _tokenId, uint256 _editions, string memory _tokenUri) public returns (bool success){
        bytes memory _data = "0x00";
        address _creator = _msgSender();
        _mint(_creator, _tokenId, _editions, _data);
        _setTokenURI(_tokenId, _tokenUri);
        _setCreator(_creator, _tokenId);
        tokenSupply[_tokenId] = _editions;
        return true;
    }

    function mintBatch(uint256[] memory _tokenIDs, uint256[] memory _editions, string[] memory _tokenUri) public{
        for (uint256 i = 0; i < _tokenIDs.length; i++) {
            uint256 _tokenId = _tokenIDs[i];
            uint256 editions_ = _editions[i];
            string memory tokenUri_ = _tokenUri[i];
            tokenURI[_tokenId] = tokenUri_;
            tokenSupply[_tokenId] = editions_;
        }
        bytes memory _data = "0x00";
        address _creator = _msgSender();
        _mintBatch(_creator, _tokenIDs, _editions, _data);
    }

    function uri(uint256 _tokenId) public view override returns (string memory){
        return tokenURI[_tokenId];
    }

    function updateURI(uint256 _tokenId, string memory _newUri) public onlyERC1155Owner(_tokenId){
        _setTokenURI(_tokenId, _newUri);
    }

    function totalSupply(uint256 _tokenId) public view returns (uint256){
        return tokenSupply[_tokenId];
    }

    function mintAndTransfer(address _to, LibERC1155LazyMint.NFT memory _nft, string memory _tokenUri, address _signer, bytes calldata _signature) external{
        super.mintAndTransferLazy(_to, _nft, _tokenUri, _signer, _signature);
    }

    function burn(uint256 tokenId, uint256 editions) public onlyERC1155Owner(tokenId) returns (bool success){
        address creator = _msgSender();
        _burn(creator, tokenId, editions);
        tokenSupply[tokenId] = tokenSupply[tokenId].sub(editions);
        return true;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable, ERC1155UpgradeableNftEngineLazy) returns (bool){
        return super.supportsInterface(interfaceId);
    }

    uint256[50] private __gap;
}
