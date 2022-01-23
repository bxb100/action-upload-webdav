<div align="center">
  :outbox_tray: :octocat:
</div>
<h1 align="center">
  action upload-webdav
</h1>
<p align="center">
A Github Action for uploading files to a webdav server
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
> :warning: for security purpose, please using the environment variables, check in https://docs.github.com/en/actions/security-guides/encrypted-secrets
 
## :writing_hand: All Parameters

|Input|Description|Default|
|---|---|---|
|`webdav_address`|WebDAV address| - |
|`webdav_username`|WebDAV username| - |
|`webdav_password`|WebDAV password| - |
|`webdav_upload_path`| The WebDAV path where you want to upload, Some server not support root path | - |
|[`files`](#files)| Newline-delimited list of path globs for asset files to upload <br> :feet: You can learn more about multi-line yaml syntax [here](https://yaml-multiline.info/) | - |
|`fail_on_unmatched_files`|Fail the action when exist unmatch file pattern| false |
> :no_bicycles: Now we just support the basic authentication

## :potted_plant: Detail

### files
Using the [@action/glob](https://github.com/actions/toolkit/tree/main/packages/glob) to search for files matching glob patterns. You can set muliple pattern to active the search.

<details>
<summary>Pattern Details</summary>
  
### Patterns

#### Glob behavior

Patterns `*`, `?`, `[...]`, `**` (globstar) are supported.

With the following behaviors:
- File names that begin with `.` may be included in the results
- Case insensitive on Windows
- Directory separator `/` and `\` both supported on Windows

#### Tilde expansion

Supports basic tilde expansion, for current user HOME replacement only.

Example:
- `~` may expand to /Users/johndoe
- `~/foo` may expand to /Users/johndoe/foo

#### Comments

Patterns that begin with `#` are treated as comments.

#### Exclude patterns

Leading `!` changes the meaning of an include pattern to exclude.

Multiple leading `!` flips the meaning.

#### Escaping

Wrapping special characters in `[]` can be used to escape literal glob characters
in a file name. For example the literal file name `hello[a-z]` can be escaped as `hello[[]a-z]`.

On Linux/macOS `\` is also treated as an escape character.
  
</details>

## :book: Thanks
- [action-gh-release](https://github.com/softprops/action-gh-release)
- [toolkit](https://github.com/actions/toolkit)
- [webdav-client](https://github.com/perry-mitchell/webdav-client)
