import anyTest, { TestInterface } from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testRepository from './testRepository'
import * as fs from 'fs-extra'
import { options } from './util'
import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, TEntry, IRepository, IMetaData } from './types'
import { tstEntries } from './testRepositoryData'

const test = anyTest as TestInterface<{
  logSpy: sinon.SinonSpy
  options: IRepositoryOptions
  repo: IRepository
}>

const compareArrays = (
  foundEntries: TEntry[],
  expectedEntries: TEntry[]
): boolean => {
  if (foundEntries.length !== expectedEntries.length) {
    return false
  }

  return foundEntries.every((foundEntry: TEntry) => {
    return Boolean(
      expectedEntries.find(
        elem => elem.id === foundEntry.id && elem.type === foundEntry.type
      )
    )
  })
}

test.beforeEach(async t => {
  const logSpy = sinon.spy()
  // console.log = logSpy
  t.context.logSpy = logSpy

  t.context.options = {
    ...options,
    path: join(process.env.TEMP as string, shortid.generate())
  }

  t.context.repo = new BasicFileSystemRepository(t.context.options)
  await testRepository.createChildren(t.context.repo, '/', tstEntries)
})

test.afterEach.always(async t => {
  await fs.remove(t.context.options.path)
})

test('[getEntry] It must return correct entry data', async t => {
  t.deepEqual(await t.context.repo.getEntry('/f2'), {
    id: '/f2',
    name: 'f2',
    parentId: '/',
    type: 'file',
    contentType: 'jpg',
    size: 0
  })

  t.deepEqual(await t.context.repo.getEntry('/fo1/sf2'), {
    id: '/fo1/sf2',
    name: 'sf2',
    parentId: '/fo1',
    type: 'folder'
  })
})

test('[getEntry] It must throw when entry id does not exist', async t => {
  await t.throwsAsync(async () => {
    await t.context.repo.getEntry('/doesnotexits')
  })
})

test('[getFolderEntries] It must return correct entries data', async t => {
  const expectedEntries1: TEntry[] = [
    {
      id: '/fo1/sf1',
      name: 'sf1',
      parentId: '/fo1',
      type: 'folder'
    },
    {
      id: '/fo1/sf2',
      name: 'sf2',
      parentId: '/fo1',
      type: 'folder'
    },
    {
      id: '/fo1/sfo1',
      name: 'sfo1',
      parentId: '/fo1',
      type: 'folder'
    },
    {
      id: '/fo1/subFolder34',
      name: 'subFolder34',
      parentId: '/fo1',
      type: 'folder'
    }
  ]
  const foundEntries1 = await t.context.repo.getFolderEntries('/fo1')
  t.true(compareArrays(foundEntries1, expectedEntries1))

  const expectedEntries2: TEntry[] = [
    {
      id: '/fo1/subFolder34/checkCT.jpg',
      name: 'checkCT',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'jpg',
      size: 0
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      name: 'anotherExt_f2',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'jpg',
      size: 0
    },
    {
      id: '/fo1/subFolder34/jpgFile.jpg',
      name: 'jpgFile',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'jpg',
      size: 0
    }
  ]
  const foundEntries2 = await t.context.repo.getFolderEntries(
    '/fo1/subFolder34'
  )
  t.true(compareArrays(foundEntries2, expectedEntries2))
})

test('[getFolderEntries] It must throw when folder id does not exist', async t => {
  await t.throwsAsync(async () => {
    await t.context.repo.getFolderEntries('/doesnotexits')
  })
})

test('[findEntries] It must find correct entries', async t => {
  const expectedEntries: TEntry[] = [
    {
      id: '/f2',
      name: 'f2',
      parentId: '/',
      type: 'file',
      contentType: 'jpg',
      size: 0
    },
    {
      id: '/fo1/sf2',
      name: 'sf2',
      parentId: '/fo1',
      type: 'folder'
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      name: 'anotherExt_f2.jpg',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'jpg',
      size: 0
    }
  ]

  const foundEntries = await t.context.repo.findEntries('/**/*f2*(.)*')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[findEntries] It must return emtpy array of entries when there is no match', async t => {
  const expectedEntries = []
  const foundEntries = await t.context.repo.findEntries('/doesnotexist')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[getMetaData] It must throw if entry id does not exist', async t => {
  const metaData = await t.context.repo.getMetaData('/doesnotexits')
  t.is(metaData, null)
})

test('[getMetaData] It must return correct meta data for a file', async t => {
  t.deepEqual(
    await t.context.repo.getMetaData('/fo1/subFolder34/checkCT.jpg'),
    {
      attributes: [['description', 'Serega taking a picture']],
      tags: ['favorite', 'friends']
    }
  )
})

test('[getMetaData] It must return correct meta data for folder', async t => {
  t.deepEqual(await t.context.repo.getMetaData('/fo1/subFolder34'), {
    tags: ['notEmpty', 'NY', '2018', 'friends'],
    attributes: [
      ['empty', false],
      ['title', 'New Year celebration'],
      ['description', 'At Zhukovs home'],
      ['numberOfFiles', 45]
    ]
  })
})

test('[setMetaData] It must set meta data correctly', async t => {
  const file = '/fo1/subFolder34/anotherExt_f2.jpg'
  const metaFileStr = t.context.repo.metaFile(file)

  const newMetaData: IMetaData = {
    attributes: [['newAtt1', true], ['newAtt2', 46], ['newAtt3', 'sfsds]']],
    tags: ['newTag1', 'newTag2']
  }

  await t.context.repo.setMetaData(
    '/fo1/subFolder34/anotherExt_f2.jpg',
    newMetaData
  )

  t.true(await fs.pathExists(metaFileStr))

  const readMetaData = await fs.readJson(metaFileStr)

  t.deepEqual(readMetaData, newMetaData)
})

test('[setMetaData] It must not create a meta data file if there is no meta information', async t => {
  const file = '/fo1/subFolder34/anotherExt_f2.jpg'
  const metaFileStr = t.context.repo.metaFile(file)
  const newMetaData: IMetaData = {}

  await t.context.repo.setMetaData(
    '/fo1/subFolder34/anotherExt_f2.jpg',
    newMetaData
  )

  t.false(await fs.pathExists(metaFileStr))
})

test('[cleanseWindowsPath] It must properly cleanse the path', t => {
  t.true(t.context.repo.cleanseWindowsPath('\\foo\\bar') === '/foo/bar')
  t.true(t.context.repo.cleanseWindowsPath('foo\\bar') === 'foo/bar')
  t.true(t.context.repo.cleanseWindowsPath('/foo\\bar') === '/foo/bar')
  t.true(
    t.context.repo.cleanseWindowsPath('\\foo\\bar\\more/andmore') ===
      '/foo/bar/more/andmore'
  )
})

test('[fsPath] It must properly expand given id into full path', t => {
  t.true(
    t.context.repo.fsPath('/foo/bar') ===
      'C:\\Users\\anurtay\\Downloads\\_r1\\foo\\bar'
  )
})

test('[fsPath] It must properly calculate root repository folder', t => {
  const rootFolderPath = t.context.repo.fsPath('/')
  t.true(rootFolderPath === 'C:\\Users\\anurtay\\Downloads\\_r1\\')
})

test('[metaFile] It must correctly derive a meta file name', t => {
  const metaFileStr = t.context.repo.metaFile('/foo/bar')
  t.true(metaFileStr === `/foo/${t.context.options.metaFolder}/bar.json`)
})

test('[metaFolder] It must correctly derive a meta folder name', t => {
  const metaFolderStr = t.context.repo.metaFolder('/foo/bar')
  t.true(metaFolderStr === `/foo/${t.context.options.metaFolder}`)
})

test('[entryContentType] It must correctly derive a contentType value', t => {
  t.true(t.context.repo.entryContentType('/foo/bar.') === '')
  t.true(t.context.repo.entryContentType('bar.ext') === 'ext')
  t.true(t.context.repo.entryContentType('../bar.jpg') === 'jpg')
})

test('[entryName] It must correctly derive an entry name', t => {
  t.true(t.context.repo.entryName('/foo/bar') === 'bar')
  t.true(t.context.repo.entryName('/foo/bar.ext') === 'bar')
  t.true(t.context.repo.entryName('bar.ext') === 'bar')
  t.true(t.context.repo.entryName('/foo/.bar') === '.bar')
  t.true(t.context.repo.entryName('.bar') === '.bar')
})

test('[thumbFile] It must correctly derive a thumbs file name', t => {
  const thumbFileStr = t.context.repo.thumbFile('/foo/bar.jpg')
  t.true(
    thumbFileStr ===
      `/foo/${t.context.options.metaFolder}/${
        t.context.options.thumbsPrefix
      }bar.jpg`
  )
})
