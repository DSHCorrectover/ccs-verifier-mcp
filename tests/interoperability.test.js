/**
 * CCS Verifier Interoperability Test Suite
 * 
 * Tests compatibility using standard test vectors that any CCS verifier
 * implementation should pass. This enables cross-implementation testing
 * between Correctover, VibeMirror, AutoGen, and other CCS verifiers.
 * 
 * Usage:
 *   node --test tests/interoperability.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CCSVerifier } from '../src/verifier.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test vectors
const vectorsPath = join(__dirname, 'interoperability-vectors.json');
const vectorsData = JSON.parse(readFileSync(vectorsPath, 'utf-8'));

const verifier = new CCSVerifier();

test('Interoperability - Vector 1: Valid standard receipt', () => {
  const vector = vectorsData.vectors.find(v => v.id === 'vector-001-valid-standard');
  assert(vector, 'Vector 1 should exist');
  
  const result = verifier.verify(vector.receipt);
  
  assert.strictEqual(result.valid, vector.expected.valid, 'Should be valid');
  assert.strictEqual(result.confidence, vector.expected.confidence, 'Confidence should be 1.0');
  assert(result.checks.includes('structure_validation'), 'Should validate structure');
  assert(result.checks.includes('signature_verification'), 'Should verify signature');
});

test('Interoperability - Vector 2: Valid receipt with different key', () => {
  const vector = vectorsData.vectors.find(v => v.id === 'vector-002-valid-different-key');
  assert(vector, 'Vector 2 should exist');
  
  const result = verifier.verify(vector.receipt);
  
  assert.strictEqual(result.valid, vector.expected.valid, 'Should be valid');
  assert.strictEqual(result.confidence, vector.expected.confidence, 'Confidence should be 1.0');
});

test('Interoperability - Vector 3: Valid minimal receipt', () => {
  const vector = vectorsData.vectors.find(v => v.id === 'vector-003-valid-minimal');
  assert(vector, 'Vector 3 should exist');
  
  const result = verifier.verify(vector.receipt);
  
  assert.strictEqual(result.valid, vector.expected.valid, 'Should be valid');
  assert.strictEqual(result.confidence, vector.expected.confidence, 'Confidence should be 1.0');
});

test('Interoperability - Vector 4: Tampered signature should fail', () => {
  const vector = vectorsData.vectors.find(v => v.id === 'vector-004-tampered-signature');
  assert(vector, 'Vector 4 should exist');
  
  const result = verifier.verify(vector.receipt);
  
  assert.strictEqual(result.valid, vector.expected.valid, 'Should be invalid');
  assert.strictEqual(result.confidence, vector.expected.confidence, 'Confidence should be 0.0');
  assert(result.error, 'Should have error message');
});

test('Interoperability - Vector 5: Missing fields should fail', () => {
  const vector = vectorsData.vectors.find(v => v.id === 'vector-005-missing-fields');
  assert(vector, 'Vector 5 should exist');
  
  const result = verifier.verify(vector.receipt);
  
  assert.strictEqual(result.valid, vector.expected.valid, 'Should be invalid');
  assert.strictEqual(result.confidence, vector.expected.confidence, 'Confidence should be 0.0');
  assert(result.error, 'Should have error message');
});

test('Interoperability - All vectors loaded successfully', () => {
  assert(vectorsData.vectors.length >= 5, 'Should have at least 5 test vectors');
  assert(vectorsData.version, 'Should have version');
  assert(vectorsData.specVersion, 'Should have specVersion');
  assert(vectorsData.testInstructions, 'Should have test instructions');
});

test('Interoperability - Vector format compliance', () => {
  for (const vector of vectorsData.vectors) {
    assert(vector.id, `Vector should have id`);
    assert(vector.description, `Vector ${vector.id} should have description`);
    assert(vector.expected, `Vector ${vector.id} should have expected results`);
    assert(vector.receipt, `Vector ${vector.id} should have receipt data`);
    
    // Valid receipts should have required fields
    if (vector.expected.valid) {
      assert(vector.receipt.receipt_id, 'Valid receipt should have receipt_id');
      assert(vector.receipt.signature, 'Valid receipt should have signature');
      assert(vector.receipt.public_key, 'Valid receipt should have public_key');
      assert(Array.isArray(vector.receipt.commitments), 'Valid receipt should have commitments array');
    }
  }
});

test('Interoperability - Cross-implementation compatibility notes', () => {
  // Verify that the test vectors follow CCS spec requirements
  const validVector = vectorsData.vectors.find(v => v.expected.valid);
  const receipt = validVector.receipt;
  
  // Check hash format
  assert(receipt.prompt_hash.startsWith('sha256:'), 'Prompt hash should use sha256: prefix');
  assert(receipt.response_hash.startsWith('sha256:'), 'Response hash should use sha256: prefix');
  assert.strictEqual(receipt.prompt_hash.length, 71, 'SHA-256 hash should be 64 hex chars + "sha256:" prefix');
  
  // Check signature format
  assert.strictEqual(receipt.signature.length, 128, 'Ed25519 signature should be 64 bytes = 128 hex chars');
  assert.strictEqual(receipt.public_key.length, 64, 'Ed25519 public key should be 32 bytes = 64 hex chars');
  
  // Check timestamp format
  assert(typeof receipt.timestamp === 'number', 'Timestamp should be numeric');
  assert(receipt.timestamp > 1000000000000, 'Timestamp should be in milliseconds');
});
