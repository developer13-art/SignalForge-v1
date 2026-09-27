import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { SignalforgePayment } from "../target/types/signalforge_payment";

export type PaymentStatus = "pending" | "confirmed" | "refunded";

export interface PaymentRecord {
  publicKey: PublicKey;
  paymentReference: string;
  subscriptionReference: string;
  payer: PublicKey;
  amount: number;
  tokenMint: PublicKey;
  status: PaymentStatus;
  txSignature: string;
  authority: PublicKey;
  createdAt: number;
  confirmedAt: number;
  refundedAt: number;
  refundReason: string;
}

export interface CreatePaymentParams {
  paymentReference: string;
  subscriptionReference: string;
  amount: number;
  tokenMint?: PublicKey;
}

const TREASURY_SEED = Buffer.from("payment_treasury");
const PAYMENT_SEED = Buffer.from("payment");

function mapStatus(raw: any): PaymentStatus {
  if (raw.confirmed !== undefined) return "confirmed";
  if (raw.refunded !== undefined) return "refunded";
  return "pending";
}

export class PaymentClient {
  private readonly program: Program<SignalforgePayment>;
  private readonly provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet, programId: PublicKey) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program<SignalforgePayment>(
      require("../target/idl/signalforge_payment.json"),
      programId,
      this.provider
    );
  }

  getTreasuryPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [TREASURY_SEED],
      this.program.programId
    );
    return pda;
  }

  getPaymentPda(paymentReference: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [PAYMENT_SEED, Buffer.from(paymentReference)],
      this.program.programId
    );
    return pda;
  }

  async initializeTreasury(metadataUri: string): Promise<string> {
    const treasuryPda = this.getTreasuryPda();
    return this.program.methods
      .initializeTreasury(metadataUri)
      .accounts({
        authority: this.provider.wallet.publicKey,
        treasury: treasuryPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async createPayment(params: CreatePaymentParams): Promise<string> {
    const treasuryPda = this.getTreasuryPda();
    const paymentPda = this.getPaymentPda(params.paymentReference);
    const tokenMint = params.tokenMint ?? PublicKey.default;

    return this.program.methods
      .createPayment(
        params.paymentReference,
        params.subscriptionReference,
        new anchor.BN(params.amount),
        tokenMint
      )
      .accounts({
        payer: this.provider.wallet.publicKey,
        treasury: treasuryPda,
        payment: paymentPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async confirmPayment(
    paymentReference: string,
    txSignature: string
  ): Promise<string> {
    const treasuryPda = this.getTreasuryPda();
    const paymentPda = this.getPaymentPda(paymentReference);

    return this.program.methods
      .confirmPayment(txSignature)
      .accounts({
        authority: this.provider.wallet.publicKey,
        treasury: treasuryPda,
        payment: paymentPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async refundPayment(
    paymentReference: string,
    reason: string
  ): Promise<string> {
    const treasuryPda = this.getTreasuryPda();
    const paymentPda = this.getPaymentPda(paymentReference);

    return this.program.methods
      .refundPayment(reason)
      .accounts({
        authority: this.provider.wallet.publicKey,
        treasury: treasuryPda,
        payment: paymentPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async fetchPayment(paymentReference: string): Promise<PaymentRecord | null> {
    const paymentPda = this.getPaymentPda(paymentReference);
    const raw = await this.program.account.payment.fetchNullable(paymentPda);
    if (!raw) {
      return null;
    }
    return this.mapPayment(paymentPda, raw);
  }

  private mapPayment(publicKey: PublicKey, raw: any): PaymentRecord {
    return {
      publicKey,
      paymentReference: raw.paymentReference,
      subscriptionReference: raw.subscriptionReference,
      payer: raw.payer,
      amount: raw.amount.toNumber(),
      tokenMint: raw.tokenMint,
      status: mapStatus(raw.status),
      txSignature: raw.txSignature,
      authority: raw.authority,
      createdAt: raw.createdAt.toNumber(),
      confirmedAt: raw.confirmedAt.toNumber(),
      refundedAt: raw.refundedAt.toNumber(),
      refundReason: raw.refundReason,
    };
  }
}

export function createPaymentClient(
  connection: Connection,
  wallet: Wallet,
  programId: string
): PaymentClient {
  return new PaymentClient(connection, wallet, new PublicKey(programId));
}