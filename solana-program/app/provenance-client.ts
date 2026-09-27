import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { SignalforgeProvenance } from "../target/types/signalforge_provenance";

export interface ProvenanceRecord {
  publicKey: PublicKey;
  signalReference: string;
  processingHash: number[];
  aiVersion: string;
  processingVersion: string;
  metadataUri: string;
  authority: PublicKey;
  anchoredSlot: number;
  anchoredAt: number;
  revoked: boolean;
  revocationReason: string;
  revokedAt: number;
}

export interface AnchorProvenanceParams {
  signalReference: string;
  processingHash: number[];
  aiVersion: string;
  processingVersion: string;
  metadataUri: string;
}

const AUTHORITY_SEED = Buffer.from("provenance_authority");
const PROVENANCE_SEED = Buffer.from("provenance");

export class ProvenanceClient {
  private readonly program: Program<SignalforgeProvenance>;
  private readonly provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet, programId: PublicKey) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program<SignalforgeProvenance>(
      require("../target/idl/signalforge_provenance.json"),
      programId,
      this.provider
    );
  }

  getAuthorityPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [AUTHORITY_SEED],
      this.program.programId
    );
    return pda;
  }

  getProvenancePda(signalReference: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [PROVENANCE_SEED, Buffer.from(signalReference)],
      this.program.programId
    );
    return pda;
  }

  async initializeAuthority(metadataUri: string): Promise<string> {
    const authorityPda = this.getAuthorityPda();
    return this.program.methods
      .initializeAuthority(metadataUri)
      .accounts({
        authority: this.provider.wallet.publicKey,
        authorityState: authorityPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async anchorProvenance(params: AnchorProvenanceParams): Promise<string> {
    const authorityPda = this.getAuthorityPda();
    const provenancePda = this.getProvenancePda(params.signalReference);

    return this.program.methods
      .anchorProvenance(
        params.signalReference,
        params.processingHash,
        params.aiVersion,
        params.processingVersion,
        params.metadataUri
      )
      .accounts({
        authority: this.provider.wallet.publicKey,
        authorityState: authorityPda,
        provenance: provenancePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async verifyProvenance(
    signalReference: string,
    expectedHash: number[]
  ): Promise<boolean> {
    const provenancePda = this.getProvenancePda(signalReference);

    return this.program.methods
      .verifyProvenance(expectedHash)
      .accounts({
        verifier: this.provider.wallet.publicKey,
        provenance: provenancePda,
      })
      .view();
  }

  async fetchProvenance(
    signalReference: string
  ): Promise<ProvenanceRecord | null> {
    const provenancePda = this.getProvenancePda(signalReference);
    const raw = await this.program.account.provenanceRecord.fetchNullable(
      provenancePda
    );
    if (!raw) {
      return null;
    }
    return this.mapProvenance(provenancePda, raw);
  }

  private mapProvenance(publicKey: PublicKey, raw: any): ProvenanceRecord {
    return {
      publicKey,
      signalReference: raw.signalReference,
      processingHash: raw.processingHash,
      aiVersion: raw.aiVersion,
      processingVersion: raw.processingVersion,
      metadataUri: raw.metadataUri,
      authority: raw.authority,
      anchoredSlot: raw.anchoredSlot.toNumber(),
      anchoredAt: raw.anchoredAt.toNumber(),
      revoked: raw.revoked,
      revocationReason: raw.revocationReason,
      revokedAt: raw.revokedAt.toNumber(),
    };
  }
}

export function createProvenanceClient(
  connection: Connection,
  wallet: Wallet,
  programId: string
): ProvenanceClient {
  return new ProvenanceClient(connection, wallet, new PublicKey(programId));
}