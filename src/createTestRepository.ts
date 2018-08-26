import {
  remove,
  emptyDir,
  ensureFile,
  ensureDir,
  writeJson
} from 'fs-extra'
import { join, dirname } from 'path'
import { entryLiterals, IEntryLiteral } from './testData'
import { IRepositoryOptions } from './types'

export const create = async (options: IRepositoryOptions): Promise<void> => {
  await emptyDir(options.path)
  const initialRelativePath = '/'
  await handleEntryLiterals(options, initialRelativePath, entryLiterals)
}

export const erase = async (options: IRepositoryOptions): Promise<void> => await remove(options.path)

const handleEntryLiterals = async (options: IRepositoryOptions, relativePath: string, entries: IEntryLiteral[]) => {
  await Promise.all(
    entries.map(
      async (entryLiteral: IEntryLiteral): Promise<void> => {
        if (entryLiteral.metaData) {
          await writeMetaData(options, entryLiteral, relativePath)
        }

        const entryLiteralId = join(options.path, relativePath, entryLiteral.entry.id)
        if (entryLiteral.entry.isFile) {
          await ensureFile(entryLiteralId)
        } else {
          await ensureDir(entryLiteralId)
          if (entryLiteral.entries) {
            await handleEntryLiterals(options, join(relativePath, entryLiteral.entry.id), entryLiteral.entries)
          }
        }
      }
    )
  )
}

const writeMetaData = async (
  options: IRepositoryOptions,
  entryLiteral: IEntryLiteral,
  relativePath: string
) => {
  const metaFile = join(
    options.path,
    relativePath,
    options.metaFolderName,
    `${entryLiteral.entry.id}.json`
  )

  await ensureDir(dirname(metaFile))
  await writeJson(metaFile, entryLiteral.metaData)
}
