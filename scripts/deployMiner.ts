import { toNano } from '@ton/core';
import { Miner } from '../wrappers/Miner';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const miner = provider.open(
        Miner.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Miner')
        )
    );

    await miner.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(miner.address);

    console.log('ID', await miner.getID());
}
