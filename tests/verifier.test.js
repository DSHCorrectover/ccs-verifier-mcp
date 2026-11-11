/**
 * CCS Verifier Test Suite
 * Tests for Ed25519 signature verification and receipt validation
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CCSVerifier } from '../src/verifier.js';

test('CCSVerifier - generateTestReceipt creates valid structure', () => {
  const receipt = CCSVerifier.generateTestReceipt();

  assert(receipt.receipt_id, 'should have receipt_id');
  assert(receipt.timestamp, 'should have timestamp');
  assert(receipt.signature, 'should have signature');
  assert(receipt.commitments, 'should have commitments');
  assert(receipt.prompt_hash, 'should have prompt_hash');
  assert(receipt.response_hash, 'should have response_hash');
  assert(receipt.public_key, 'should have public_key');
});

test('CCSVerifier - verify valid test receipt', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  const result = verifier.verify(receipt);

  assert.strictEqual(result.valid, true, 'receipt should be valid');
  assert.strictEqual(result.confidence, 1.0, 'confidence should be 1.0');
  assert(result.receipt_id, 'should have receipt_id');
  assert(result.verification_id, 'should have verification_id');
  assert(Array.isArray(result.checks), 'should have checks array');
  assert.strictEqual(result.checks.length, 5, 'should have 5 checks');
});

test('CCSVerifier - all checks pass for valid receipt', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  const result = verifier.verify(receipt);

  assert(result.checks.includes('structure_validation'), 'should check structure');
  assert(result.checks.includes('signature_verification'), 'should check signature');
  assert(result.checks.includes('timestamp_validation'), 'should check timestamp');
  assert(result.checks.includes('hash_integrity'), 'should check hash');
  assert(result.checks.includes('commitments_validation'), 'should check commitments');
});

test('CCSVerifier - reject receipt with missing fields', () => {
  const verifier = new CCSVerifier();
  const invalidReceipt = {
    receipt_id: 'test-123',
  };

  const result = verifier.verify(invalidReceipt);

  assert.strictEqual(result.valid, false, 'should be invalid');
  assert.strictEqual(result.confidence, 0.0, 'confidence should be 0');
});

test('CCSVerifier - reject receipt with tampered signature', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  receipt.signature = receipt.signature.slice(0, -4) + 'ffff';

  const result = verifier.verify(receipt);

  assert.strictEqual(result.valid, false, 'tampered receipt should be invalid');
  assert.strictEqual(result.confidence, 0.0, 'confidence should be 0');
});

test('CCSVerifier - reject receipt with tampered commitments', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  receipt.commitments = ['tampered-commitment'];

  const result = verifier.verify(receipt);

  assert.strictEqual(result.valid, false, 'tampered receipt should be invalid');
});

test('CCSVerifier - reject receipt with tampered timestamp', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  const past = Date.now() - (2 * 24 * 60 * 60 * 1000);
  receipt.timestamp = past;

  const result = verifier.verify(receipt);

  assert.strictEqual(result.valid, false, 'tampered timestamp should make receipt invalid');
});

test('CCSVerifier - reject receipt with invalid prompt_hash format', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  receipt.prompt_hash = 'invalid-hash-format';

  const result = verifier.verify(receipt);

  // Receipt becomes invalid when hash format is wrong
  assert.strictEqual(result.valid, false, 'invalid hash format should make receipt invalid');
});

test('CCSVerifier - multiple verifications are independent', () => {
  const verifier = new CCSVerifier();
  const receipt1 = CCSVerifier.generateTestReceipt();
  const receipt2 = CCSVerifier.generateTestReceipt();

  const result1 = verifier.verify(receipt1);
  const result2 = verifier.verify(receipt2);

  assert.strictEqual(result1.valid, true, 'receipt1 should be valid');
  assert.strictEqual(result2.valid, true, 'receipt2 should be valid');
  assert.notStrictEqual(result1.verification_id, result2.verification_id, 'verification IDs should differ');
  assert.notStrictEqual(result1.receipt_id, result2.receipt_id, 'receipt IDs should differ');
});

test('CCSVerifier - verification result has correct structure', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  const result = verifier.verify(receipt);

  assert(typeof result.valid === 'boolean', 'valid should be boolean');
  assert(typeof result.confidence === 'number', 'confidence should be number');
  assert(typeof result.receipt_id === 'string', 'receipt_id should be string');
  assert(typeof result.verification_id === 'string', 'verification_id should be string');
  assert(Array.isArray(result.checks), 'checks should be array');
  assert(result.verified_at, 'should have verified_at timestamp');
});

test('CCSVerifier - canonical JSON excludes signature field', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  receipt.signature = 'different-signature';

  const result = verifier.verify(receipt);
  assert.strictEqual(result.valid, false, 'signature should be excluded from canonical JSON');
});

test('CCSVerifier - empty commitments array fails validation', () => {
  const verifier = new CCSVerifier();
  const receipt = CCSVerifier.generateTestReceipt();

  receipt.commitments = [];

  const result = verifier.verify(receipt);

  // Receipt becomes invalid when commitments are empty
  assert.strictEqual(result.valid, false, 'empty commitments should make receipt invalid');
});

test('CCSVerifier - receipt with custom data', () => {
  const verifier = new CCSVerifier();
  const customData = {
    evaluation_id: 'custom-eval-123',
    model_id: 'gpt-4-turbo',
    commitments: ['commitment-1', 'commitment-2']
  };

  const receipt = CCSVerifier.generateTestReceipt(customData);

  assert.strictEqual(receipt.evaluation_id, 'custom-eval-123');
  assert.strictEqual(receipt.model_id, 'gpt-4-turbo');
  assert.strictEqual(receipt.commitments.length, 2);

  const result = verifier.verify(receipt);
  assert.strictEqual(result.valid, true, 'custom receipts should be valid');
});
