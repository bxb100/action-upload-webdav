import {filePaths, searchPaths, unmatchedPatterns} from '../src/util'
import * as assert from 'assert'
import * as path from 'path'

const rootPath = path.join(__dirname, '..')

describe('util', () => {
    describe('paths', () => {
        it('test get search path', async () => {
            assert.equal(
                path.join(rootPath, 'cs/a'),
                await searchPaths(['cs/a/*'])
            )
            assert.deepStrictEqual(
                [path.join(rootPath, 'cs/a'), path.join(rootPath, 'cs/b')],
                await searchPaths(['cs/a/*', 'cs/b/*'])
            )
        })

        it('expect github glob function', async () => {
            assert.deepStrictEqual(await filePaths(['test/data/**']), [
                path.join(rootPath, 'test/data/foo/test-imge.jpg')
            ])
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

        it('exclude file', async () => {
            assert.deepStrictEqual(
                await unmatchedPatterns([
                    'test/data/**',
                    'test/data/does/not/exist/*',
                    '!**/*.txt'
                ]),
                ['test/data/does/not/exist/*']
            )
        })

        it('github issue 30: not found ftl file', async () => {
            console.info(`leading . segment will replace`, process.cwd())

            assert.deepStrictEqual(
                await filePaths(['./__tests__/staging/**/*.ftl']),
                [
                    path.join(rootPath, '__tests__/staging/a.ftl'),
                    path.join(rootPath, '__tests__/staging/other/b.ftl')
                ]
            )

            assert.deepStrictEqual(await filePaths(['./**/staging/**/*.ftl']), [
                path.join(rootPath, '__tests__/staging/a.ftl'),
                path.join(rootPath, '__tests__/staging/other/b.ftl')
            ])

            assert.deepStrictEqual(
                await filePaths(['./__tests__/staging/*.ftl']),
                [path.join(rootPath, '__tests__/staging/a.ftl')]
            )
        })
    })
})
