import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type MinerConfig = {
    owner_addr: Address,
    jwall_addr: Address,
    seed: bigint,
    pow_complexity: bigint,
    last_success: bigint,
    target_delta: bigint,
    min_cpl: bigint,
    max_cpl: bigint,
};

export function minerConfigToCell(config: MinerConfig): Cell {
    return beginCell()
    .storeAddress(config.owner_addr)
    .storeAddress(config.jwall_addr)
    .storeUint(config.seed, 128)
    .storeUint(config.pow_complexity, 256)
    .storeUint(config.last_success, 64)
    .storeUint(config.target_delta, 64)
    .storeUint(config.min_cpl, 8)
    .storeUint(config.max_cpl, 8)
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

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
