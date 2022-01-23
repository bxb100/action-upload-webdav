import {info, setFailed} from '@actions/core'
import {createClient} from 'webdav'
import {parseConfig} from './util'

export const ping = async (): Promise<void> => {
    const config = parseConfig()
    createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword
    })
    info('👻 Connect success')
}

ping().catch(err => setFailed(`🙀 failed to connect the server: ${err}`))
