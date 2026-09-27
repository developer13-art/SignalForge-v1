//! Creates a new payment intent.

use anchor_lang::prelude::*;

use crate::constants::{
    MAX_PAYMENT_REFERENCE_LEN, MAX_PAYMENT_AMOUNT, MAX_SUBSCRIPTION_REFERENCE_LEN,
    MIN_PAYMENT_AMOUNT, PAYMENT_SEED, TREASURY_SEED,
};
use crate::errors::PaymentError;
use crate::events::PaymentCreated;
use crate::state::{Payment, PaymentStatus, Treasury};

#[derive(Accounts)]
#[instruction(payment_reference: String)]
pub struct CreatePayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init,
        payer = payer,
        space = Payment::MAX_SIZE,
        seeds = [
            PAYMENT_SEED,
            payment_reference.as_bytes(),
        ],
        bump,
    )]
    pub payment: Account<'info, Payment>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePayment>,
    payment_reference: String,
    subscription_reference: String,
    amount: u64,
    token_mint: Pubkey,
) -> Result<()> {
    require!(
        !payment_reference.is_empty(),
        PaymentError::PaymentReferenceEmpty
    );
    require!(
        payment_reference.len() <= MAX_PAYMENT_REFERENCE_LEN,
        PaymentError::PaymentReferenceTooLong
    );
    require!(
        !subscription_reference.is_empty(),
        PaymentError::SubscriptionReferenceEmpty
    );
    require!(
        subscription_reference.len() <= MAX_SUBSCRIPTION_REFERENCE_LEN,
        PaymentError::SubscriptionReferenceTooLong
    );
    require!(
        amount >= MIN_PAYMENT_AMOUNT && amount <= MAX_PAYMENT_AMOUNT,
        PaymentError::InvalidAmount
    );

    let now = Clock::get()?.unix_timestamp;

    let payment = &mut ctx.accounts.payment;
    payment.payment_reference = payment_reference.clone();
    payment.subscription_reference = subscription_reference.clone();
    payment.payer = ctx.accounts.payer.key();
    payment.amount = amount;
    payment.token_mint = token_mint;
    payment.status = PaymentStatus::Pending;
    payment.tx_signature = String::new();
    payment.authority = Pubkey::default();
    payment.created_at = now;
    payment.confirmed_at = 0;
    payment.refunded_at = 0;
    payment.refund_reason = String::new();
    payment.bump = ctx.bumps.payment;

    let treasury = &mut ctx.accounts.treasury;
    treasury.record_payment(now)?;

    emit!(PaymentCreated {
        payment: payment.key(),
        payer: ctx.accounts.payer.key(),
        payment_reference,
        subscription_reference,
        amount,
        token_mint,
        timestamp: now,
    });

    Ok(())
}