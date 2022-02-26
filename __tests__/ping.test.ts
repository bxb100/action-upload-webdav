import * as assert from 'assert'
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
                failOnUnmatchedFiles: false
            }
        })
        return expect(async () => await ping()).rejects.toThrowError(
            'getaddrinfo ENOTFOUND xxx'
        )
    })

    it('ping success',() => {
        configSpy.mockImplementation(() => {
            return {
                webdavAddress: 'http://jojo-nas-one:5999',
                webdavUsername: 'webdav-user',
                webdavPassword: 'mushily&flop&fit7',
                webdavUploadPath: '',
                files: [''],
                failOnUnmatchedFiles: false
            }
        })
        return expect(async () => await ping()).toBeTruthy()
    })

    afterEach(() => {
        configSpy.mockRestore()
    })
})
