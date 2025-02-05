import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type MinerConfig = {
    owner_addr: Address,
    jwall_addr: Address,
};

export function minerConfigToCell(config: MinerConfig): Cell {
    return beginCell()
    .storeAddress(config.owner_addr)
    .storeAddress(config.jwall_addr)
    .storeUint(199019326488377187295146064050237495375, 128)
    .storeUint(411376139330301510538742295639337626245683966408394965837152256, 256)
    .storeUint(0, 64)
    .storeUint(0, 64)
    .storeUint(0, 8)
    .storeUint(0, 8)
    .endCell();
}

export const Opcodes = {
    mine: 0x4d696e65,
    transfer_notification: 0x7362d09c,
    change_settings: 100,
};

export class Miner implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Miner(address);
    }

    static createFromConfig(config: MinerConfig, code: Cell, workchain = 0) {
        const data = minerConfigToCell(config);
        const init = { code, data };
        return new Miner(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
