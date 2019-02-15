import anyTest, { TestInterface } from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testRepository from './testRepository'
import * as fs from 'fs-extra'
import { metaFile } from './repositoryPath'
import * as _ from 'lodash'
import { options } from './util'

import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, TEntry, IRepository, IMetaData } from './types'

const test = anyTest as TestInterface<{
  logSpy: sinon.SinonSpy
  repositoryOptions: IRepositoryOptions
  repositoryInstance: IRepository
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

  t.context.repositoryOptions = {
    ...options,
    path: join(process.env.TEMP as string, shortid.generate())
  }

  await testRepository.create(t.context.repositoryOptions)
  t.context.repositoryInstance = new BasicFileSystemRepository(
    t.context.repositoryOptions
  )
})

test.afterEach.always(async t => {
  await testRepository.erase(t.context.repositoryOptions)
})

test('[getEntry] It must return correct entry data', async t => {
  t.deepEqual(await t.context.repositoryInstance.getEntry('/f2'), {
    id: '/f2',
    name: 'f2',
    parentId: '/',
    type: 'file',
    contentType: '',
    size: 0
  })

  t.deepEqual(await t.context.repositoryInstance.getEntry('/fo1/sf2'), {
    id: '/fo1/sf2',
    name: 'sf2',
    parentId: '/fo1',
    type: 'folder'
  })
})

test('[getEntry] It must throw when entry id does not exist', async t => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getEntry('/doesnotexits')
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
  const foundEntries1 = await t.context.repositoryInstance.getFolderEntries(
    '/fo1'
  )
  t.true(compareArrays(foundEntries1, expectedEntries1))

  const expectedEntries2: TEntry[] = [
    {
      id: '/fo1/subFolder34/checkCT.jpeg',
      name: 'checkCT',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'jpeg',
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
      id: '/fo1/subFolder34/gifFile.gif',
      name: 'gifFile',
      parentId: '/fo1/subFolder34',
      type: 'file',
      contentType: 'gif',
      size: 0
    }
  ]
  const foundEntries2 = await t.context.repositoryInstance.getFolderEntries(
    '/fo1/subFolder34'
  )
  t.true(compareArrays(foundEntries2, expectedEntries2))
})

test('[getFolderEntries] It must throw when folder id does not exist', async t => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getFolderEntries('/doesnotexits')
  })
})

test('[findEntries] It must find correct entries', async t => {
  const expectedEntries: TEntry[] = [
    {
      id: '/f2',
      name: 'f2',
      parentId: '/',
      type: 'file',
      contentType: '',
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

  const foundEntries = await t.context.repositoryInstance.findEntries(
    '/**/*f2*(.)*'
  )
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[findEntries] It must return emtpy array of entries when there is no match', async t => {
  const expectedEntries = []
  const foundEntries = await t.context.repositoryInstance.findEntries(
    '/doesnotexist'
  )
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[getMetaData] It must throw if entry id does not exist', async t => {
  const metaData = await t.context.repositoryInstance.getMetaData(
    '/doesnotexits'
  )
  t.is(metaData, null)
})

test('[getMetaData] It must return correct meta data for a file', async t => {
  t.deepEqual(
    await t.context.repositoryInstance.getMetaData(
      '/fo1/subFolder34/checkCT.jpeg'
    ),
    {
      attributes: [['description', 'Serega taking a picture']],
      tags: ['favorite', 'friends']
    }
  )
})

test('[getMetaData] It must return correct meta data for folder', async t => {
  t.deepEqual(
    await t.context.repositoryInstance.getMetaData('/fo1/subFolder34'),
    {
      tags: ['notEmpty', 'NY', '2018', 'friends'],
      attributes: [
        ['empty', false],
        ['title', 'New Year celebration'],
        ['description', 'At Zhukovs home'],
        ['numberOfFiles', 45]
      ]
    }
  )
})

test('[setMetaData] It must set meta data correctly', async t => {
  const file = '/fo1/subFolder34/anotherExt_f2.jpg'
  const metaFileStr = metaFile(file, t.context.repositoryOptions)

  const newMetaData: IMetaData = {
    attributes: [['newAtt1', true], ['newAtt2', 46], ['newAtt3', 'sfsds]']],
    tags: ['newTag1', 'newTag2']
  }

  await t.context.repositoryInstance.setMetaData(
    '/fo1/subFolder34/anotherExt_f2.jpg',
    newMetaData
  )

  t.true(await fs.pathExists(metaFileStr))

  const readMetaData = await fs.readJson(metaFileStr)

  t.deepEqual(readMetaData, newMetaData)
})

test('[setMetaData] It must not create a meta data file if there is no meta information', async t => {
  const file = '/fo1/subFolder34/anotherExt_f2.jpg'
  const metaFileStr = metaFile(file, t.context.repositoryOptions)
  const newMetaData: IMetaData = {}

  await t.context.repositoryInstance.setMetaData(
    '/fo1/subFolder34/anotherExt_f2.jpg',
    newMetaData
  )

  t.false(await fs.pathExists(metaFileStr))
})
