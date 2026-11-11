/**
 * CCS Receipt Verifier - Core Implementation
 * 
 * Verifies CCS (Cryptographic Commitment Scheme) receipts using Ed25519 signatures.
 * This is the reference implementation for the CCS standard (draft-correctover-ccs-11).
 * 
 * License: CC0 1.0 Universal (public domain)
 * 
 * Verification is FREE and UNLIMITED by design - this is the trust anchor for the CCS ecosystem.
 */

import nacl from 'tweetnacl';
import { isSmallOrderKey } from './small-order-gate.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * CCS Receipt structure (per draft-correctover-ccs-11)
 * 
 * @typedef {Object} CCSReceipt
 * @property {string} receipt_id - Unique receipt identifier (UUID)
 * @property {string} evaluation_id - Evaluation session identifier
 * @property {number} timestamp - Unix timestamp (milliseconds)
 * @property {string} model_id - Model identifier
 * @property {string} prompt_hash - SHA-256 hash of prompt
 * @property {string} response_hash - SHA-256 hash of response
 * @property {string[]} commitments - Array of commitment strings
 * @property {string} signature - Ed25519 signature (hex-encoded)
 * @property {string} public_key - Ed25519 public key (hex-encoded)
 */

/**
 * Verification result
 * 
 * @typedef {Object} VerificationResult
 * @property {boolean} valid - Whether the receipt is cryptographically valid
 * @property {number} confidence - Confidence score (0.0-1.0)
 * @property {string} receipt_id - Receipt ID that was verified
 * @property {string} verification_id - Unique verification session ID
 * @property {number} verified_at - Verification timestamp
 * @property {string[]} checks - List of checks performed
 * @property {Object} details - Detailed verification results
 */

export class CCSVerifier {
  constructor() {
    this.version = '1.0.0';
    this.specVersion = 'draft-correctover-ccs-11';
  }

  /**
   * Verify a CCS receipt
   * 
   * @param {CCSReceipt} receipt - The receipt to verify
   * @returns {VerificationResult} Verification result
   */
  verify(receipt) {
    const verificationId = uuidv4();
    const verifiedAt = Date.now();
    const checks = [];
    const details = {};

    // Check 1: Receipt structure validation
    const structureValid = this.validateStructure(receipt);
    checks.push('structure_validation');
    details.structure = { valid: structureValid };

    if (!structureValid) {
      return {
        valid: false,
        confidence: 0.0,
        receipt_id: receipt?.receipt_id || 'unknown',
        verification_id: verificationId,
        verified_at: verifiedAt,
        checks,
        details,
        error: 'Invalid receipt structure'
      };
    }

    // Check 2: Signature verification
    const signatureValid = this.verifySignature(receipt);
    checks.push('signature_verification');
    details.signature = { 
      valid: signatureValid,
      algorithm: 'Ed25519',
      public_key: receipt.public_key.substring(0, 16) + '...'
    };

    if (!signatureValid) {
      return {
        valid: false,
        confidence: 0.0,
        receipt_id: receipt.receipt_id,
        verification_id: verificationId,
        verified_at: verifiedAt,
        checks,
        details,
        error: 'Invalid signature'
      };
    }

    // Check 3: Timestamp validation
    const timestampValid = this.validateTimestamp(receipt);
    checks.push('timestamp_validation');
    details.timestamp = { 
      valid: timestampValid,
      receipt_time: new Date(receipt.timestamp).toISOString(),
      verification_time: new Date(verifiedAt).toISOString()
    };

    // Check 4: Hash integrity
    const hashesPresent = this.validateHashes(receipt);
    checks.push('hash_integrity');
    details.hashes = {
      valid: hashesPresent,
      prompt_hash: receipt.prompt_hash.substring(0, 16) + '...',
      response_hash: receipt.response_hash.substring(0, 16) + '...'
    };

    // Check 5: Commitments validation
    const commitmentsValid = this.validateCommitments(receipt);
    checks.push('commitments_validation');
    details.commitments = {
      valid: commitmentsValid,
      count: receipt.commitments.length
    };

    // Calculate confidence
    const allChecksPassed = structureValid && signatureValid && timestampValid && 
                            hashesPresent && commitmentsValid;
    const confidence = allChecksPassed ? 1.0 : 0.5;

    return {
      valid: allChecksPassed,
      confidence,
      receipt_id: receipt.receipt_id,
      verification_id: verificationId,
      verified_at: verifiedAt,
      checks,
      details
    };
  }

  /**
   * Validate receipt structure
   * @private
   */
  validateStructure(receipt) {
    const requiredFields = [
      'receipt_id', 'evaluation_id', 'timestamp', 'model_id',
      'prompt_hash', 'response_hash', 'commitments', 'signature', 'public_key'
    ];

    for (const field of requiredFields) {
      if (!(field in receipt)) {
        return false;
      }
    }

    // Type checks
    if (typeof receipt.receipt_id !== 'string') return false;
    if (typeof receipt.timestamp !== 'number') return false;
    if (!Array.isArray(receipt.commitments)) return false;
    if (typeof receipt.signature !== 'string') return false;
    if (typeof receipt.public_key !== 'string') return false;

    return true;
  }

  /**
   * Verify Ed25519 signature
   * @private
   */
  verifySignature(receipt) {
    try {
      // Reconstruct the signed message (canonical JSON of receipt without signature)
      const message = this.canonicalize(receipt, ['signature']);
      
      // Decode signature and public key from hex
      const signatureBytes = this.hexToBytes(receipt.signature);
      const publicKeyBytes = this.hexToBytes(receipt.public_key);
      const messageBytes = new TextEncoder().encode(message);

      // Fail-closed gate: reject small-order (8-torsion) public keys BEFORE
      // any signature math. This class accepts zero-scalar forgeries on
      // several mainstream libraries (tweetnacl included) — measured
      // 2026-11-11, see docs/FINDING-small-order.md.
      if (isSmallOrderKey(receipt.public_key)) {
        console.error('Small-order public key rejected (zero-scalar forgery class)');
        return false;
      }
      // Verify using tweetnacl
      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Validate timestamp (receipt not too old)
   * @private
   */
  validateTimestamp(receipt) {
    const now = Date.now();
    const receiptTime = receipt.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return (now - receiptTime) < maxAge;
  }

  /**
   * Validate hash format
   * @private
   */
  validateHashes(receipt) {
    const hashPattern = /^sha256:[a-f0-9]{64}$/i;
    return hashPattern.test(receipt.prompt_hash) && 
           hashPattern.test(receipt.response_hash);
  }

  /**
   * Validate commitments
   * @private
   */
  validateCommitments(receipt) {
    if (receipt.commitments.length === 0) return false;
    return receipt.commitments.every(c => typeof c === 'string' && c.length > 0);
  }

  /**
   * Canonicalize object for signing (deterministic JSON)
   * @private
   */
  canonicalize(obj, excludeFields = []) {
    const filtered = {};
    for (const key of Object.keys(obj).sort()) {
      if (!excludeFields.includes(key)) {
        filtered[key] = obj[key];
      }
    }
    return JSON.stringify(filtered);
  }

  /**
   * Convert hex string to bytes
   * @private
   */
  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Generate a test receipt (for development/testing)
   * 
   * @param {Object} data - Receipt data (optional)
   * @param {string} privateKeyHex - Ed25519 private key (hex, optional - will generate if not provided)
   * @returns {CCSReceipt} Signed receipt
   */
  static generateTestReceipt(data = {}, privateKeyHex = null) {
    // Generate a test key pair if not provided
    let keyPair;
    if (!privateKeyHex) {
      keyPair = nacl.sign.keyPair();
      privateKeyHex = CCSVerifier.prototype.bytesToHex(keyPair.secretKey);
    } else {
      const privateKeyBytes = CCSVerifier.prototype.hexToBytes(privateKeyHex);
      keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);
    }

    const receipt = {
      receipt_id: uuidv4(),
      evaluation_id: data.evaluation_id || uuidv4(),
      timestamp: Date.now(),
      model_id: data.model_id || 'test-model',
      prompt_hash: data.prompt_hash || 'sha256:' + '0'.repeat(64),
      response_hash: data.response_hash || 'sha256:' + '0'.repeat(64),
      commitments: data.commitments || ['test-commitment'],
      signature: '',
      public_key: CCSVerifier.prototype.bytesToHex(keyPair.publicKey)
    };

    // Sign the receipt
    const message = new TextEncoder().encode(
      CCSVerifier.prototype.canonicalize(receipt, ['signature'])
    );
    const signature = nacl.sign.detached(message, keyPair.secretKey);
    receipt.signature = CCSVerifier.prototype.bytesToHex(signature);

    return receipt;
  }

  /**
   * Convert bytes to hex string
   * @private
   */
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export default CCSVerifier;
