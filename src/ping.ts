import {createClient} from 'webdav'
import {parseConfig} from './util'
import {setFailed} from '@actions/core'

export const ping = async (): Promise<void> => {
    const config = parseConfig()
    createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword
    })
}

ping().catch(err => setFailed(`🙀 failed to connect the server: ${err}`))
