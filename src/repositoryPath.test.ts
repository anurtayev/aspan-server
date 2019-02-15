import anyTest, { TestInterface } from 'ava'

import {
  cleanseWindowsPath,
  fsPath,
  metaFile,
  metaFolder,
  entryContentType,
  entryName,
  thumbFile
} from './repositoryPath'
import { IRepositoryOptions } from './types'

const test = anyTest as TestInterface<{
  repositoryOptions: IRepositoryOptions
}>

test.beforeEach(t => {
  t.context.repositoryOptions = {
    metaFolder: '.metaFolder',
    path: 'C:/Users/anurtay/Downloads/_r1',
    thumbsPrefix: 'thumbs_'
  }
})

test('[cleanseWindowsPath] It must properly cleanse the path', t => {
  t.true(cleanseWindowsPath('\\foo\\bar') === '/foo/bar')
  t.true(cleanseWindowsPath('foo\\bar') === 'foo/bar')
  t.true(cleanseWindowsPath('/foo\\bar') === '/foo/bar')
  t.true(
    cleanseWindowsPath('\\foo\\bar\\more/andmore') === '/foo/bar/more/andmore'
  )
})

test('[fsPath] It must properly expand given id into full path', t => {
  t.true(
    fsPath('/foo/bar', t.context.repositoryOptions) ===
      'C:\\Users\\anurtay\\Downloads\\_r1\\foo\\bar'
  )
})

test('[fsPath] It must properly calculate root repository folder', t => {
  const rootFolderPath = fsPath('/', t.context.repositoryOptions)
  t.true(rootFolderPath === 'C:\\Users\\anurtay\\Downloads\\_r1\\')
})

test('[metaFile] It must correctly derive a meta file name', t => {
  const metaFileStr = metaFile('/foo/bar', t.context.repositoryOptions)
  t.true(
    metaFileStr === `/foo/${t.context.repositoryOptions.metaFolder}/bar.json`
  )
})

test('[metaFolder] It must correctly derive a meta folder name', t => {
  const metaFolderStr = metaFolder('/foo/bar', t.context.repositoryOptions)
  t.true(metaFolderStr === `/foo/${t.context.repositoryOptions.metaFolder}`)
})

test('[entryContentType] It must correctly derive a contentType value', t => {
  t.true(entryContentType('/foo/bar.') === '')
  t.true(entryContentType('bar.ext') === 'ext')
  t.true(entryContentType('../bar.gif') === 'gif')
})

test('[entryName] It must correctly derive an entry name', t => {
  t.true(entryName('/foo/bar') === 'bar')
  t.true(entryName('/foo/bar.ext') === 'bar')
  t.true(entryName('bar.ext') === 'bar')
  t.true(entryName('/foo/.bar') === '.bar')
  t.true(entryName('.bar') === '.bar')
})

test('[thumbFile] It must correctly derive a thumbs file name', t => {
  const thumbFileStr = thumbFile('/foo/bar.jpeg', t.context.repositoryOptions)
  t.true(
    thumbFileStr ===
      `/foo/${t.context.repositoryOptions.metaFolder}/${
        t.context.repositoryOptions.thumbsPrefix
      }bar.jpeg`
  )
})
