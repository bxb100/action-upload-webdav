import {debug, info, setFailed} from '@actions/core'
import {createClient} from 'webdav'
import {parseConfig} from './util'

export const ping = async (): Promise<Boolean> => {
    const config = parseConfig()
    debug(`config: ${JSON.stringify(config)}`)
    return createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword
    })
        .exists('/')
        .then(exist => {
            info('👻 Connect success')
            return exist
        })
}

ping().catch(err => {
    setFailed(`🙀 failed to connect the server: ${err.message}`)
})
