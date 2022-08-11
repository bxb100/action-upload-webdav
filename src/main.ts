import * as path from 'path'
import {filePaths, parseConfig, unmatchedPatterns} from './util'
import {info, notice, setFailed} from '@actions/core'
import {createClient} from 'webdav'
import {createReadStream} from 'fs'
import {Agent} from 'https'

async function run(): Promise<void> {
    const config = parseConfig()

    const patterns = await unmatchedPatterns(config.files)
    for (const pattern of patterns) {
        notice(`🤔 Pattern '${pattern}' does not match any files.`)
    }
    if (patterns.length > 0 && config.failOnUnmatchedFiles) {
        throw new Error(`⛔ There were unmatched files`)
    }

    const files = await filePaths(config.files)
    if (files.length === 0) {
        notice(`🤔 ${config.files} not include valid file.`)
    }

    let HttpsAgent

    if (config.webdavCert || config.webdavCa || config.webdavKey) {
        HttpsAgent = new Agent({
            cert: config.webdavCert,
            ca: config.webdavCa,
            key: config.webdavKey
        })
    }

    const client = createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword,
        httpsAgent: HttpsAgent
    })

    // first be sure there are have directory
    if ((await client.exists(config.webdavUploadPath)) === false) {
        await client.createDirectory(config.webdavUploadPath, {recursive: true})
    }

    // Upload zip files
    for (const file of files) {
        const uploadPath = path.join(
            config.webdavUploadPath,
            path.basename(file)
        )
        try {
            const readStream = createReadStream(file)
            const writeStream = client.createWriteStream(uploadPath)

            if (await client.exists(uploadPath)) {
                info(`📦 Cleaning up ${uploadPath} first`)
                await client.deleteFile(uploadPath)
                notice(`🎉 Cleaned up ${uploadPath}`)
            }

            info(`📦 Uploading ${file} to ${uploadPath}`)
            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream)

                // DEBUG
                writeStream.on('unpipe', () => info('unpipe'))
                writeStream.on('finish', () => info('finish'))
                writeStream.on('end', () => info('end'))
                writeStream.on('close', () => info('close'))
                // DEBUG

                writeStream.on('close', resolve)
                writeStream.on('error', reject)
            })
            notice(`🎉 Uploaded ${uploadPath}`)

            let checkTries = 0

            while (!(await client.exists(uploadPath)) && checkTries++ < 10) {
                await new Promise(r => setTimeout(r, 1000)) // sleep for 1s
                info(`⏳ Waiting for ${uploadPath} to become available`)
            }

            info(`📦 Unzipping ${uploadPath}`)
            await client.customRequest(uploadPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'method=UNZIP'
            })
            notice(`🎉 Unzipped ${uploadPath}`)

            info(`📦 Removing ${uploadPath}`)
            await client.deleteFile(uploadPath)
            notice(`🎉 Removed ${uploadPath}`)
        } catch (error) {
            info(`error: ${error}`)
            notice(`⛔ Failed to upload file '${file}' to '${uploadPath}'`)
            throw error
        }
    }
}

run().catch(err => setFailed(err.message))
