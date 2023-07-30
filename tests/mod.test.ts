import cp from 'node:child_process'
import fs from 'node:fs/promises'
import { expect, test, vi, beforeEach } from 'vitest'
import safaridriver from '../src/index.js'

vi.mock('node:child_process', () => ({
    default: {
        execFile: vi.fn().mockReturnValue({ kill: vi.fn() })
    }
}))

vi.mock('node:fs/promises', () => ({
    default: {
        access: vi.fn().mockResolvedValue(undefined)
    }
}))

beforeEach(() => {
    vi.mocked(cp.execFile).mockClear()
})

test('can start driver with default values', async () => {
    await safaridriver.start()
    expect(cp.execFile).toBeCalledWith(
        '/usr/bin/safaridriver',
        ['--port=4444']
    )
    safaridriver.stop()
})

test('can start STP driver with default values', async () => {
    await safaridriver.start({ useTechnologyPreview: true })
    expect(cp.execFile).toBeCalledWith(
        '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver',
        ['--port=4444']
    )
    safaridriver.stop()
})

test('throws if start is called twice', async () => {
    await safaridriver.start()
    await expect(() => safaridriver.start()).rejects.toThrow()
    safaridriver.stop()
})

test('throws if STP is not installed', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('not installed'))
    await expect(() => safaridriver.start({ useTechnologyPreview: true })).rejects.toThrow(/not installed/)
    safaridriver.stop()
})

test('can start with options', async () => {
    await safaridriver.start({
        port: 1234,
        path: '/foo/bar',
        enable: true,
        diagnose: true
    })
    expect(cp.execFile).toBeCalledWith('/foo/bar', [
        '--port=1234',
        '--enable',
        '--diagnose'
    ])
    safaridriver.stop()
})

test('can stop server', async () => {
    const intance = await safaridriver.start()
    safaridriver.stop()
    expect(intance.kill).toBeCalledTimes(5)
})
