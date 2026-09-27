import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { SignalforgeAttestation } from "../target/types/signalforge_attestation";

export type AttestationKind = "certification" | "dna" | "reputation" | "other";

export interface AttestationRecord {
  publicKey: PublicKey;
  subject: PublicKey;
  subjectReference: string;
  kind: AttestationKind;
  payloadHash: number[];
  version: number;
  metadataUri: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  revoked: boolean;
  revocationReason: string;
  revokedAt: number;
  authority: PublicKey;
}

export interface CreateAttestationParams {
  subject: PublicKey;
  kind: AttestationKind;
  payloadHash: number[];
  subjectReference: string;
  version: number;
  metadataUri: string;
  expiresAt: number;
}

const AUTHORITY_SEED = Buffer.from("attestation_authority");
const ATTESTATION_SEED = Buffer.from("attestation");

function kindIndex(kind: AttestationKind): number {
  switch (kind) {
    case "certification":
      return 0;
    case "dna":
      return 1;
    case "reputation":
      return 2;
    case "other":
    default:
      return 3;
  }
}

function kindToProgramValue(kind: AttestationKind): object {
  return { [kind]: {} };
}

function mapAttestationKind(raw: any): AttestationKind {
  if (raw.certification !== undefined) return "certification";
  if (raw.dna !== undefined) return "dna";
  if (raw.reputation !== undefined) return "reputation";
  return "other";
}

export class AttestationClient {
  private readonly program: Program<SignalforgeAttestation>;
  private readonly provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet, programId: PublicKey) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program<SignalforgeAttestation>(
      require("../target/idl/signalforge_attestation.json"),
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

  getAttestationPda(subject: PublicKey, kind: AttestationKind): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [ATTESTATION_SEED, subject.toBuffer(), Buffer.from([kindIndex(kind)])],
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

  async createAttestation(params: CreateAttestationParams): Promise<string> {
    const authorityPda = this.getAuthorityPda();
    const attestationPda = this.getAttestationPda(params.subject, params.kind);

    return this.program.methods
      .createAttestation(
        kindToProgramValue(params.kind) as any,
        params.payloadHash,
        params.subjectReference,
        params.version,
        params.metadataUri,
        new anchor.BN(params.expiresAt)
      )
      .accounts({
        authority: this.provider.wallet.publicKey,
        authorityState: authorityPda,
        subject: params.subject,
        attestation: attestationPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async updateAttestation(
    subject: PublicKey,
    kind: AttestationKind,
    payloadHash: number[],
    version: number,
    metadataUri: string,
    expiresAt: number
  ): Promise<string> {
    const authorityPda = this.getAuthorityPda();
    const attestationPda = this.getAttestationPda(subject, kind);

    return this.program.methods
      .updateAttestation(
        payloadHash,
        version,
        metadataUri,
        new anchor.BN(expiresAt)
      )
      .accounts({
        authority: this.provider.wallet.publicKey,
        authorityState: authorityPda,
        subject,
        attestation: attestationPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async revokeAttestation(
    subject: PublicKey,
    kind: AttestationKind,
    reason: string
  ): Promise<string> {
    const authorityPda = this.getAuthorityPda();
    const attestationPda = this.getAttestationPda(subject, kind);

    return this.program.methods
      .revokeAttestation(reason)
      .accounts({
        authority: this.provider.wallet.publicKey,
        authorityState: authorityPda,
        subject,
        attestation: attestationPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async fetchAttestation(
    subject: PublicKey,
    kind: AttestationKind
  ): Promise<AttestationRecord | null> {
    const attestationPda = this.getAttestationPda(subject, kind);
    const raw = await this.program.account.attestation.fetchNullable(attestationPda);
    if (!raw) {
      return null;
    }
    return this.mapAttestation(attestationPda, raw);
  }

  async fetchAllAttestationsForSubject(
    subject: PublicKey
  ): Promise<AttestationRecord[]> {
    const kinds: AttestationKind[] = ["certification", "dna", "reputation", "other"];
    const results = await Promise.all(
      kinds.map((kind) => this.fetchAttestation(subject, kind))
    );
    return results.filter((item): item is AttestationRecord => item !== null);
  }

  private mapAttestation(publicKey: PublicKey, raw: any): AttestationRecord {
    return {
      publicKey,
      subject: raw.subject,
      subjectReference: raw.subjectReference,
      kind: mapAttestationKind(raw.kind),
      payloadHash: raw.payloadHash,
      version: raw.version,
      metadataUri: raw.metadataUri,
      createdAt: raw.createdAt.toNumber(),
      updatedAt: raw.updatedAt.toNumber(),
      expiresAt: raw.expiresAt.toNumber(),
      revoked: raw.revoked,
      revocationReason: raw.revocationReason,
      revokedAt: raw.revokedAt.toNumber(),
      authority: raw.authority,
    };
  }
}

export function createAttestationClient(
  connection: Connection,
  wallet: Wallet,
  programId: string
): AttestationClient {
  return new AttestationClient(connection, wallet, new PublicKey(programId));
}