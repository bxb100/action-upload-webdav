import {filePaths, unmatchedPatterns} from '../src/util'
import * as assert from 'assert'
import * as path from 'path'

describe('util', () => {
    describe('paths', () => {
        it('expect github glob function', async () => {
            assert.deepStrictEqual(
                await filePaths(['test/data/**/*', 'test/data/does/not/exist/*']),
                [path.resolve(__dirname, '../test/data/foo/test-imge.jpg')]
            )
        })
    })

    describe('unmatchedPatterns', () => {
        it("returns the patterns that don't match any files", async () => {
            assert.deepStrictEqual(
                await unmatchedPatterns([
                    'test/data/**/*',
                    'test/data/does/not/exist/*'
                ]),
                ['test/data/does/not/exist/*']
            )
        })
    })
})
