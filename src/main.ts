import * as path from 'path'
import {
    filePaths,
    getAllDirectories,
    parseConfig,
    pathMeta,
    searchPaths,
    unmatchedPatterns
} from './util'
import {debug, info, notice, setFailed, summary} from '@actions/core'
import {createClient} from 'webdav'
import {createReadStream} from 'fs'
import {WebDAVClient} from 'webdav/dist/node/types'
import {SUMMARY_ENV_VAR} from '@actions/core/lib/summary'

export async function run(): Promise<void> {
    const config = parseConfig()

    const patterns = await unmatchedPatterns(config.files)
    for (const pattern of patterns) {
        notice(`🤔 Pattern '${pattern}' does not match any files.`)
    }
    if (patterns.length > 0 && config.failOnUnmatchedFiles) {
        throw new Error(`⛔ There were unmatched files`)
    }

    info(`Current directory: ${process.cwd()}`)
    const files = await filePaths(config.files)
    if (files.length === 0) {
        notice(`🤔 ${config.files} not include valid file.`)
    }
    const multiSearchPaths = await searchPaths(config.files)
    if (config.keepStructure && multiSearchPaths.length > 1) {
        throw new Error(
            `⛔ 'keep_structure' is not supported when multiple paths are specified`
        )
    }
    const searchPath = multiSearchPaths[0]

    const client = createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword
    })

    if (!(await client.exists(path.join(config.webdavUploadPath, '/')))) {
        await client.createDirectory(config.webdavUploadPath, {recursive: true})
    }

    const persistPath = new Set<string>()
    const successUpload: string[] = []
    const failedUpload: string[][] = []
    for (const file of files) {
        let uploadPath = path.join(config.webdavUploadPath, path.basename(file))
        if (config.keepStructure) {
            const meta = pathMeta(file, searchPath)
            await createWebDavDirectory(
                client,
                path.join(config.webdavUploadPath, meta.dir),
                persistPath
            )
            uploadPath = path.join(config.webdavUploadPath, meta.dir, meta.base)
        }
        info(`📦 Uploading ${file} to ${uploadPath}`)
        // ignore single file upload failed
        await upload(client, file, uploadPath).then(
            () => {
                successUpload.push(`* \`${uploadPath}\``)
            },
            error => {
                if (config.fastFail) {
                    throw error
                }
                info(`error: ${error.message}`)
                failedUpload.push([
                    `\`${file}\``,
                    `\`${uploadPath}\``,
                    `${error}`
                ])
            }
        )
    }
    if (process.env[SUMMARY_ENV_VAR]) {
        await summaryOutput(successUpload, failedUpload)
    }
}

async function summaryOutput(
    successUpload: string[],
    failedUpload: string[][]
): Promise<void> {
    const s = summary.addHeading('Upload Summary').addRaw('\n\n')
    if (successUpload.length > 0) {
        s.addRaw('## :rocket: Success Upload')
            .addRaw('\n\n')
            .addDetails('Details', `\n\n${successUpload.join('\n')}\n\n`)
    }
    if (failedUpload.length > 0) {
        s.addRaw('## :no_entry: Failed Upload')
            .addRaw('\n\n')
            .addTable([
                [
                    {data: 'File', header: true},
                    {data: 'Upload', header: true},
                    {data: 'Error', header: true}
                ],
                ...failedUpload
            ])
    }
    await s.write()
}

async function upload(
    client: WebDAVClient,
    origin: string,
    target: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            createReadStream(origin).pipe(
                client.createWriteStream(target, {}, response => {
                    const {status, data, headers} = response
                    debug(
                        `response status: ${status}, headers: ${JSON.stringify(
                            headers
                        )}, data: ${data}`
                    )
                    if (status >= 200 && status < 300) {
                        resolve()
                    } else {
                        reject(new Error(`status: ${status}, data: ${data}`))
                    }
                })
            )
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * fix path not end with '/' will cause 301 but axios not redirect
 *
 * http://www.webdav.org/specs/rfc4918.html#rfc.section.5.2
 * https://github.com/perry-mitchell/webdav-client/blob/e8e61fd7ce743278ba7486e5eee8f6d8f72d6f34/source/operations/createDirectory.ts#L31
 */
async function createWebDavDirectory(
    client: WebDAVClient,
    pathStr: string,
    set: Set<string>
): Promise<void> {
    const paths = getAllDirectories(pathStr)
    for (const p of paths) {
        if (set.has(p)) continue
        const temp = path.join(p, '/')
        if (!(await client.exists(temp))) {
            await client.createDirectory(temp)
        }
        set.add(p)
    }
}

run().catch(err => setFailed(err.message))
