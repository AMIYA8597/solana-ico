import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './ico-idl.json';
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const programID = new PublicKey('52GyJzgQBVpaHq29K5yt3rmEUix2yPxzaineupJJURdZ');

export const getProgram = (connection, wallet) => {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  return new Program(idl, programID, provider);
};

export const findProgramAddress = async (seeds, programId) => {
  const [publicKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
  return { publicKey, bump };
};

