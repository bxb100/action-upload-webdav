import * as path from 'path'
import {
    filePaths,
    parseConfig,
    pathMeta,
    searchPaths,
    unmatchedPatterns
} from './util'
import {info, notice, setFailed} from '@actions/core'
import {createClient} from 'webdav'
import {createReadStream} from 'fs'

export async function run(): Promise<void> {
    const config = parseConfig()

    const patterns = await unmatchedPatterns(config.files)
    for (const pattern of patterns) {
        notice(`🤔 Pattern '${pattern}' does not match any files.`)
    }
    if (patterns.length > 0 && config.failOnUnmatchedFiles) {
        throw new Error(`⛔ There were unmatched files`)
    }
    // if (config.webdavUploadPath === '/') {
    //     throw new Error(`⛔ 'webdav_upload_path' cannot be '/'`)
    // }

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

    // noinspection PointlessBooleanExpressionJS
    if ((await client.exists(config.webdavUploadPath)) === false) {
        await client.createDirectory(config.webdavUploadPath, {recursive: true})
    }
    for (const file of files) {
        let uploadPath = path.join(config.webdavUploadPath, path.basename(file))
        if (config.keepStructure) {
            const meta = pathMeta(file, searchPath)
            await client.createDirectory(
                path.join(config.webdavUploadPath, meta.dir),
                {recursive: true}
            )
            uploadPath = path.join(config.webdavUploadPath, meta.dir, meta.base)
        }

        try {
            info(`📦 Uploading ${file} to ${uploadPath}`)
            createReadStream(file).pipe(client.createWriteStream(uploadPath))
            notice(`🎉 Uploaded ${uploadPath}`)
        } catch (error) {
            info(`error: ${error}`)
            notice(`⛔ Failed to upload file '${file}' to '${uploadPath}'`)
        }
    }
}

run().catch(err => setFailed(err.message))
