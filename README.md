__Working on https://github.com/bxb100/action-upload__

<div align="center">
  :outbox_tray: :octocat:
</div>
<h1 align="center">
  action upload-webdav
</h1>
<p align="center">
A Github Action for uploading files to a <a href="http://www.webdav.org/">WebDAV</a> server
</p>

## :cartwheeling: Usage

```yaml
  uses: bxb100/action-upload-webdav@v1
  with:
    webdav_address: ${{secrets.address}}
    webdav_username: ${{secrets.username}}
    webdav_password: ${{secrets.password}}
    webdav_upload_path: "/data"
    files: "./test/**"
 ```

> :warning: for security purpose, please use Actions Secrets.
> See <https://docs.github.com/en/actions/security-guides/encrypted-secrets> for more information.

## :writing_hand: All Parameters

| Input                     | Description                                                                                                                                                                           | Default |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `webdav_address`          | WebDAV address                                                                                                                                                                        | -       |
| `webdav_username`         | WebDAV username                                                                                                                                                                       | -       |
| `webdav_password`         | WebDAV password                                                                                                                                                                       | -       |
| `webdav_upload_path`      | The WebDAV path where you want to upload. Some servers may not support the root path                                                                                                  | -       |
| [`files`](#files)         | Newline-delimited list of path globs for asset files to upload <br> :feet: You can learn more about multi-line YAML syntax [here](https://yaml-multiline.info/)                       | -       |
| `fail_on_unmatched_files` | Fail the action if there exists an unmatched file pattern                                                                                                                             | false   |
| `keep_structure`          | Keep the directory structure of the files<br/> **Only supports a single search path**, [rule](https://github.com/actions/toolkit/blob/main/packages/glob/src/internal-globber.ts#L27) | false   |

> :no_bicycles: This project only supports basic authentication
>
> :warning: If the upload path contains an existing filename, the file will be overwritten

## :potted_plant: Details

### files

Use the [@action/glob](https://github.com/actions/toolkit/tree/main/packages/glob) to search for files matching glob
patterns. You can set multiple patterns.

<details>
<summary>Pattern Details</summary>

### Patterns

#### Glob behavior

Patterns `*`, `?`, `[...]`, `**` (globstar) are supported.

With the following behaviors:

- File names that begin with `.` will be included in the results
- Case-insensitive on Windows
- Directory separators `/` and `\` are both supported on Windows

#### Tilde expansion

Supports basic tilde expansion, for current-user HOME replacement only.

Example:

- `~` may expand to /Users/johndoe
- `~/foo` may expand to /Users/johndoe/foo

#### Comments

Patterns that begin with `#` are treated as comments.

#### Exclude patterns

Leading `!` changes the meaning of an include pattern to exclude.

Multiple leading `!` flips the meaning.

#### Escaping

Escape special glob characters by wrapping in `[]`. For example the literal file name `hello[a-z]` can be escaped as `hello[[]a-z]`.

On Linux/macOS `\` is also treated as an escape character.

</details>

## :book: Thanks

- [action-gh-release](https://github.com/softprops/action-gh-release)
- [toolkit](https://github.com/actions/toolkit)
- [webdav-client](https://github.com/perry-mitchell/webdav-client)
