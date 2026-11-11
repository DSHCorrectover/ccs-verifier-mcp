# CCS Verifier Interoperability Testing Protocol

This document defines the interoperability testing protocol for CCS (Cryptographic Commitment Scheme) verifier implementations.

## Purpose

Enable cross-implementation compatibility testing between:
- **Correctover** (reference implementation)
- **VibeMirror** and other third-party verifiers
- **AutoGen** and agent framework integrations
- Any CCS-compliant verifier

## Test Vectors

The file `tests/interoperability-vectors.json` contains 5 standard test vectors:

### Vector 1: Valid Standard Receipt
- **ID**: `vector-001-valid-standard`
- **Description**: Valid CCS receipt with 3 commitments
- **Expected**: `valid: true, confidence: 1.0`
- **Use Case**: Baseline compatibility test

### Vector 2: Valid Receipt with Different Key
- **ID**: `vector-002-valid-different-key`
- **Description**: Valid receipt signed with different Ed25519 key
- **Expected**: `valid: true, confidence: 1.0`
- **Use Case**: Multi-key support verification

### Vector 3: Valid Minimal Receipt
- **ID**: `vector-003-valid-minimal`
- **Description**: Valid receipt with single commitment
- **Expected**: `valid: true, confidence: 1.0`
- **Use Case**: Edge case - minimal valid input

### Vector 4: Tampered Signature
- **ID**: `vector-004-tampered-signature`
- **Description**: Receipt with corrupted signature (last 4 hex chars changed)
- **Expected**: `valid: false, confidence: 0.0, error: "Invalid signature"`
- **Use Case**: Signature validation robustness

### Vector 5: Missing Fields
- **ID**: `vector-005-missing-fields`
- **Description**: Receipt missing required fields
- **Expected**: `valid: false, confidence: 0.0, error: "Invalid receipt structure"`
- **Use Case**: Structure validation

## How to Test Your Implementation

### Step 1: Load Test Vectors

```javascript
import { readFileSync } from 'fs';

const vectorsData = JSON.parse(
  readFileSync('interoperability-vectors.json', 'utf-8')
);
```

### Step 2: Run Verification

```javascript
for (const vector of vectorsData.vectors) {
  const result = yourVerifier.verify(vector.receipt);
  
  console.log(`Vector ${vector.id}:`);
  console.log(`  Expected: valid=${vector.expected.valid}`);
  console.log(`  Got:      valid=${result.valid}`);
  console.log(`  Match:    ${result.valid === vector.expected.valid}`);
}
```

### Step 3: Validate Results

For each vector, check:
- `result.valid` matches `vector.expected.valid`
- `result.confidence` matches `vector.expected.confidence`
- For invalid vectors, `result.error` is present

## Running the Test Suite

```bash
# Run interoperability tests
node --test tests/interoperability.test.js

# Run all tests
npm test
```

## CCS Specification Compliance

All test vectors follow **draft-correctover-ccs-11**:

### Receipt Structure
```json
{
  "receipt_id": "uuid-string",
  "evaluation_id": "uuid-string",
  "timestamp": 1731312000000,
  "model_id": "model-identifier",
  "prompt_hash": "sha256:64-hex-chars",
  "response_hash": "sha256:64-hex-chars",
  "commitments": ["commitment-string"],
  "signature": "128-hex-chars-ed25519",
  "public_key": "64-hex-chars-ed25519"
}
```

### Verification Requirements
1. **Structure Validation**: All required fields present with correct types
2. **Signature Verification**: Ed25519 detached signature over canonical JSON (excluding `signature` field)
3. **Timestamp Validation**: Receipt not older than 24 hours
4. **Hash Integrity**: `prompt_hash` and `response_hash` match `sha256:[64-hex-chars]` format
5. **Commitments Validation**: Non-empty array of non-empty strings

### Canonical JSON Format
```javascript
function canonicalize(receipt) {
  const filtered = {};
  for (const key of Object.keys(receipt).sort()) {
    if (key !== 'signature') {
      filtered[key] = receipt[key];
    }
  }
  return JSON.stringify(filtered);
}
```

## Integration with VibeMirror

VibeMirror-coder proposed interoperability testing on 2026-11-11. To integrate:

1. **Import Test Vectors**: Copy `interoperability-vectors.json` to your project
2. **Implement Verification**: Ensure your verifier passes all 5 vectors
3. **Report Results**: Share test results for compatibility certification
4. **Continuous Testing**: Add vectors to your CI/CD pipeline

## Integration with AutoGen

For AutoGen agent framework:

```python
# Python example (AutoGen integration)
import json
from your_ccs_verifier import CCSVerifier

verifier = CCSVerifier()

with open('interoperability-vectors.json') as f:
    vectors = json.load(f)

for vector in vectors['vectors']:
    result = verifier.verify(vector['receipt'])
    assert result['valid'] == vector['expected']['valid']
    print(f"✓ {vector['id']} passed")
```

## Cryptographic Receipt Verification

The CCS standard uses **Ed25519 signatures** for cryptographic receipts:

- **Algorithm**: Ed25519 (RFC 8032)
- **Key Size**: 32 bytes (64 hex chars)
- **Signature Size**: 64 bytes (128 hex chars)
- **Hash Algorithm**: SHA-256
- **Canonical JSON**: Deterministic, sorted keys, excludes signature

This provides:
- **Non-repudiation**: Receipt cannot be denied by signer
- **Integrity**: Any tampering invalidates signature
- **Authenticity**: Public key verifies signer identity

## Test Vector Generation

Test vectors are generated using the reference implementation:

```javascript
import { CCSVerifier } from './src/verifier.js';
import nacl from 'tweetnacl';

// Generate valid receipt
const keyPair = nacl.sign.keyPair();
const privateKeyHex = bytesToHex(keyPair.secretKey);

const receipt = CCSVerifier.generateTestReceipt({
  evaluation_id: 'interop-eval-001',
  model_id: 'gpt-4-turbo-2026-01',
  commitments: ['commitment:latency:p95<200ms']
}, privateKeyHex);

// Generate tampered receipt
const tampered = {...receipt};
tampered.signature = tampered.signature.slice(0, -4) + 'ffff';
```

## Compatibility Matrix

| Implementation | Vector 1 | Vector 2 | Vector 3 | Vector 4 | Vector 5 | Status |
|----------------|----------|----------|----------|----------|----------|--------|
| Correctover    | ✓        | ✓        | ✓        | ✓        | ✓        | **PASS** |
| VibeMirror     | ?        | ?        | ?        | ?        | ?        | Pending |
| AutoGen        | ?        | ?        | ?        | ?        | ?        | Pending |

## Submitting Compatibility Results

To certify your implementation:

1. Run all 5 test vectors
2. Document results (pass/fail for each)
3. Submit PR to `DSHCorrectover/ccs-verifier-mcp` with:
   - Your implementation language/framework
   - Test results screenshot or log
   - Any deviations from spec

## License

Test vectors and interoperability protocol: **CC0-1.0** (public domain)

You are free to use, modify, and distribute these test vectors without restriction.

## References

- **CCS Specification**: draft-correctover-ccs-11
- **Ed25519**: RFC 8032
- **MCP Protocol**: https://modelcontextprotocol.io
- **Reference Implementation**: https://github.com/DSHCorrectover/ccs-verifier-mcp

---

**Last Updated**: 2026-11-11  
**Version**: 1.0.0  
**Maintainer**: Correctover Team
