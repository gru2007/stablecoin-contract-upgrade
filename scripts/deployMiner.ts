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
			    seed: 1,
			    pow_complexity: 1,
			    last_success: 1,
			    target_delta: 1,
			    min_cpl: 1,
			    max_cpl: 1,
            },
            await compile('Miner')
        )
    );

    await miner.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(miner.address);
}
