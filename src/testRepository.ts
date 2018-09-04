import { fsPath, metaFileName } from './repositoryPath'
import {
  remove,
  emptyDir,
  ensureFile,
  ensureDir,
  writeJson
} from 'fs-extra'
import { dirname } from 'path'
import { entryLiterals, IEntryLiteral } from './testRepositoryData'
import { IRepositoryOptions } from './types'

const writeMetaData = async (options: IRepositoryOptions, entryLiteral: IEntryLiteral) => {
  const metaFile = metaFileName(entryLiteral.entry.id, options)
  await ensureDir(dirname(metaFile))
  await writeJson(metaFile, entryLiteral.metaData)
}

export const create = async (options: IRepositoryOptions): Promise<void> => {
  await emptyDir(options.path)

  await Promise.all(
    entryLiterals.map(
      async entryLiteral => {
        if (entryLiteral.metaData) {
          await writeMetaData(options, entryLiteral)
        }

        const expandedId = fsPath(entryLiteral.entry.id, options)
        if (entryLiteral.entry.isFile) {
          await ensureDir(dirname(expandedId))
          await ensureFile(expandedId)
        } else {
          await ensureDir(expandedId)
        }
      }
    )
  )
}

export const erase = async (options: IRepositoryOptions): Promise<void> => await remove(options.path)
