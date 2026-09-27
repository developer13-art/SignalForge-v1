//! Confirms a pending payment.

use anchor_lang::prelude::*;

use crate::constants::{MAX_TX_SIGNATURE_LEN, PAYMENT_SEED, TREASURY_SEED};
use crate::errors::PaymentError;
use crate::events::PaymentConfirmed;
use crate::state::{Payment, PaymentStatus, Treasury};

#[derive(Accounts)]
#[instruction(tx_signature: String)]
pub struct ConfirmPayment<'info> {
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

pub fn handler(ctx: Context<ConfirmPayment>, tx_signature: String) -> Result<()> {
    require!(
        tx_signature.len() <= MAX_TX_SIGNATURE_LEN,
        PaymentError::TxSignatureTooLong
    );

    let now = Clock::get()?.unix_timestamp;
    let payment = &mut ctx.accounts.payment;

    require!(payment.is_pending(), PaymentError::PaymentAlreadyConfirmed);

    payment.status = PaymentStatus::Confirmed;
    payment.tx_signature = tx_signature.clone();
    payment.authority = ctx.accounts.authority.key();
    payment.confirmed_at = now;

    let treasury = &mut ctx.accounts.treasury;
    treasury.record_confirmation(now)?;

    emit!(PaymentConfirmed {
        payment: payment.key(),
        authority: ctx.accounts.authority.key(),
        tx_signature,
        confirmed_at: now,
    });

    Ok(())
}