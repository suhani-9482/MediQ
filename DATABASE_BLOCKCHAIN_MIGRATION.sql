-- ========================================
-- Blockchain Integration Migration
-- Stage 5: Add blockchain anchoring columns
-- ========================================

-- Add blockchain-related columns to file_metadata table
ALTER TABLE file_metadata
ADD COLUMN IF NOT EXISTS blockchain_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS blockchain_block_number BIGINT,
ADD COLUMN IF NOT EXISTS blockchain_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS blockchain_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS blockchain_network VARCHAR(20) DEFAULT 'sepolia',
ADD COLUMN IF NOT EXISTS blockchain_gas_used VARCHAR(20),
ADD COLUMN IF NOT EXISTS blockchain_contract_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS blockchain_anchored_by VARCHAR(42);

-- Create indexes for faster blockchain queries
CREATE INDEX IF NOT EXISTS idx_file_metadata_blockchain_status 
ON file_metadata(blockchain_status);

CREATE INDEX IF NOT EXISTS idx_file_metadata_blockchain_hash 
ON file_metadata(blockchain_hash);

CREATE INDEX IF NOT EXISTS idx_file_metadata_blockchain_tx 
ON file_metadata(blockchain_tx_hash);

-- Add comments for documentation
COMMENT ON COLUMN file_metadata.blockchain_hash IS 
'SHA-256 hash of the file content (0x prefixed)';

COMMENT ON COLUMN file_metadata.blockchain_tx_hash IS 
'Ethereum transaction hash for the anchoring transaction';

COMMENT ON COLUMN file_metadata.blockchain_block_number IS 
'Block number where the transaction was mined';

COMMENT ON COLUMN file_metadata.blockchain_timestamp IS 
'Timestamp when the document was anchored on blockchain';

COMMENT ON COLUMN file_metadata.blockchain_status IS 
'Blockchain anchoring status: none, pending, anchored, failed';

COMMENT ON COLUMN file_metadata.blockchain_network IS 
'Blockchain network used: sepolia, mainnet';

COMMENT ON COLUMN file_metadata.blockchain_gas_used IS 
'Gas amount used for the transaction';

COMMENT ON COLUMN file_metadata.blockchain_contract_address IS 
'Smart contract address where document is anchored';

COMMENT ON COLUMN file_metadata.blockchain_anchored_by IS 
'Ethereum address that anchored the document';

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'file_metadata' 
-- AND column_name LIKE 'blockchain%';
