import * as dotenv from 'dotenv'
import * as assert from 'assert'
import { IRepositoryOptions } from '../types'

dotenv.config()

const DEFAULT_META_FOLDER = '.aspan'
const DEFAULT_THUMBS_PREFIX = 'thumb_'

const path = process.env.REPOSITORY_PATH as string
assert(path, 'configuration error: repository path is missing')
const metaFolderName =
  (process.env.META_FOLDER as string) || DEFAULT_META_FOLDER
const thumbsPrefix =
  (process.env.THUMB_PREFIX as string) || DEFAULT_THUMBS_PREFIX

export const options: IRepositoryOptions = {
  metaFolder: metaFolderName,
  path,
  thumbsPrefix
}
