import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { SignalforgePayment } from "../target/types/signalforge_payment";

describe("Payment Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SignalforgePayment as Program<SignalforgePayment>;

  const authority = provider.wallet as anchor.Wallet;
  const payer = Keypair.generate();

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("payment_treasury")],
    program.programId
  );

  const PAYMENT_SEED = Buffer.from("payment");

  function derivePaymentPda(paymentRef: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [PAYMENT_SEED, Buffer.from(paymentRef)],
      program.programId
    );
    return pda;
  }

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        payer.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

    await program.methods
      .initializeTreasury("https://signalforge.ai/treasury")
      .accounts({
        authority: authority.publicKey,
        treasury: treasuryPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("initializes the treasury", async () => {
    const treasury = await program.account.treasury.fetch(treasuryPda);
    assert.equal(treasury.authority.toBase58(), authority.publicKey.toBase58());
    assert.equal(treasury.paymentsCreated.toNumber(), 0);
    assert.equal(treasury.paymentsConfirmed.toNumber(), 0);
  });

  it("creates a payment intent", async () => {
    const paymentRef = "SF-pay-000001";
    const pda = derivePaymentPda(paymentRef);

    await program.methods
      .createPayment(
        paymentRef,
        "SF-sub-4821",
        new anchor.BN(100_000_000),
        PublicKey.default
      )
      .accounts({
        payer: payer.publicKey,
        treasury: treasuryPda,
        payment: pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    const payment = await program.account.payment.fetch(pda);
    assert.equal(payment.paymentReference, paymentRef);
    assert.equal(payment.subscriptionReference, "SF-sub-4821");
    assert.equal(payment.payer.toBase58(), payer.publicKey.toBase58());
    assert.equal(payment.amount.toNumber(), 100_000_000);
    assert.deepEqual(payment.status, { pending: {} });

    const treasury = await program.account.treasury.fetch(treasuryPda);
    assert.equal(treasury.paymentsCreated.toNumber(), 1);
  });

  it("confirms the payment", async () => {
    const paymentRef = "SF-pay-000001";
    const pda = derivePaymentPda(paymentRef);

    await program.methods
      .confirmPayment("5xY7aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ")
      .accounts({
        authority: authority.publicKey,
        treasury: treasuryPda,
        payment: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const payment = await program.account.payment.fetch(pda);
    assert.deepEqual(payment.status, { confirmed: {} });
    assert.isString(payment.txSignature);
    assert.isAbove(payment.confirmedAt.toNumber(), 0);

    const treasury = await program.account.treasury.fetch(treasuryPda);
    assert.equal(treasury.paymentsConfirmed.toNumber(), 1);
  });

  it("rejects refunding a confirmed payment", async () => {
    const paymentRef = "SF-pay-000001";
    const pda = derivePaymentPda(paymentRef);

    let failed = false;
    try {
      await program.methods
        .refundPayment("Customer requested refund")
        .accounts({
          authority: authority.publicKey,
          treasury: treasuryPda,
          payment: pda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      failed = true;
    }
    assert.isTrue(failed);
  });

  it("refunds an unconfirmed payment", async () => {
    const paymentRef = "SF-pay-000002";
    const pda = derivePaymentPda(paymentRef);

    await program.methods
      .createPayment(
        paymentRef,
        "SF-sub-4822",
        new anchor.BN(50_000_000),
        PublicKey.default
      )
      .accounts({
        payer: payer.publicKey,
        treasury: treasuryPda,
        payment: pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    await program.methods
      .refundPayment("Payment not received")
      .accounts({
        authority: authority.publicKey,
        treasury: treasuryPda,
        payment: pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const payment = await program.account.payment.fetch(pda);
    assert.deepEqual(payment.status, { refunded: {} });
    assert.equal(payment.refundReason, "Payment not received");
    assert.isAbove(payment.refundedAt.toNumber(), 0);
  });

  it("rejects an invalid payment amount", async () => {
    const paymentRef = "SF-pay-invalid";
    const pda = derivePaymentPda(paymentRef);

    let failed = false;
    try {
      await program.methods
        .createPayment(
          paymentRef,
          "SF-sub-invalid",
          new anchor.BN(0),
          PublicKey.default
        )
        .accounts({
          payer: payer.publicKey,
          treasury: treasuryPda,
          payment: pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();
    } catch (error) {
      failed = true;
    }
    assert.isTrue(failed);
  });
});