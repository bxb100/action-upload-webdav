import {ping} from '../src/ping'
import * as util from '../src/util'

jest.mock('../src/util')

describe('WebDAV link test', () => {
    const configSpy = jest.spyOn(util, 'parseConfig')

    it('ping failure', () => {
        configSpy.mockImplementation(() => {
            return {
                webdavAddress: 'http://xxx:5999',
                webdavUsername: 'xx',
                webdavPassword: 'mushily&flop&fit7',
                webdavUploadPath: '',
                files: [''],
                keepStructure: false,
                failOnUnmatchedFiles: false,
                fastFail: false
            }
        })
        return expect(async () => await ping()).rejects.toThrowError(
            'getaddrinfo ENOTFOUND xxx'
        )
    })

    it('ping success', async () => {
        configSpy.mockImplementation(() => {
            return {
                webdavAddress: 'http://localhost:8080',
                webdavUsername: 'alice',
                webdavPassword: 'secret1234',
                webdavUploadPath: '',
                files: [''],
                keepStructure: false,
                failOnUnmatchedFiles: false,
                fastFail: false
            }
        })

        return expect(ping()).resolves.toBeTruthy()
    }, 5000)

    afterEach(() => {
        configSpy.mockRestore()
    })
})
