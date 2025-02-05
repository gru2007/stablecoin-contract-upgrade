import {toNano} from '@ton/core';
import {JettonMinter, jettonMinterConfigToCell} from '../wrappers/JettonMinter';
import {compile, NetworkProvider} from '@ton/blueprint';
import {jettonWalletCodeFromLibrary, promptUrl, promptUserFriendlyAddress} from "../wrappers/ui-utils";
import {checkJettonMinter} from "./JettonMinterChecker";

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';

    const ui = provider.ui();
    const jettonMinterCodeRaw = await compile('JettonMinter');
    const jettonWalletCodeRaw = await compile('JettonWallet');
    const jettonWalletCode = jettonWalletCodeFromLibrary(jettonWalletCodeRaw);

    const adminAddress = await promptUserFriendlyAddress("Enter the address of the jetton owner (admin):", ui, isTestnet);

    // e.g "https://bridge.ton.org/token/1/0x111111111117dC0aa78b770fA6A738034120C302.json"
    const jettonMetadataUri = await promptUrl("Enter jetton metadata uri (https://jettonowner.com/jetton.json)", ui)
    
    const jettonMinterAddress = await promptUserFriendlyAddress("Enter the address of the jetton minter", ui, isTestnet);

    const {
            jettonMinterContract,
            adminAddress
        } = await checkJettonMinter(jettonMinterAddress, jettonMinterCodeRaw, jettonWalletCode, provider, ui, isTestnet, true);
        if (!provider.sender().address!.equals(adminAddress)) {
            ui.write('You are not admin of this jetton minter');
            return;
        }

        await jettonMinterContract.sendUpgrade(
	        provider.sender(),
	        jettonMinterCodeRaw,
	        jettonMinterConfigToCell({
	            admin: adminAddress,
	            wallet_code: jettonWalletCode,
	            jetton_content: {uri: jettonMetadataUri}
	        })
        );

        ui.write('Transaction sent');

}
