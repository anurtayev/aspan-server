import {
  remove,
  emptyDir,
  ensureFile,
  ensureDir,
  writeJson
} from 'fs-extra'
import { join, dirname, basename } from 'path'
import { entryLiterals, IEntryLiteral } from './testRepositoryData'
import { IRepositoryOptions, IEntry } from './types'

export const create = async (options: IRepositoryOptions): Promise<void> => {
  await emptyDir(options.path)

  entryLiterals.forEach(async (entryLiteral) => {
    if (entryLiteral.metaData) {
      await writeMetaData(options, entryLiteral)
    }

    const expandedId = expandId(options, entryLiteral.entry)
    if (entryLiteral.entry.isFile) {
      await ensureDir(dirname(expandedId))
      await ensureFile(expandedId)
    } else {
      await ensureDir(expandedId)
    }
  })
}

export const erase = async (options: IRepositoryOptions): Promise<void> => await remove(options.path)

const writeMetaData = async (options: IRepositoryOptions, entryLiteral: IEntryLiteral) => {
  const metaFile = join(
    options.path,
    dirname(entryLiteral.entry.id),
    options.metaFolderName,
    `${basename(entryLiteral.entry.id)}.json`
  )

  await ensureDir(dirname(metaFile))
  await writeJson(metaFile, entryLiteral.metaData)
}

const expandId = (options: IRepositoryOptions, entry: IEntry): string => join(
  options.path,
  entry.id
)
