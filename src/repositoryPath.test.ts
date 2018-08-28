import anyTest, { TestInterface } from 'ava'

import { cleanseWindowsPath, fsPath, metaFileName, metaFolderName } from './repositoryPath'
import { IRepositoryOptions } from './types'

const test = anyTest as TestInterface<{
    repositoryOptions: IRepositoryOptions
}>

test.beforeEach((t) => {
    t.context.repositoryOptions = {
        metaFolderName: '.metaFolder',
        path: 'C:/Users/anurtay/Downloads/_r1'
    }
})

test('[cleanseWindowsPath] It must properly cleanse the path', (t) => {
    t.true(cleanseWindowsPath('\\foo\\bar') === '/foo/bar')
    t.true(cleanseWindowsPath('foo\\bar') === 'foo/bar')
    t.true(cleanseWindowsPath('/foo\\bar') === '/foo/bar')
    t.true(cleanseWindowsPath('\\foo\\bar\\more/andmore') === '/foo/bar/more/andmore')
})

test('[fsPath] It must properly expand given id into full path', (t) => {
    t.true(fsPath('/foo/bar', t.context.repositoryOptions) === 'C:\\Users\\anurtay\\Downloads\\_r1\\foo\\bar')
})

test('[metaFile] It must correctly derive a meta file name', (t) => {
    t.true(
        metaFileName('/foo/bar', t.context.repositoryOptions) ===
        `C:\\Users\\anurtay\\Downloads\\_r1\\foo\\${t.context.repositoryOptions.metaFolderName}\\bar.json`
    )
})

test('[metaFolder] It must correctly derive a meta folder name', (t) => {
    t.true(
        metaFolderName('/foo/bar', t.context.repositoryOptions) ===
        `C:\\Users\\anurtay\\Downloads\\_r1\\foo\\${t.context.repositoryOptions.metaFolderName}`
    )
})
