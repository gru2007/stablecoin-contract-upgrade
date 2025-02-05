import { toNano } from '@ton/core';
import { Miner } from '../wrappers/Miner';
import { compile, NetworkProvider } from '@ton/blueprint';
import {jettonWalletCodeFromLibrary, promptUrl, promptUserFriendlyAddress} from "../wrappers/ui-utils";

export async function run(provider: NetworkProvider) {

	const ui = provider.ui();
	const adminAddr = await promptUserFriendlyAddress("Enter the address of the owner", ui, true);
	const jettonWallet = await promptUserFriendlyAddress("Enter the address of the jetton wallet", ui, true);
    const miner = provider.open(
        Miner.createFromConfig(
            {
                owner_addr: adminAddr.address,
			    jwall_addr: jettonWallet.address,
            },
            await compile('Miner')
        )
    );

    await miner.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(miner.address);
}
