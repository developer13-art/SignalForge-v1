//! SignalForge Payment Program
//!
//! Enables subscription payments in SOL and SPL tokens with on-chain payment
//! intents, confirmation, and refunds. Every payment is anchored to an
//! off-chain subscription reference.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SFPayment1111111111111111111111111111111");

#[program]
pub mod signalforge_payment {
    use super::*;

    /// Initialize the treasury. May only be called once.
    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, metadata_uri)
    }

    /// Create a payment intent.
    ///
    /// The payer commits to a specific amount and token for a specific
    /// subscription reference. The intent is stored until confirmed.
    pub fn create_payment(
        ctx: Context<CreatePayment>,
        payment_reference: String,
        subscription_reference: String,
        amount: u64,
        token_mint: Pubkey,
    ) -> Result<()> {
        instructions::create_payment::handler(
            ctx,
            payment_reference,
            subscription_reference,
            amount,
            token_mint,
        )
    }

    /// Confirm a payment.
    ///
    /// Only the treasury authority may confirm. The payer's tokens must
    /// have been transferred to the treasury before confirmation.
    pub fn confirm_payment(
        ctx: Context<ConfirmPayment>,
        tx_signature: String,
    ) -> Result<()> {
        instructions::confirm_payment::handler(ctx, tx_signature)
    }

    /// Refund an unconfirmed payment.
    pub fn refund_payment(
        ctx: Context<RefundPayment>,
        reason: String,
    ) -> Result<()> {
        instructions::refund_payment::handler(ctx, reason)
    }
}