import fs from 'node:fs'
import cp, { type ChildProcess } from 'node:child_process'

export const DEFAULT_PATH = '/usr/bin/safaridriver'
export const DEFAULT_STP_PATH = '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver'
export const DEFAULT_PORT = 4444

export interface SafaridriverOptions {
    /**
     * Specifies the port on which the HTTP server should listen for incoming connections.
     * If the port is already in use or otherwise unavailable, Safaridriver will exit
     * immediately with a non-zero return code.
     * @default 4444
     */
    port?: number
    /**
     * Path to Safaridriver binary.
     * @default /usr/bin/safaridriver
     */
    path?: string
    /**
     * Applies configuration changes so that subsequent WebDriver sessions will run without
     * further authentication. This includes checking "Enable Remote Automation" in Safari's
     * `Develop` menu. The user must authenticate via password for the changes to be applied.
     *
     * When this option is specified, safaridriver exits immediately without starting up the
     * REST API service. If the changes were successful or already applied, safaridriver exits 0;
     * otherwise, safaridriver exits >0 and prints an error message to stderr.
     * @default false
     */
    enable?: boolean
    /**
     * Enables diagnostic logging for all sessions hosted by this safaridriver instance.
     * @default false
     */
    diagnose?: boolean
    /**
     * If enabled, it starts the Safaridriver binary from the Safari Technology Preview app.
     */
    useTechnologyPreview?: boolean
}

let instance: ChildProcess
let instanceOptions: SafaridriverOptions
export const start = (options: SafaridriverOptions = {}) => {
    const port = typeof options.port === 'number' ? options.port : DEFAULT_PORT
    const args: string[] = [`--port=${port}`]
    const driverPath = options.path || (
        options.useTechnologyPreview
            ? DEFAULT_STP_PATH
            : DEFAULT_PATH
    )

    const isSTPInstalled = options.useTechnologyPreview && fs.existsSync(DEFAULT_STP_PATH)
    if (options.useTechnologyPreview && !isSTPInstalled) {
        throw new Error(
            'Safari Technology Preview is not installed! Please go to ' +
            'https://developer.apple.com/safari/technology-preview/ and install it.'
        )
    }

    if (options.enable) {
        args.push('--enable')
    }

    if (options.diagnose) {
        args.push('--diagnose')
    }

    if (instance) {
        throw new Error(`There is already a Safaridriver instance running on port ${instanceOptions.port}!`)
    }

    instanceOptions = options
    instance = cp.execFile(driverPath, args)
    return instance
}

export const stop = () => {
    if (instance) {
        instance.kill()
        instance = undefined
    }
}

export default { start, stop }
