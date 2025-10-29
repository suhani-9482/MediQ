// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Smart contract for anchoring medical document hashes on blockchain
 * @notice This contract stores document hashes with IPFS CIDs for immutable proof
 */
contract DocumentRegistry {
    // Owner of the contract
    address public owner;
    
    // Counter for total documents anchored
    uint256 public documentCount;
    
    // Structure to store document information
    struct Document {
        bytes32 documentHash;      // SHA-256 hash of the document
        string ipfsCid;            // IPFS Content Identifier
        address anchoredBy;        // Address that anchored the document
        uint256 timestamp;         // Block timestamp when anchored
        uint256 blockNumber;       // Block number when anchored
        bool exists;               // Flag to check if document exists
    }
    
    // Mapping from document hash to Document struct
    mapping(bytes32 => Document) public documents;
    
    // Mapping from address to their document hashes
    mapping(address => bytes32[]) public userDocuments;
    
    // Events
    event DocumentAnchored(
        bytes32 indexed documentHash,
        string ipfsCid,
        address indexed anchoredBy,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event DocumentVerified(
        bytes32 indexed documentHash,
        address indexed verifiedBy,
        bool isValid
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier documentNotExists(bytes32 _documentHash) {
        require(!documents[_documentHash].exists, "Document already anchored");
        _;
    }
    
    modifier documentExists(bytes32 _documentHash) {
        require(documents[_documentHash].exists, "Document not found");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
        documentCount = 0;
    }
    
    /**
     * @dev Anchor a document hash on the blockchain
     * @param _documentHash The SHA-256 hash of the document
     * @param _ipfsCid The IPFS CID where document is stored
     */
    function anchorDocument(
        bytes32 _documentHash,
        string memory _ipfsCid
    ) 
        external 
        documentNotExists(_documentHash)
    {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(bytes(_ipfsCid).length > 0, "IPFS CID required");
        
        // Create new document record
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            ipfsCid: _ipfsCid,
            anchoredBy: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });
        
        // Add to user's document list
        userDocuments[msg.sender].push(_documentHash);
        
        // Increment counter
        documentCount++;
        
        // Emit event
        emit DocumentAnchored(
            _documentHash,
            _ipfsCid,
            msg.sender,
            block.timestamp,
            block.number
        );
    }
    
    /**
     * @dev Verify if a document hash exists on blockchain
     * @param _documentHash The document hash to verify
     * @return exists Whether the document exists
     * @return documentHash The document hash
     * @return ipfsCid The IPFS CID
     * @return anchoredBy The address that anchored the document
     * @return timestamp The timestamp when anchored
     * @return blockNumber The block number when anchored
     */
    function verifyDocument(bytes32 _documentHash) 
        external 
        view 
        returns (
            bool exists,
            bytes32 documentHash,
            string memory ipfsCid,
            address anchoredBy,
            uint256 timestamp,
            uint256 blockNumber
        )
    {
        Document memory doc = documents[_documentHash];
        return (
            doc.exists,
            doc.documentHash,
            doc.ipfsCid,
            doc.anchoredBy,
            doc.timestamp,
            doc.blockNumber
        );
    }
    
    /**
     * @dev Get document details
     * @param _documentHash The document hash
     */
    function getDocument(bytes32 _documentHash) 
        external 
        view 
        documentExists(_documentHash)
        returns (Document memory) 
    {
        return documents[_documentHash];
    }
    
    /**
     * @dev Get all document hashes for a user
     * @param _user The user address
     * @return An array of document hashes
     */
    function getUserDocuments(address _user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userDocuments[_user];
    }
    
    /**
     * @dev Get the total number of documents anchored by a user
     * @param _user The user address
     * @return The count of documents
     */
    function getUserDocumentCount(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return userDocuments[_user].length;
    }
    
    /**
     * @dev Check if a document hash exists
     * @param _documentHash The document hash to check
     * @return Whether the document exists
     */
    function checkDocumentExists(bytes32 _documentHash) 
        external 
        view 
        returns (bool) 
    {
        return documents[_documentHash].exists;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) 
        external 
        onlyOwner 
    {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    /**
     * @dev Get contract statistics
     * @return totalDocuments The total number of documents anchored
     * @return contractOwner The owner of the contract
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalDocuments,
            address contractOwner
        ) 
    {
        return (documentCount, owner);
    }
}

