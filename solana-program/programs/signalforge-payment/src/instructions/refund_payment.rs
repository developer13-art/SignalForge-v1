//! Refunds an unconfirmed payment.

use anchor_lang::prelude::*;

use crate::constants::{MAX_REFUND_REASON_LEN, PAYMENT_SEED, TREASURY_SEED};
use crate::errors::PaymentError;
use crate::events::PaymentRefunded;
use crate::state::{Payment, PaymentStatus, Treasury};

#[derive(Accounts)]
pub struct RefundPayment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = treasury.bump,
        has_one = authority @ PaymentError::InvalidAuthority,
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        mut,
        seeds = [
            PAYMENT_SEED,
            payment.payment_reference.as_bytes(),
        ],
        bump = payment.bump,
    )]
    pub payment: Account<'info, Payment>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RefundPayment>, reason: String) -> Result<()> {
    require!(
        reason.len() <= MAX_REFUND_REASON_LEN,
        PaymentError::RefundReasonTooLong
    );

    let now = Clock::get()?.unix_timestamp;
    let payment = &mut ctx.accounts.payment;

    require!(!payment.is_confirmed(), PaymentError::PaymentAlreadyConfirmed);
    require!(!payment.is_refunded(), PaymentError::PaymentAlreadyRefunded);

    payment.status = PaymentStatus::Refunded;
    payment.refund_reason = reason.clone();
    payment.refunded_at = now;
    payment.authority = ctx.accounts.authority.key();

    let treasury = &mut ctx.accounts.treasury;
    treasury.record_refund(now)?;

    emit!(PaymentRefunded {
        payment: payment.key(),
        authority: ctx.accounts.authority.key(),
        reason,
        refunded_at: now,
    });

    Ok(())
}