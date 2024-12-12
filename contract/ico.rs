use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, TokenAccount, Transfer},
};

declare_id!("3QKFh6VpA1DgvinFvq58oMpZQF3MJzkvoS9DPay5T6tS");

#[program]
pub mod advanced_ico_program {
    use super::*;

    // Initialize the ICO
    pub fn initialize(
        ctx: Context<Initialize>,
        total_supply: u64,
        token_price: u64,
        start_time: i64,
        duration: i64,
        round_type: RoundType,
    ) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;
        ico.authority = ctx.accounts.authority.key();
        ico.token_mint = ctx.accounts.token_mint.key();
        ico.total_supply = total_supply;
        ico.token_price = token_price;
        ico.start_time = start_time;
        ico.duration = duration;
        ico.tokens_sold = 0;
        ico.is_active = true;
        ico.round_type = round_type;
        ico.seed_investors = Vec::new(); // Initialize empty seed investors list

        Ok(())
    }

    // Add a seed investor to the whitelist
    pub fn add_seed_investor(ctx: Context<AddSeedInvestor>, investor: Pubkey) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;

        // Ensure only the ICO authority can add seed investors
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );

        // Add the investor to the whitelist
        ico.seed_investors.push(investor);

        Ok(())
    }

    // Remove a seed investor from the whitelist
    pub fn remove_seed_investor(ctx: Context<RemoveSeedInvestor>, investor: Pubkey) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;

        // Ensure only the ICO authority can remove seed investors
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );

        // Find and remove the investor from the whitelist
        if let Some(index) = ico.seed_investors.iter().position(|&x| x == investor) {
            ico.seed_investors.remove(index);
        } // Fundraising Round Types
        #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
        pub enum RoundType {
            SeedRound,
            PreICO,
            PublicICO,
        }

        impl Default for RoundType {
            fn default() -> Self {
                RoundType::SeedRound
            }
        }

        // Events
        #[event]
        pub struct TokenPurchaseEvent {
            pub buyer: Pubkey,
            pub amount: u64,
            pub price: u64,
            pub round_type: RoundType,
        }

        #[event]
        pub struct PurchaseEvent {
            pub buyer: Pubkey,
            pub amount: u64,
            pub is_distributed: bool,
        }

        // Purchase Account
        #[account]
        #[derive(Default)]
        pub struct PurchaseAccount {
            pub buyer: Pubkey,
            pub amount: u64,
            pub is_distributed: bool,
        }

        // ICO Account
        #[account]
        #[derive(Default)]
        pub struct IcoAccount {
            pub authority: Pubkey,
            pub token_mint: Pubkey,
            pub total_supply: u64,
            pub token_price: u64,
            pub tokens_sold: u64,
            pub start_time: i64,
            pub duration: i64,
            pub is_active: bool,
            pub round_type: RoundType,
            pub seed_investors: Vec<Pubkey>, // New field to store whitelisted seed investors
        }

        // Account Structs
        #[derive(Accounts)]
        pub struct Initialize<'info> {
            #[account(mut)]
            pub authority: Signer<'info>,
            #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 2 + 8 + 6 + 1 + 1 + 4 + (32 * 100), // Added space for seed investors
        seeds = [b"ico"],
        bump
    )]
            pub ico_account: Account<'info, IcoAccount>,
            #[account(mut)]
            pub token_mint: Account<'info, Mint>,
            pub system_program: Program<'info, System>,
        }

        #[derive(Accounts)]
        pub struct BuyTokens<'info> {
            #[account(mut)]
            pub buyer: Signer<'info>,
            #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
            pub ico_account: Account<'info, IcoAccount>,
            #[account(
        init_if_needed,
        payer = buyer, 
        space = 8 + 32 + 8 + 1,
        seeds = [b"purchase", buyer.key().as_ref()],
        bump
    )]
            pub purchase_account: Account<'info, PurchaseAccount>,
            #[account(mut)]
            pub treasury_wallet: SystemAccount<'info>,
            pub token_program: Program<'info, token::Token>,
            pub system_program: Program<'info, System>,
        }

        #[derive(Accounts)]
        pub struct DistributeTokens<'info> {
            #[account(mut)]
            pub authority: Signer<'info>,
            #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
            pub ico_account: Account<'info, IcoAccount>,
            #[account(mut)]
            pub treasury_token_account: Account<'info, TokenAccount>,
            #[account(mut)]
            pub buyer_token_account: Account<'info, TokenAccount>,
            #[account(
        mut,
        seeds = [b"purchase", purchase_account.buyer.as_ref()],
        bump
    )]
            pub purchase_account: Account<'info, PurchaseAccount>,
            pub token_program: Program<'info, token::Token>,
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

        // New account structs for adding/removing seed investors
        #[derive(Accounts)]
        pub struct AddSeedInvestor<'info> {
            #[account(mut)]
            pub authority: Signer<'info>,
            #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
            pub ico_account: Account<'info, IcoAccount>,
        }

        #[derive(Accounts)]
        pub struct RemoveSeedInvestor<'info> {
            #[account(mut)]
            pub authority: Signer<'info>,
            #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
            pub ico_account: Account<'info, IcoAccount>,
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
            #[msg("Purchase account not found")]
            PurchaseAccountNotFound,
            #[msg("Buyer token account not found")]
            BuyerTokenAccountNotFound,
            #[msg("Mathematical overflow occurred")]
            MathOverflow,
            #[msg("Investor is not whitelisted for the seed round")]
            NotWhitelisted,
        }

        Ok(())
    }

    // Buy tokens during the ICO
    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        let ico = &mut ctx.accounts.ico_account;

        // Validate ICO status and token availability
        require!(
            ico.is_active
                && current_time >= ico.start_time
                && current_time < ico.start_time + ico.duration,
            IcoError::IcoNotActive
        );

        // Special whitelist check for Seed Round
        if ico.round_type == RoundType::SeedRound {
            require!(
                ico.seed_investors.contains(&ctx.accounts.buyer.key()),
                IcoError::NotWhitelisted
            );
        }

        require!(
            ico.tokens_sold + amount <= ico.total_supply,
            IcoError::InsufficientTokens
        );

        // Calculate total cost
        let total_cost = amount
            .checked_mul(ico.token_price)
            .ok_or(IcoError::MathOverflow)?;

        // Transfer SOL to treasury
        let transfer_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.treasury_wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(transfer_context, total_cost)?;

        // Update purchase tracking
        let purchase = &mut ctx.accounts.purchase_account;
        purchase.buyer = ctx.accounts.buyer.key();
        purchase.amount = purchase
            .amount
            .checked_add(amount)
            .ok_or(IcoError::MathOverflow)?;
        purchase.is_distributed = false;

        // Update ICO tracking
        ico.tokens_sold = ico
            .tokens_sold
            .checked_add(amount)
            .ok_or(IcoError::MathOverflow)?;

        // Emit purchase event
        emit!(TokenPurchaseEvent {
            buyer: ctx.accounts.buyer.key(),
            amount,
            price: ico.token_price,
            round_type: ico.round_type.clone(),
        });

        Ok(())
    }

    // Distribute tokens to buyers
    pub fn distribute_tokens(ctx: Context<DistributeTokens>) -> Result<()> {
        let ico = &mut ctx.accounts.ico_account;

        // Ensure ICO is not active and tokens have been sold
        require!(!ico.is_active, IcoError::IcoStillActive);
        require!(ico.tokens_sold > 0, IcoError::InsufficientTokens);

        // Validate caller is ICO authority
        require!(
            ctx.accounts.authority.key() == ico.authority,
            IcoError::Unauthorized
        );

        // Perform token transfer from treasury to buyer's token account
        let transfer_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.treasury_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );

        // Transfer tokens equal to purchase amount
        token::transfer(transfer_context, ctx.accounts.purchase_account.amount)?;

        // Mark purchase as distributed
        let purchase = &mut ctx.accounts.purchase_account;
        purchase.is_distributed = true;

        // Emit distribution event
        emit!(PurchaseEvent {
            buyer: purchase.buyer,
            amount: purchase.amount,
            is_distributed: true,
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
    pub fn get_seed_investors(ctx: Context<GetSeedInvestors>) -> Result<()> {
        let ico = &ctx.accounts.ico_account;
        msg!("Number of seed investors: {}", ico.seed_investors.len());
        for (index, investor) in ico.seed_investors.iter().enumerate() {
            msg!("Seed Investor {}: {}", index + 1, investor);
        }

        Ok(())
    }
}

// Fundraising Round Types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum RoundType {
    SeedRound,
    PreICO,
    PublicICO,
}

impl Default for RoundType {
    fn default() -> Self {
        RoundType::SeedRound
    }
}

// Events
#[event]
pub struct TokenPurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub price: u64,
    pub round_type: RoundType,
}

#[event]
pub struct PurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub is_distributed: bool,
}

// Purchase Account
#[account]
#[derive(Default)]
pub struct PurchaseAccount {
    pub buyer: Pubkey,
    pub amount: u64,
    pub is_distributed: bool,
}

// ICO Account
#[account]
#[derive(Default)]
pub struct IcoAccount {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub total_supply: u64,
    pub token_price: u64,
    pub tokens_sold: u64,
    pub start_time: i64,
    pub duration: i64,
    pub is_active: bool,
    pub round_type: RoundType,
    pub seed_investors: Vec<Pubkey>, // New field to store whitelisted seed investors
}

// Account Structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 2 + 8 + 6 + 1 + 1 + 4 + (32 * 100), // Added space for seed investors
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
    #[account(
        init_if_needed,
        payer = buyer, 
        space = 8 + 32 + 8 + 1,
        seeds = [b"purchase", buyer.key().as_ref()],
        bump
    )]
    pub purchase_account: Account<'info, PurchaseAccount>,
    #[account(mut)]
    pub treasury_wallet: SystemAccount<'info>,
    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"purchase", purchase_account.buyer.as_ref()],
        bump
    )]
    pub purchase_account: Account<'info, PurchaseAccount>,
    pub token_program: Program<'info, token::Token>,
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

// New account structs for adding/removing seed investors
#[derive(Accounts)]
pub struct AddSeedInvestor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
}

#[derive(Accounts)]
pub struct RemoveSeedInvestor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
}

#[derive(Accounts)]
pub struct GetSeedInvestors<'info> {
    #[account(
        seeds = [b"ico"],
        bump
    )]
    pub ico_account: Account<'info, IcoAccount>,
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
    #[msg("Purchase account not found")]
    PurchaseAccountNotFound,
    #[msg("Buyer token account not found")]
    BuyerTokenAccountNotFound,
    #[msg("Mathematical overflow occurred")]
    MathOverflow,
    #[msg("Investor is not whitelisted for the seed round")]
    NotWhitelisted,
}
































































// use anchor_lang::prelude::*;
// use anchor_spl::associated_token::{get_associated_token_address, AssociatedToken};
// use anchor_spl::token::{self, Mint, TokenAccount, Transfer};

// declare_id!("Ed7oyNWphFwoZW6K4S5uczdJ8cc4c2xjoarv4YsLmWtA");

// #[program]
// pub mod advanced_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//         round_type: RoundType,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         ico.authority = ctx.accounts.authority.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;
//         ico.round_type = round_type;

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;
//         let ico = &mut ctx.accounts.ico_account;

//         // Validate ICO status and token availability
//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         // Calculate total cost
//         let total_cost = amount
//             .checked_mul(ico.token_price)
//             .ok_or(IcoError::MathOverflow)?;

//         // Transfer SOL to treasury
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Update purchase tracking
//         let purchase = &mut ctx.accounts.purchase_account;
//         purchase.buyer = ctx.accounts.buyer.key();
//         purchase.amount = purchase
//             .amount
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;
//         purchase.is_distributed = false;

//         // Update ICO tracking
//         ico.tokens_sold = ico
//             .tokens_sold
//             .checked_add(amount)
//             .ok_or(IcoError::MathOverflow)?;

//         // Emit purchase event
//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price,
//             round_type: ico.round_type.clone(),
//         });

//         Ok(())
//     }

//     pub fn batch_distribute_tokens(ctx: Context<BatchDistributeTokens>) -> Result<()> {
//         let ico = &ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         // Validate ICO status and authority
//         require!(
//             !ico.is_active && current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // // Prepare signer seeds
//         // let signer_seeds: &[&[u8]] = &[b"ico", &[ctx.bumps.ico_account]];

//         // // Batch token distribution based on purchase accounts
//         // for purchase_account in ctx.remaining_accounts.iter() {
//         // Deserialize the purchase account
//         // let purchase =
//         //     PurchaseAccount::try_deserialize(&mut **purchase_account.data.borrow_mut())?;

//         // Skip already distributed purchases
//         // if purchase.is_distributed {
//         //     continue;
//         // }

//         // // Get associated token account address for the buyer
//         // let recipient_ata =
//         //     get_associated_token_address(&purchase.buyer, &ctx.accounts.token_mint.key());

//         // Fetch the associated token account from remaining accounts
//         // let recipient_ata_info = ctx
//         //     .remaining_accounts
//         //     .iter()
//         //     .find(|account| *account.key == recipient_ata)
//         //     .ok_or(IcoError::BuyerTokenAccountNotFound)?;

//         // // Transfer tokens to the buyer
//         // let transfer_context = CpiContext::new_with_signer(
//         //     ctx.accounts.token_program.to_account_info(),
//         //     Transfer {
//         //         from: ctx.accounts.token_account.to_account_info(),
//         //         to: recipient_ata_info.to_account_info(),
//         //         authority: ctx.accounts.ico_account.to_account_info(),
//         //     },
//         //     &[signer_seeds], // Directly use the slice here
//         // );

//         // token::transfer(transfer_context, purchase.amount)?;

//         // Mark the purchase as distributed
//         // let mut purchase_data = purchase_account.data.borrow_mut();
//         // purchase.is_distributed = true; // Update the purchase directly
//         // purchase.serialize(&mut *purchase_data)?;
//         // }

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;
//         Ok(())
//     }

// }

// // Fundraising Round Types
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
// pub enum RoundType {
//     SeedRound,
//     PreICO,
//     PublicICO,
// }

// impl Default for RoundType {
//     fn default() -> Self {
//         RoundType::SeedRound
//     }
// }

// // Token Purchase Event
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
//     pub round_type: RoundType,
// }

// // Purchase Account to track individual purchases
// #[account]
// #[derive(Default)]
// pub struct PurchaseAccount {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub is_distributed: bool,
// }

// // Account Structs for different instructions
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 8 * 6 + 1 + 1,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(
//         init_if_needed,
//         payer = buyer,
//         space = 8 + 32 + 8 + 1,
//         seeds = [b"purchase", buyer.key().as_ref()],
//         bump
//     )]
//     pub purchase_account: Account<'info, PurchaseAccount>,
//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,
//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// use anchor_lang::prelude::*;

// #[derive(Accounts)]
// pub struct BatchDistributeTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,
//     #[account(mut)]
//     pub ico_account: Account<'info, IcoAccount>,
//     #[account(mut)]
//     pub token_account: Account<'info, TokenAccount>, // Admin's token account
//     pub token_mint: Account<'info, Mint>, // Token mint account
//     pub token_program: Program<'info, token::Token>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // ICO Account Structure
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     // pub duration: i64,
//     pub is_active: bool,
//     pub round_type: RoundType,
// }

// // Enhanced Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
//     #[msg("Purchase account not found")]
//     PurchaseAccountNotFound,
//     #[msg("Buyer token account not found")]
//     BuyerTokenAccountNotFound,
//     #[msg("Recipient and amount lists must be of equal length")]
//     BatchDistributionMismatch,
//     #[msg("Mathematical overflow occurred")]
//     MathOverflow,
// }



















































































// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, TokenAccount, Transfer};

// declare_id!("GPW34eu3rbyGriHnsGiPzpNdY28KuyHUqM7PTUFikTXT");

// #[program]
// pub mod simple_ico_program {
//     use super::*;

//     // Initialize the ICO
//     pub fn initialize(
//         ctx: Context<Initialize>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         ico.authority = ctx.accounts.authority.key();
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;
//         ico.tokens_sold = 0;
//         ico.is_active = true;

//         Ok(())
//     }

//     pub fn update_ico_details(
//         ctx: Context<UpdateIcoDetails>,
//         total_supply: u64,
//         token_price: u64,
//         start_time: i64,
//         duration: i64,
//     ) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;

//         // Ensure only the authority can update details
//         require!(
//             ctx.accounts.authority.key() == ico.authority,
//             IcoError::Unauthorized
//         );

//         // Update details
//         ico.total_supply = total_supply;
//         ico.token_price = token_price;
//         ico.start_time = start_time;
//         ico.duration = duration;

//         Ok(())
//     }

//     // Buy tokens during the ICO
//     pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
//         let current_time = Clock::get()?.unix_timestamp;

//         // Extract authority info before mutable borrow
//         let authority_info = ctx.accounts.ico_account.to_account_info();

//         // Mutable borrow for `ico_account`
//         let ico = &mut ctx.accounts.ico_account;

//         // Check if ICO is active
//         require!(
//             ico.is_active
//                 && current_time >= ico.start_time
//                 && current_time < ico.start_time + ico.duration,
//             IcoError::IcoNotActive
//         );

//         // Check remaining supply
//         require!(
//             ico.tokens_sold + amount <= ico.total_supply,
//             IcoError::InsufficientTokens
//         );

//         // Calculate total cost
//         let total_cost = amount * ico.token_price;

//         msg!("Token Price: {}", ico.token_price);
//         msg!("Amount: {}", amount);
//         msg!("Total Cost: {}", total_cost);

//         // Transfer SOL from buyer to treasury
//         let transfer_context = CpiContext::new(
//             ctx.accounts.system_program.to_account_info(),
//             anchor_lang::system_program::Transfer {
//                 from: ctx.accounts.buyer.to_account_info(),
//                 to: ctx.accounts.treasury_wallet.to_account_info(),
//             },
//         );
//         anchor_lang::system_program::transfer(transfer_context, total_cost)?;

//         // Prepare signer seeds and extend lifetime
//         let signer_seeds: &[&[u8]] = &[b"ico".as_slice(), &[ctx.bumps.ico_account]];
//         let signer_seeds_arr = &[signer_seeds]; // Ensure it lives long enough

//         // Transfer tokens to buyer
//         let token_transfer_context = CpiContext::new_with_signer(
//             ctx.accounts.token_program.to_account_info(),
//             Transfer {
//                 from: ctx.accounts.token_account.to_account_info(),
//                 to: ctx.accounts.buyer_token_account.to_account_info(),
//                 authority: ctx.accounts.authority.to_account_info(),
//             },
//             signer_seeds_arr,
//         );
//         token::transfer(token_transfer_context, amount)?;

//         // Update tokens sold
//         ico.tokens_sold += amount;

//         // Emit purchase event
//         emit!(TokenPurchaseEvent {
//             buyer: ctx.accounts.buyer.key(),
//             amount,
//             price: ico.token_price
//         });

//         Ok(())
//     }

//     // End the ICO
//     pub fn end_ico(ctx: Context<EndIco>) -> Result<()> {
//         let ico = &mut ctx.accounts.ico_account;
//         let current_time = Clock::get()?.unix_timestamp;

//         require!(
//             current_time >= ico.start_time + ico.duration,
//             IcoError::IcoStillActive
//         );

//         ico.is_active = false;

//         Ok(())
//     }
// }

// // Token Purchase Event
// #[event]
// pub struct TokenPurchaseEvent {
//     pub buyer: Pubkey,
//     pub amount: u64,
//     pub price: u64,
// }

// #[derive(Accounts)]
// pub struct UpdateIcoDetails<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // Account Structs
// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         init, 
//         payer = authority, 
//         space = 8 + 32 + 8 * 6 + 1,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,

//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct BuyTokens<'info> {
//     #[account(mut)]
//     pub buyer: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump,
//         // Add this constraint to explicitly set the token account's authority
//         has_one = authority 
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
//     /// CHECK: This will be the authority for the token account
//     pub authority: AccountInfo<'info>,

//     #[account(mut)]
//     pub treasury_wallet: SystemAccount<'info>,

//     #[account(
//         mut,
//         token::authority = authority // Ensure the token account is owned by the PDA
//     )]
//     pub token_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub buyer_token_account: Account<'info, TokenAccount>,

//     pub token_program: Program<'info, token::Token>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct EndIco<'info> {
//     #[account(
//         mut,
//         seeds = [b"ico"],
//         bump
//     )]
//     pub ico_account: Account<'info, IcoAccount>,
// }

// // ICO Account Structure
// #[account]
// #[derive(Default)]
// pub struct IcoAccount {
//     pub authority: Pubkey,
//     pub total_supply: u64,
//     pub token_price: u64,
//     pub tokens_sold: u64,
//     pub start_time: i64,
//     pub duration: i64,
//     pub is_active: bool,
// }

// // Error Handling
// #[error_code]
// pub enum IcoError {
//     #[msg("ICO is not currently active")]
//     IcoNotActive,
//     #[msg("Insufficient tokens remaining")]
//     InsufficientTokens,
//     #[msg("ICO is still active")]
//     IcoStillActive,
//     #[msg("You are not authorized to perform this action")]
//     Unauthorized,
// }
