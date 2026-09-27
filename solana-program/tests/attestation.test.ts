import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { SignalforgeAttestation } from "../target/types/signalforge_attestation";

describe("Attestation Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SignalforgeAttestation as Program<SignalforgeAttestation>;

  const authority = provider.wallet as anchor.Wallet;
  const subject = Keypair.generate();

  const [authorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("attestation_authority")],
    program.programId
  );

  const ATTESTATION_SEED = Buffer.from("attestation");

  function deriveAttestationPda(kind: number): PublicKey {
    const kindSeed = Buffer.from([kind]);
    const [pda] = PublicKey.findProgramAddressSync(
      [ATTESTATION_SEED, subject.publicKey.toBuffer(), kindSeed],
      program.programId
    );
    return pda;
  }

  function payloadHash(fill: number): number[] {
    return Array(32).fill(fill);
  }

  before(async () => {
    await program.methods
      .initializeAuthority("https://signalforge.ai/attestation")
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("initializes the authority", async () => {
    const state = await program.account.attestationAuthority.fetch(authorityPda);
    assert.equal(state.authority.toBase58(), authority.publicKey.toBase58());
    assert.equal(state.metadataUri, "https://signalforge.ai/attestation");
    assert.equal(state.attestationsCreated.toNumber(), 0);
    assert.equal(state.attestationsRevoked.toNumber(), 0);
  });

  it("creates a certification attestation", async () => {
    const kindSeed = { certification: {} };
    const pda = deriveAttestationPda(0);

    await program.methods
      .createAttestation(
        kindSeed,
        payloadHash(1),
        "SF-2841",
        1,
        "https://signalforge.ai/attestations/2841",
        0
      )
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        subject: subject.publicKey,
        attestation: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const attestation = await program.account.attestation.fetch(pda);
    assert.equal(attestation.subject.toBase58(), subject.publicKey.toBase58());
    assert.equal(attestation.subjectReference, "SF-2841");
    assert.deepEqual(attestation.kind, kindSeed);
    assert.equal(attestation.version, 1);
    assert.isFalse(attestation.revoked);

    const state = await program.account.attestationAuthority.fetch(authorityPda);
    assert.equal(state.attestationsCreated.toNumber(), 1);
  });

  it("creates a DNA attestation", async () => {
    const kindSeed = { dna: {} };
    const pda = deriveAttestationPda(1);

    await program.methods
      .createAttestation(
        kindSeed,
        payloadHash(2),
        "SF-2841",
        1,
        "https://signalforge.ai/dna/2841",
        0
      )
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        subject: subject.publicKey,
        attestation: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const attestation = await program.account.attestation.fetch(pda);
    assert.deepEqual(attestation.kind, kindSeed);
    assert.equal(attestation.version, 1);
  });

  it("updates an existing attestation", async () => {
    const pda = deriveAttestationPda(0);

    await program.methods
      .updateAttestation(
        payloadHash(3),
        2,
        "https://signalforge.ai/attestations/2841/v2",
        0
      )
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        subject: subject.publicKey,
        attestation: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const attestation = await program.account.attestation.fetch(pda);
    assert.equal(attestation.version, 2);
    assert.equal(
      attestation.metadataUri,
      "https://signalforge.ai/attestations/2841/v2"
    );
  });

  it("rejects a version decrease on update", async () => {
    const pda = deriveAttestationPda(0);

    let failed = false;
    try {
      await program.methods
        .updateAttestation(payloadHash(4), 1, "https://signalforge.ai/x", 0)
        .accounts({
          authority: authority.publicKey,
          authorityState: authorityPda,
          subject: subject.publicKey,
          attestation: pda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      failed = true;
    }
    assert.isTrue(failed);
  });

  it("revokes an attestation", async () => {
    const pda = deriveAttestationPda(0);

    await program.methods
      .revokeAttestation("Certification superseded")
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        subject: subject.publicKey,
        attestation: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const attestation = await program.account.attestation.fetch(pda);
    assert.isTrue(attestation.revoked);
    assert.equal(attestation.revocationReason, "Certification superseded");

    const state = await program.account.attestationAuthority.fetch(authorityPda);
    assert.equal(state.attestationsRevoked.toNumber(), 1);
  });

  it("rejects revoking an already revoked attestation", async () => {
    const pda = deriveAttestationPda(0);

    let failed = false;
    try {
      await program.methods
        .revokeAttestation("Duplicate revocation")
        .accounts({
          authority: authority.publicKey,
          authorityState: authorityPda,
          subject: subject.publicKey,
          attestation: pda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      failed = true;
    }
    assert.isTrue(failed);
  });
});