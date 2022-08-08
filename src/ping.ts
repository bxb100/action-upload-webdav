import {debug, info, setFailed} from '@actions/core'
import {createClient} from 'webdav'
import {parseConfig} from './util'
import {Agent} from 'https'

export const ping = async (): Promise<Boolean> => {
    const config = parseConfig()

    let httpsAgent;

    if (config.webdavCert || config.webdavCa || config.webdavKey) {
        httpsAgent = new Agent({
            cert: config.webdavCert,
            ca: config.webdavCa,
            key: config.webdavKey,
        })
    }

    debug(`config: ${JSON.stringify(config)}`)
    return createClient(config.webdavAddress, {
        username: config.webdavUsername,
        password: config.webdavPassword,
        httpsAgent: httpsAgent
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
