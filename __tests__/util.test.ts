import {filePaths, unmatchedPatterns} from '../src/util'
import * as assert from 'assert'
import * as path from 'path'

const rootPath = path.join(__dirname, '..')

describe('util', () => {
    describe('paths', () => {
        it('expect github glob function', async () => {
            assert.deepStrictEqual(
                await filePaths(['test/data/**', 'test/data/does/not/exist/*']),
                [path.join(rootPath, 'test/data/foo/test-imge.jpg')]
            )
        })

        it('special pattern', async () => {
            assert.deepStrictEqual(await filePaths(['test/*-*/**']), [
                path.join(rootPath, 'test/aa-bb/text.txt')
            ])
        })

        it('special filetype', async () => {
            assert.deepStrictEqual(await filePaths(['test/*-*/*.txt']), [
                path.join(rootPath, 'test/aa-bb/text.txt')
            ])
            assert.deepStrictEqual(await filePaths(['test/**/*.txt']), [
                path.join(rootPath, 'test/aa-bb/text.txt')
            ])
            assert.deepStrictEqual(await filePaths(['test/**/*.jpg']), [
                path.join(rootPath, 'test/data/foo/test-imge.jpg')
            ])
            assert.deepStrictEqual(await filePaths(['test/**/*-*.*']), [
                path.join(rootPath, 'test/data/foo/test-imge.jpg')
            ])
        })

        it('exclue filetype', async () => {
            assert.deepStrictEqual(await filePaths(['test/**', '!**/*.txt']), [
                path.join(rootPath, 'test/data/foo/test-imge.jpg')
            ])
            assert.deepStrictEqual(await filePaths(['!**/*.txt']), [])
        })
    })

    describe('unmatchedPatterns', () => {
        it("returns the patterns that don't match any files", async () => {
            assert.deepStrictEqual(
                await unmatchedPatterns([
                    'test/data/**',
                    'test/data/does/not/exist/*'
                ]),
                ['test/data/does/not/exist/*']
            )
        })
    })
})
