// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC721Enumerable.sol";
import "./ERC721UpgradeableNftEngineLazy.sol";

contract ERC721UpgradeableNftEngine is Initializable, ContextUpgradeable, OwnableUpgradeable, ERC721URIStorageUpgradeable, ERC721Enumerable, ERC721UpgradeableNftEngineLazy {
    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;

    mapping(uint256 => address) private Creators;

    event TokenURIUpdated(uint256 indexed _tokenId, string _uri);

    function InitializeERC721UpgradeableNftEngine(string memory name, string memory symbol, string memory version) public initializer{
        __Ownable_init();
        __Context_init();
        __ERC721URIStorage_init();
        __ERC721_init(name, symbol);
        __Enumerable_init();
        __ERC721UpgradeableNftEngineLazy_init(name, version);
    }

    modifier onlyERC721Owner(uint256 _tokenId){
        address owner = ownerOf(_tokenId);
        require(owner == _msgSender(), "must be the owner of the token");
        _;
    }

    modifier onlyERC721Creator(uint256 _tokenId){
        address creator = getCreator(_tokenId);
        require(creator == _msgSender(), "must be the creator of the token");
        _;
    }

    function mint(uint256 tokenID, string memory _uri) public{
        require(_msgSender() != address(0), "Owner Address is zero");
        create(tokenID, _uri, _msgSender());
    }

    function mintAndTransfer(address _to, LibERC721LazyMint.NFT memory _nft, string memory _tokenURI, address _signer, bytes calldata _signature) external {
        super.mintAndTransferLazy(_to, _nft, _tokenURI, _signer, _signature);
    }

    function updateMetadata(uint256 _tokenId, string memory _uri) public onlyERC721Owner(_tokenId){
        _setTokenURI(_tokenId, _uri);
        emit TokenURIUpdated(_tokenId, _uri);
    }

    function setCreator(uint256 _tokenId, address _creator) internal{
        Creators[_tokenId] = _creator;
    }

    function getCreator(uint256 _tokenId) public view returns (address){
        return Creators[_tokenId];
    }

    function create(uint256 _id, string memory _uri, address _creator) internal returns (uint256){
        _safeMint(_creator, _id);
        _setTokenURI(_id, _uri);
        setCreator(_id, _creator);

        return _id;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorageUpgradeable, ERC721Upgradeable) returns (string memory){
        return super.tokenURI(tokenId);
    }

    function burn(uint256 _tokenId) public onlyERC721Owner(_tokenId){
        address ownerofToken = ownerOf(_tokenId);
        require(ownerofToken == _msgSender(), "must be the owner of the token");
        _burn(_tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721URIStorageUpgradeable, ERC721Upgradeable){
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable){
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool){
        return super.supportsInterface(interfaceId);
    }

    uint256[50] private __gap;
}
