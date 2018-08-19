import {
  remove,
  emptyDir,
  ensureFile,
  ensureDir,
  writeJson,
  readJson
} from 'fs-extra'
import { join, dirname, basename } from 'path'
import r from 'ramda'

const writeInfo = async (ctx, f, i) => {
  const metad = join(
    ctx.path,
    dirname(f),
    ctx.metaFolder
  )

  const metaf = join(
    metad,
    `${basename(f)}.json`
  )

  await ensureDir(metad)
  await writeJson(metaf, i)
}

const createRepoFolder = async (ctx) => await emptyDir(ctx.path)

export const create = async (ctx) => {
  await createRepoFolder(ctx)
  await walk(ctx, '/', await readJson(join(__dirname, 'repoDef.json')))
}

const walk = async (ctx, path, albumDef) => {
  // write album meta
  const info = r.omit(['files', 'subAlbums'], albumDef)
  if (path !== '/' && objHasKeys(info)) {
    await writeInfo(ctx, path, info)
  }

  // process files
  if (objHasKeys(albumDef.files)) {
    await Promise.all(
      Object.keys(albumDef.files).map((_) =>
        ensureFile(join(ctx.path, path, _))
      )
    )

    await Promise.all(
      Object.keys(albumDef.files)
        .filter((_) => objHasKeys(albumDef.files[_]))
        .map((_) => writeInfo(ctx, join(path, _), albumDef.files[_]))
    )
  }

  // process all subAlbums
  if (objHasKeys(albumDef.subAlbums)) {
    await Promise.all(
      Object.keys(albumDef.subAlbums)
        .filter((_) => objHasKeys(albumDef.subAlbums[_]))
        .map((_) => walk(ctx, join(path, _), albumDef.subAlbums[_])
        )
    )
  }
}

const objHasKeys = (o) => Boolean(o) && Object.keys(o).length > 0

export const erase = async (ctx) => await remove(ctx.path)
