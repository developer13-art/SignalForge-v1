#!/usr/bin/env node
/**
 * Verify Solana Program Script
 *
 * @module server/scripts/verify-solana-program
 */

import { programConfigService } from '../src/modules/solana/config/program-config.service';
import { connectionService } from '../src/modules/solana/config/connection.service';
import { networkService } from '../src/modules/solana/config/network.service';
import { logger } from '../src/lib/logger';

async function main() {
  const network = networkService.getNetworkInfo();
  logger.info({ network: network.network, rpcUrl: network.rpcUrl }, 'Verifying Solana programs');

  const programs = programConfigService.getPrograms();

  for (const [key, programId] of Object.entries(programs)) {
    if (!programId) {
      logger.warn({ programKey: key }, 'Program ID not configured');
      continue;
    }

    try {
      const connection = await connectionService.getConnection();
      const { PublicKey } = await import('@solana/web3.js');
      const pubkey = new PublicKey(programId);
      const info = await connection.getAccountInfo(pubkey);

      if (info) {
        logger.info({ programKey: key, programId, executable: info.executable }, 'Program found on-chain');
      } else {
        logger.warn({ programKey: key, programId }, 'Program not deployed');
      }
    } catch (err) {
      logger.error({ err, programKey: key, programId }, 'Failed to verify program');
    }
  }

  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'Program verification failed');
  process.exit(1);
});