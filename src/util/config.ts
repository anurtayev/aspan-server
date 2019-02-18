import * as dotenv from 'dotenv'
import * as assert from 'assert'
import { IRepositoryOptions } from '../types'

dotenv.config()

const DEFAULT_META_FOLDER = '.aspan'
const DEFAULT_THUMBS_PREFIX = 'thumb_'
const DEFAULT_THUMBS_LENGTH = 200
const DEFAULT_THUMBS_WIDTH = 200
const DEFAULT_EXTS = ['jpg']

const path = process.env.REPOSITORY_PATH as string
assert(path, 'configuration error: repository path is missing')
const metaFolderName =
  (process.env.META_FOLDER as string) || DEFAULT_META_FOLDER
const thumbsPrefix =
  (process.env.THUMB_PREFIX as string) || DEFAULT_THUMBS_PREFIX
const thumbsLength =
  parseInt(process.env.THUMBS_LENGTH as string, 10) || DEFAULT_THUMBS_LENGTH
const thumbsWidth =
  parseInt(process.env.THUMBS_WIDTH as string, 10) || DEFAULT_THUMBS_WIDTH
const exts = (process.env.EXTS as string).split(',') || DEFAULT_EXTS

export const options: IRepositoryOptions = {
  metaFolder: metaFolderName,
  path,
  thumbsPrefix,
  thumbsLength,
  thumbsWidth,
  exts
}
