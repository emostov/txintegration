// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { createSigningPayload, getRegistry, methods } from '@substrate/txwrapper';
import { 
  getChainData,
  getSenderData,
  TxConstruction,
	RemarkInputs
} from '../util/util';

export async function constructRemarkTx(userInputs: RemarkInputs): Promise<TxConstruction> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

	console.log(`\nNetwork Version: ${chainData.specVersion}`);
	console.log(`Transaction Version: ${chainData.transactionVersion}`);

  const registry = getRegistry(userInputs.chainName, userInputs.specName, chainData.specVersion);

  const unsigned = methods.system.remark(
    {
			remark: userInputs.remark,
    },
    {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      eraPeriod: userInputs.eraPeriod,
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: senderData.nonce,
			specVersion: chainData.specVersion,
			transactionVersion: chainData.transactionVersion,
      tip: userInputs.tip,
    },
    {
      metadataRpc: chainData.metadataRpc,
      registry,
    },
  );

  // Construct the signing payload from an unsigned transaction.
  const signingPayload: string = createSigningPayload(unsigned, { registry });

  return {
    unsigned: unsigned,
    payload: signingPayload,
    registry: registry,
    metadata: chainData.metadataRpc,
  };
}