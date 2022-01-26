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

function checkStat(path: string): boolean {
    // exclude .DS_Store
    if (path.endsWith('.DS_Store')) {
        return false
    }
    return statSync(path).isFile()
}

const patterSplit = (
    patterns: string[]
): {include: string[]; exclude: string[]} => {
    const include: string[] = []
    const exclude: string[] = []
    for (const pattern of patterns) {
        if (pattern.startsWith('!')) {
            exclude.push(pattern)
        } else {
            include.push(pattern)
        }
    }
    return {include, exclude}
}

export const unmatchedPatterns = async (
    patterns: string[]
): Promise<string[]> => {
    const {include, exclude} = patterSplit(patterns)
    const result: string[] = []
    await Promise.all(
        include.map(async pattern => {
            await glob
                .create([pattern, ...exclude].join('\n'))
                .then(async globber => globber.glob())
                .then(files => {
                    if (!files.some(checkStat)) {
                        result.push(pattern)
                    }
                })
        })
    )
    return result
}

export const filePaths = async (patterns: string[]): Promise<string[]> => {
    const {include, exclude} = patterSplit(patterns)
    const result: string[] = []
    await Promise.all(
        include.map(async pattern => {
            await glob
                .create([pattern, ...exclude].join('\n'))
                .then(async globber => globber.glob())
                .then(files => {
                    result.push(...files.filter(checkStat))
                })
        })
    )
    return result
}
