import { Sdk, randomPrivateKey, NetworkNames, EnvNames } from 'etherspot';
import {default as erc20Abi} from 'human-standard-token-abi';
const abiCoder = require('web3-eth-abi');

/**
 * Example code to create smart wallet on kovan testnet using etherspot sdk
 * the generated smart wallet is not deployed on chain until the first transaction.
 */

async function main(): Promise<void> {
  const sdk = new Sdk(randomPrivateKey(), {
    env: EnvNames.TestNets, // Use EnvNames.Mainnet, If you are accessing Mainnets
    networkName: NetworkNames.Kovan,
    //projectKey: 'test-project', //optional can be used to uniquely identify your project
  });
  
  const { state } = sdk;

  console.log('create session', await sdk.createSession());
  await sdk.computeContractAccount({sync: true});
  console.log('Smart wallet', state.account);
  console.log('Account balances ', await sdk.getAccountBalances());

  const receiver = '0x940d89BFAB20d0eFd076399b6954cCc42Acd8e15'; // Replace with address of your choice
  const tokenAddress = '0x9de9cde889a40b7402d824386064d17792298e1b'; //PLR contract on Kovan
  const tokens = '1000000000000000000000'; // 1000 PLR
  const methodName = erc20Abi.find(({ name }) => name === 'transfer');
  console.log('Method Name ',methodName);
  //encode the transfer method using ethers.js
  const encodedData = abiCoder.encodeFunctionCall(
      methodName,
      [
          receiver,
          tokens
      ]);

  console.log('Encoded function call ',encodedData);
  //this method will add the transaction to a batch, which has to be executed later.
  const transaction = await sdk.batchExecuteAccountTransaction({
    to: tokenAddress,// ERC20 Address
    data: encodedData,
  });

  console.log('Estimating transaction');
  await sdk.estimateGatewayBatch().then(async (result) => {
    console.log('Estimation ', result.estimation);
    const hash = await sdk.submitGatewayBatch();
    console.log('Transaction submitted ', hash);
  })
  .catch((error) => {
    console.log('Transaction estimation failed with error ',error);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
