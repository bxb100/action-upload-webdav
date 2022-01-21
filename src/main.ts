import * as path from 'path'
import {filePaths, parseConfig, unmatchedPatterns} from './util'
import {info, notice, setFailed} from '@actions/core'
import {createClient} from 'webdav'

async function run(): Promise<void> {
    const config = parseConfig()

    const patterns = await unmatchedPatterns(config.files)
    for (const pattern of patterns) {
        info(`🤔 Pattern '${pattern}' does not match any files.`)
    }
    if (patterns.length > 0 && config.failOnUnmatchedFiles) {
        throw new Error(`⛔ There were unmatched files`)
    }

    const files = await filePaths(config.files)
    if (files.length === 0) {
        info(`🤔 ${config.files} not include valid file.`)
    }

    const client = createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword
    })

    // first be sure there are have directory
    await client.createDirectory(config.webdavUploadPath, {recursive: true})
    for (const file of files) {
        const uploadPath = path.join(
            config.webdavUploadPath,
            path.basename(file)
        )
        try {
            await client.putFileContents(uploadPath, file)
        } catch (error) {
            notice(`⛔ Failed to upload file '${file}' to '${uploadPath}'`)
        }
    }
}

run().catch(err => setFailed(err.message))
