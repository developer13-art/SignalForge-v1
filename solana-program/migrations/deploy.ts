import * as anchor from "@coral-xyz/anchor";

/**
 * Deploy-time migration for SignalForge Solana programs.
 *
 * Initializes the on-chain authority and treasury accounts after the programs
 * are deployed. Idempotent — safe to run multiple times.
 */
module.exports = async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);

  console.info("SignalForge Solana deployment migration started.");

  const wallet = provider.wallet as anchor.Wallet;
  console.info(`Deployer wallet: ${wallet.publicKey.toBase58()}`);

  const network = provider.connection.rpcEndpoint;
  console.info(`RPC endpoint: ${network}`);

  const attestationProgram = anchor.workspace
    .SignalforgeAttestation as anchor.Program;
  const provenanceProgram = anchor.workspace
    .SignalforgeProvenance as anchor.Program;
  const paymentProgram = anchor.workspace.SignalforgePayment as anchor.Program;

  if (attestationProgram) {
    const [authorityPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("attestation_authority")],
      attestationProgram.programId
    );

    try {
      const existing = await attestationProgram.account.attestationAuthority.fetchNullable(
        authorityPda
      );
      if (!existing) {
        await attestationProgram.methods
          .initializeAuthority("https://signalforge.ai/attestation")
          .accounts({
            authority: wallet.publicKey,
            authorityState: authorityPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.info("Attestation authority initialized.");
      } else {
        console.info("Attestation authority already initialized.");
      }
    } catch (error) {
      console.error("Failed to initialize attestation authority:", error);
    }
  }

  if (provenanceProgram) {
    const [authorityPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("provenance_authority")],
      provenanceProgram.programId
    );

    try {
      const existing = await provenanceProgram.account.provenanceAuthority.fetchNullable(
        authorityPda
      );
      if (!existing) {
        await provenanceProgram.methods
          .initializeAuthority("https://signalforge.ai/provenance")
          .accounts({
            authority: wallet.publicKey,
            authorityState: authorityPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.info("Provenance authority initialized.");
      } else {
        console.info("Provenance authority already initialized.");
      }
    } catch (error) {
      console.error("Failed to initialize provenance authority:", error);
    }
  }

  if (paymentProgram) {
    const [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("payment_treasury")],
      paymentProgram.programId
    );

    try {
      const existing = await paymentProgram.account.treasury.fetchNullable(treasuryPda);
      if (!existing) {
        await paymentProgram.methods
          .initializeTreasury("https://signalforge.ai/treasury")
          .accounts({
            authority: wallet.publicKey,
            treasury: treasuryPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        console.info("Payment treasury initialized.");
      } else {
        console.info("Payment treasury already initialized.");
      }
    } catch (error) {
      console.error("Failed to initialize payment treasury:", error);
    }
  }

  console.info("SignalForge Solana deployment migration complete.");
};