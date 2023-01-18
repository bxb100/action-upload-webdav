import * as util from '../src/util'
import {run} from '../src/main'

describe('test webDav functionality', () => {
    const configSpy = jest.spyOn(util, 'parseConfig')

    /**
     * run httpd webdav docker:
     * docker run -e USERNAME=alice -e PASSWORD=secret1234 --publish 8080:80 -d bytemark/webdav
     *
     * maybe the reason https://adminswerk.de/httpd-24-webdav-error-405/
     */
    it('github issue #52 test upload failed', async () => {
        configSpy.mockImplementation(() => {
            return {
                webdavAddress: 'http://localhost:8080',
                webdavUsername: 'alice',
                webdavPassword: 'secret1234',
                webdavUploadPath: '/',
                files: ['./test/nuxt/*'],
                keepStructure: true,
                failOnUnmatchedFiles: false
            }
        })
        await run()
    })
})
