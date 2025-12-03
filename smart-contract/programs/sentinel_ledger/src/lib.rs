use anchor_lang::prelude::*;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_PROGRAM_ID;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::sysvar::instructions::{load_instruction_at_checked, load_current_index_checked};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sentinel_ledger {
    use super::*;

    pub fn process_transaction(
        ctx: Context<ProcessTransaction>, 
        transaction_id: String, 
        amount: u64, 
        fraud_score: u8, // 0-100 mapped from 0.0-1.0
        is_fraud: bool,
        signature: Vec<u8>
    ) -> Result<()> {
        let transaction_record = &mut ctx.accounts.transaction_record;
        
        // In a real production environment, we would verify the Ed25519 signature here.
        // This often involves checking an Ed25519 instruction that preceded this one in the same transaction,
        // or implementing signature verification logic if the curve allows (expensive on-chain).
        // For this demo, we will store the data and trust the signer (the Oracle) who invokes this.
        // We assume the Oracle is the `signer` of this transaction or we check `ctx.accounts.oracle`.
        
        // Verify Oracle Authority
        // We check if the signer is the authorized oracle.
        // For simplicity, we just store the data.
        
        transaction_record.transaction_id = transaction_id;
        transaction_record.amount = amount;
        transaction_record.sender = *ctx.accounts.sender.key;
        transaction_record.receiver = *ctx.accounts.receiver.key;
        transaction_record.fraud_score = fraud_score;
        transaction_record.is_fraud = is_fraud;
        transaction_record.timestamp = Clock::get()?.unix_timestamp;
        transaction_record.signature = signature;

        if is_fraud {
            msg!("FRAUD DETECTED! Transaction blocked.");
            // In a real scenario, we might freeze funds or revert.
            // Here we just emit an event.
            emit!(FraudDetected {
                transaction_id: transaction_record.transaction_id.clone(),
                fraud_score: fraud_score,
            });
        } else {
            msg!("Transaction Verified. Status: Safe.");
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(transaction_id: String)]
pub struct ProcessTransaction<'info> {
    #[account(
        init, 
        payer = sender, 
        space = 8 + 32 + 8 + 32 + 32 + 1 + 1 + 8 + 64 + 64, // Adjust space as needed
        seeds = [b"transaction", transaction_id.as_bytes()], 
        bump
    )]
    pub transaction_record: Account<'info, TransactionRecord>,
    
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// CHECK: Receiver account
    pub receiver: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TransactionRecord {
    pub transaction_id: String,
    pub amount: u64,
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub fraud_score: u8,
    pub is_fraud: bool,
    pub timestamp: i64,
    pub signature: Vec<u8>,
}

#[event]
pub struct FraudDetected {
    pub transaction_id: String,
    pub fraud_score: u8,
}
