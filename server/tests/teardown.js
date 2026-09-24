/**
 * Test Teardown
 *
 * @module server/tests/teardown
 */

export default async function globalTeardown() {
  try {
    const connectionModule = await import('../src/database/connection');
    if (connectionModule.closePool) {
      await connectionModule.closePool();
    }
  } catch (err) {
    // ignore
  }
}