use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};

declare_id!("GPW34eu3rbyGriHnsGiPzpNdY28KuyHUqM7PTUFikTXT");

#[program]
pub mod simple_ico_program {
    use super::*;

    // Initialize the ICO
    pub fn initialize(
        ctx: Context<Initialize>,
        total_supply: u64,
        token_price: u64,
        start_time: i64,
        duration: i64,
    ) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;

        ico.authority = ctx.accounts.authority.key();
        ico.total_supply = total_supply;
        ico.token_price = token_price;
        ico.start_time = start_time;
        ico.duration = duration;
        ico.tokens_sold = 0;
        ico.is_active = true;

        Ok(())
    }

    pub fn update_ico_details(
        ctx: Context<UpdateIcoDetails>,
        total_supply: u64,
        token_price: u64,
        start_time: i64,
        duration: i64,
    ) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;

        // Ensure only the authority can update details
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );

        // Update details
        ico.total_supply = total_supply;
        ico.token_price = token_price;
        ico.start_time = start_time;
        ico.duration = duration;

        Ok(())
    }

    // Buy tokens during the ICO
    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;

        // Extract authority info before mutable borrow
        let authority_info = ctx.accounts.ico_account.to_account_info();

        // Mutable borrow for `ico_account`
        let ico = &mut ctx.accounts.ico_account;

        // Check if ICO is active
        require!(
            ico.is_active
                && current_time >= ico.start_time
                && current_time < ico.start_time + ico.duration,
            IcoError::IcoNotActive
        );

        // Check remaining supply
        require!(
            ico.tokens_sold + amount <= ico.total_supply,
            IcoError::InsufficientTokens
        );

        // Calculate total cost
        let total_cost = amount * ico.token_price;

        msg!("Token Price: {}", ico.token_price);
        msg!("Amount: {}", amount);
        msg!("Total Cost: {}", total_cost);

        // Transfer SOL from buyer to treasury
        let transfer_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.treasury_wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(transfer_context, total_cost)?;

        // Prepare signer seeds and extend lifetime
        let signer_seeds: &[&[u8]] = &[b"ico".as_slice(), &[ctx.bumps.ico_account]];
        let signer_seeds_arr = &[signer_seeds]; // Ensure it lives long enough

        // Transfer tokens to buyer
        let token_transfer_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            signer_seeds_arr,
        );
        token::transfer(token_transfer_context, amount)?;

        // Update tokens sold
        ico.tokens_sold += amount;

        // Emit purchase event
        emit!(TokenPurchaseEvent {
            buyer: ctx.accounts.buyer.key(),
            amount,
            price: ico.token_price
        });

        Ok(())
    }

    // End the ICO
    pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time >= ico.start_time + ico.duration,
            IcoError::IcoStillActive
        );

        ico.is_active = false;

        Ok(())
    }
}

// Token Purchase Event
#[event]
pub struct TokenPurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub price: u64,
}

#[derive(Accounts)]
pub struct UpdateIcoDetails<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
}

// Account Structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 8 * 6 + 1,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"ico"],
        bump,
        // Add this constraint to explicitly set the token account's authority
        has_one = authority 
    )]
    pub ico_account: Account<'info, IcoAccount>,
    /// CHECK: This will be the authority for the token account
    pub authority: AccountInfo<'info>,

    #[account(mut)]
    pub treasury_wallet: SystemAccount<'info>,

    #[account(
        mut,
        token::authority = authority // Ensure the token account is owned by the PDA
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndIco<'info> {
    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
}

// ICO Account Structure
#[account]
#[derive(Default)]
pub struct IcoAccount {
    pub authority: Pubkey,
    pub total_supply: u64,
    pub token_price: u64,
    pub tokens_sold: u64,
    pub start_time: i64,
    pub duration: i64,
    pub is_active: bool,
}

// Error Handling
#[error_code]
pub enum IcoError {
    #[msg("ICO is not currently active")]
    IcoNotActive,
    #[msg("Insufficient tokens remaining")]
    InsufficientTokens,
    #[msg("ICO is still active")]
    IcoStillActive,
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}
