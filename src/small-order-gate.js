// 小阶(8-torsion)公钥拒绝闸 — 零密钥伪造类（identity/(0,-1)/order4/8/全零）
// 实测依据: docs/FINDING-small-order.md (2026-11-11 跨实现矩阵)
const SMALL_ORDER_ENCODINGS = new Set([
  '0100000000000000000000000000000000000000000000000000000000000000',
  'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f',
  '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85',
  '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05',
  'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa',
  'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a',
  '0000000000000000000000000000000000000000000000000000000000000080',
  '0000000000000000000000000000000000000000000000000000000000000000',
]);
export function isSmallOrderKey(publicKeyHex) {
  return SMALL_ORDER_ENCODINGS.has(String(publicKeyHex).toLowerCase());
}
