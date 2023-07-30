import cp from 'node:child_process'
import fs from 'node:fs'
import { expect, test, vi, beforeEach } from 'vitest'
import safaridriver from '../src/index.js'

vi.mock('node:child_process', () => ({
    default: {
        execFile: vi.fn().mockReturnValue({ kill: vi.fn() })
    }
}))

vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn().mockReturnValue(true)
    }
}))

beforeEach(() => {
    vi.mocked(cp.execFile).mockClear()
})

test('can start driver with default values', () => {
    safaridriver.start()
    expect(cp.execFile).toBeCalledWith(
        '/usr/bin/safaridriver',
        ['--port=4444']
    )
    safaridriver.stop()
})

test('can start STP driver with default values', () => {
    safaridriver.start({ useTechnologyPreview: true })
    expect(cp.execFile).toBeCalledWith(
        '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver',
        ['--port=4444']
    )
    safaridriver.stop()
})

test('throws if start is called twice', () => {
    safaridriver.start()
    expect(() => safaridriver.start()).toThrow()
    safaridriver.stop()
})

test('throws if STP is not installed', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(() => safaridriver.start({ useTechnologyPreview: true })).toThrow(/not installed/)
    safaridriver.stop()
})

test('can start with options', () => {
    safaridriver.start({
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

test('can stop server', () => {
    const intance = safaridriver.start()
    safaridriver.stop()
    expect(intance.kill).toBeCalledTimes(5)
})
