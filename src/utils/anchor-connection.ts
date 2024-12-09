import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './ico-idl.json';

const programID = new PublicKey(process.env.REACT_APP_PROGRAM_ID!);

export const getProgram = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  return new Program(idl, programID, provider);
};

export const findProgramAddress = async (seeds: Buffer[], programId: PublicKey) => {
  const [publicKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
  return { publicKey, bump };
};

