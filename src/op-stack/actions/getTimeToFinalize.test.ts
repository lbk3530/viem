import { beforeAll, describe, expect, test, vi } from 'vitest'
import {
  anvilMainnet,
  anvilOptimism,
  anvilOptimismSepolia,
  anvilSepolia,
} from '../../../test/src/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getWithdrawals, optimism } from '../../op-stack/index.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'

const client = anvilMainnet.getClient()
const sepoliaClient = anvilSepolia.getClient()
const optimismClient = anvilOptimism.getClient()
const optimismSepoliaClient = anvilOptimismSepolia.getClient()

// TODO(fault-proofs): use `client` when fault proofs deployed to mainnet.
test('default', async () => {
  const receipt = await getTransactionReceipt(optimismSepoliaClient, {
    hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1711008145099))

  const time = await getTimeToFinalize(sepoliaClient, {
    ...withdrawal!,
    targetChain: optimismSepoliaClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 583844,
      "timestamp": 1711591989099,
    }
  `)
})

// TODO(fault-proofs): use `client` when fault proofs deployed to mainnet.
test('ready to finalize', async () => {
  const receipt = await getTransactionReceipt(optimismSepoliaClient, {
    hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1711591989099))

  const time = await getTimeToFinalize(sepoliaClient, {
    ...withdrawal!,
    targetChain: optimismSepoliaClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 0,
      "timestamp": 1711591989099,
    }
  `)
})

describe('legacy (portal v2)', () => {
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 18770525n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
  })

  test('default', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
    })

    const [withdrawal] = getWithdrawals(receipt)

    vi.setSystemTime(new Date(1702399191000))

    const time = await getTimeToFinalize(client, {
      ...withdrawal!,
      targetChain: optimism,
    })

    vi.useRealTimers()

    expect(time).toMatchInlineSnapshot(`
      {
        "period": 604800,
        "seconds": 594810,
        "timestamp": 1702994001000,
      }
    `)
  })

  test('ready to finalize', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
    })

    const [withdrawal] = getWithdrawals(receipt)

    vi.setSystemTime(new Date(1702994990587))

    const time = await getTimeToFinalize(client, {
      ...withdrawal!,
      targetChain: optimism,
    })

    vi.useRealTimers()

    expect(time).toMatchInlineSnapshot(`
      {
        "period": 604800,
        "seconds": 0,
        "timestamp": 1702994990587,
      }
    `)
  })
})
