import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {statSync} from 'fs'

export interface Config {
    webdavAddress: string
    webdavUsername: string
    webdavPassword: string
    webdavUploadPath: string
    files: string[]
    failOnUnmatchedFiles: boolean
}

export const parseConfig = (): Config => {
    try {
        return {
            webdavAddress: core.getInput('webdav_address', {required: true}),
            webdavUsername: core.getInput('webdav_username', {required: true}),
            webdavPassword: core.getInput('webdav_password', {required: true}),
            webdavUploadPath: core.getInput('webdav_upload_path', {
                required: true
            }),
            files: core.getMultilineInput('files', {
                required: true,
                trimWhitespace: true
            }),
            failOnUnmatchedFiles: core.getBooleanInput(
                'fail_on_unmatched_files'
            )
        }
    } catch (error) {
        throw new Error(`⛔ Some Input is missing: ${error}`)
    }
}

export const unmatchedPatterns = async (
    patterns: string[]
): Promise<string[]> => {
    const result: string[] = []
    await Promise.all(
        patterns.map(async pattern => {
            await glob
                .create(pattern)
                .then(async globber => globber.glob())
                .then(files => {
                    if (!files.some(path => statSync(path).isFile())) {
                        result.push(pattern)
                    }
                })
        })
    )
    return result
}

export const filePaths = async (patterns: string[]): Promise<string[]> => {
    const result: string[] = []
    await Promise.all(
        patterns.map(async pattern => {
            await glob
                .create(pattern)
                .then(async globber => globber.glob())
                .then(files => {
                    result.push(
                        ...files.filter(path => statSync(path).isFile())
                    )
                })
        })
    )
    return result
}
