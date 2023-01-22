import * as util from '../src/util'
import {run} from '../src/main'

describe('test webDav functionality', () => {
    const configSpy = jest.spyOn(util, 'parseConfig')

    /**
     * run httpd webdav docker:
     * docker run -e USERNAME=alice -e PASSWORD=secret1234 --publish 8080:80 -d bytemark/webdav
     *
     * `PROPFIND` will cause 405 error, maybe the reason https://adminswerk.de/httpd-24-webdav-error-405/
     * add `DirectoryIndex disabled` solved
     */
    it('github issue #52 test upload failed', async () => {
        configSpy.mockImplementation(() => {
            return {
                webdavAddress: 'http://localhost:8080',
                webdavUsername: 'alice',
                webdavPassword: 'secret1234',
                webdavUploadPath: '/',
                files: ['./test/*'],
                keepStructure: true,
                failOnUnmatchedFiles: false,
                fastFail: false
            }
        })
        await expect(run()).resolves.not.toThrowError()
        await expect(run()).resolves.not.toThrowError()
    })
})
