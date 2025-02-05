import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type MinerConfig = {
    owner_addr: Address,
    jwall_addr: Address,
    seed: number,
    pow_complexity: number,
    last_success: number,
    target_delta: number,
    min_cpl: number,
    max_cpl: number,
};

export function minerConfigToCell(config: MinerConfig): Cell {
    return beginCell()
    .storeAddress(config.owner_addr)
    .storeAddress(config.jwall_addr)
    .storeUint(config.seed, 128)
    .storeUint(config.pow_complexity, 256)
    .storeUint(config.last_success, 64)
    .storeUint(config.target_delta, 64)
    .storeUint(config.min_cpl, 64)
    .storeUint(config.max_cpl, 64)
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
