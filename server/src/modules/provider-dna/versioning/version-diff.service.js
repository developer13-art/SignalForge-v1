/**
 * DNA Version Diff Service
 *
 * @module signalforge/server/modules/provider-dna/versioning/diff
 */
class VersionDiffService {
  diff(snapshotA, snapshotB) {
    const a = snapshotA || {};
    const b = snapshotB || {};

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const changes = {};

    for (const key of keys) {
      const valueA = a[key];
      const valueB = b[key];
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        changes[key] = {
          from: valueA ?? null,
          to: valueB ?? null,
        };
      }
    }

    return {
      changes,
      changeCount: Object.keys(changes).length,
    };
  }
}
module.exports = VersionDiffService;
module.exports.VersionDiffService = VersionDiffService;
