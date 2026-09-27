import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { SignalforgeProvenance } from "../target/types/signalforge_provenance";

describe("Provenance Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SignalforgeProvenance as Program<SignalforgeProvenance>;

  const authority = provider.wallet as anchor.Wallet;

  const [authorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("provenance_authority")],
    program.programId
  );

  const PROVENANCE_SEED = Buffer.from("provenance");

  function deriveProvenancePda(signalRef: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [PROVENANCE_SEED, Buffer.from(signalRef)],
      program.programId
    );
    return pda;
  }

  function hashOf(fill: number): number[] {
    return Array(32).fill(fill);
  }

  before(async () => {
    await program.methods
      .initializeAuthority("https://signalforge.ai/provenance")
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("initializes the authority", async () => {
    const state = await program.account.provenanceAuthority.fetch(authorityPda);
    assert.equal(state.authority.toBase58(), authority.publicKey.toBase58());
    assert.equal(state.recordsAnchored.toNumber(), 0);
  });

  it("anchors a provenance record", async () => {
    const signalRef = "SF-sig-9a8f4c2e";
    const pda = deriveProvenancePda(signalRef);

    await program.methods
      .anchorProvenance(
        signalRef,
        hashOf(11),
        "gpt-4o",
        "parser-v3",
        "https://signalforge.ai/signals/9a8f4c2e"
      )
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        provenance: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const record = await program.account.provenanceRecord.fetch(pda);
    assert.equal(record.signalReference, signalRef);
    assert.deepEqual(record.processingHash, hashOf(11));
    assert.equal(record.aiVersion, "gpt-4o");
    assert.equal(record.processingVersion, "parser-v3");
    assert.isFalse(record.revoked);

    const state = await program.account.provenanceAuthority.fetch(authorityPda);
    assert.equal(state.recordsAnchored.toNumber(), 1);
  });

  it("verifies a matching hash", async () => {
    const signalRef = "SF-sig-9a8f4c2e";
    const pda = deriveProvenancePda(signalRef);

    const result = await program.methods
      .verifyProvenance(hashOf(11))
      .accounts({
        verifier: authority.publicKey,
        provenance: pda,
      })
      .view();

    assert.isTrue(result);
  });

  it("rejects a non-matching hash", async () => {
    const signalRef = "SF-sig-9a8f4c2e";
    const pda = deriveProvenancePda(signalRef);

    const result = await program.methods
      .verifyProvenance(hashOf(99))
      .accounts({
        verifier: authority.publicKey,
        provenance: pda,
      })
      .view();

    assert.isFalse(result);
  });

  it("anchors multiple provenance records", async () => {
    const signalRef = "SF-sig-1b2c3d4e";
    const pda = deriveProvenancePda(signalRef);

    await program.methods
      .anchorProvenance(
        signalRef,
        hashOf(12),
        "claude-3-5-sonnet",
        "parser-v3",
        "https://signalforge.ai/signals/1b2c3d4e"
      )
      .accounts({
        authority: authority.publicKey,
        authorityState: authorityPda,
        provenance: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.provenanceAuthority.fetch(authorityPda);
    assert.equal(state.recordsAnchored.toNumber(), 2);
  });
});