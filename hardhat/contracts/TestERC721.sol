// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestERC721
 * @dev Simple ERC721 contract for testing auction functionality
 */
contract TestERC721 is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("TestNFT", "TNFT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a new token
     * @param to Address to mint to
     * @param uri Token metadata URI
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Mint multiple tokens to the same address
     * @param to Address to mint to
     * @param uris Array of token metadata URIs
     */
    function safeMintBatch(address to, string[] memory uris) public onlyOwner {
        for (uint256 i = 0; i < uris.length; i++) {
            safeMint(to, uris[i]);
        }
    }

    /**
     * @dev Get the next token ID
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}