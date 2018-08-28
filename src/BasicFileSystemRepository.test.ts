import anyTest, { TestInterface } from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testRepository from './testRepository'
import * as fs from 'fs-extra'
import { metaFileName } from './repositoryPath'

import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, IEntry, IRepository } from './types'

const test = anyTest as TestInterface<{
  logSpy: sinon.SinonSpy,
  repositoryOptions: IRepositoryOptions,
  repositoryInstance: IRepository
}>

const compareArrays = (foundEntries: IEntry[], expectedEntries: IEntry[]): boolean => {
  if (foundEntries.length !== expectedEntries.length) {
    return false
  }

  return foundEntries.every(
    (foundEntry: IEntry) => {
      return Boolean(expectedEntries.find(
        (expectedEntry) => expectedEntry.id === foundEntry.id && expectedEntry.isFile === foundEntry.isFile)
      )
    }
  )
}

test.beforeEach(async (t) => {
  const logSpy = sinon.spy()
  // console.log = logSpy
  t.context.logSpy = logSpy

  t.context.repositoryOptions = {
    path: join(process.env.TEMP as string, shortid.generate()),
    metaFolderName: '.metaFolder'
  }

  await testRepository.create(t.context.repositoryOptions)
  t.context.repositoryInstance = new BasicFileSystemRepository(t.context.repositoryOptions)
})

test.afterEach.always(async (t) => {
  await testRepository.erase(t.context.repositoryOptions)
})

test('[getEntry] It must return correct entry data', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.getEntry('/f2'),
    {
      id: '/f2',
      isFile: true
    }
  )

  t.deepEqual(
    await t.context.repositoryInstance.getEntry('/fo1/sf2'),
    {
      id: '/fo1/sf2',
      isFile: true
    }
  )
})

test('[getEntry] It must throw when entry id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getEntry('/doesnotexits')
  })
})

test('[getFolderEntries] It must return correct entries data', async (t) => {
  const expectedEntries1: IEntry[] = [
    {
      id: '/fo1/sf1',
      isFile: true
    },
    {
      id: '/fo1/sf2',
      isFile: true
    },
    {
      id: '/fo1/sfo1',
      isFile: false
    },
    {
      id: '/fo1/subFolder34',
      isFile: false
    }
  ]
  const foundEntries1 = await t.context.repositoryInstance.getFolderEntries('/fo1')
  t.true(compareArrays(foundEntries1, expectedEntries1))

  const expectedEntries2: IEntry[] = [
    {
      id: '/fo1/subFolder34/checkCT.jpeg',
      isFile: true
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      isFile: true
    }, {
      id: '/fo1/subFolder34/gifFile.gif',
      isFile: true
    }
  ]
  const foundEntries2 = await t.context.repositoryInstance.getFolderEntries('/fo1/subFolder34')
  t.true(compareArrays(foundEntries2, expectedEntries2))
})

test('[getFolderEntries] It must throw when folder id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getFolderEntries('/doesnotexits')
  })
})

test('[findEntries] It must find correct entries', async (t) => {
  const expectedEntries = [
    {
      id: '/f2',
      isFile: true
    },
    {
      id: '/fo1/sf2',
      isFile: true
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      isFile: true
    }
  ]
  const foundEntries = await t.context.repositoryInstance.findEntries('/**/*f2*(.)*')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[findEntries] It must return emtpy array of entries when there is no match', async (t) => {
  const expectedEntries = []
  const foundEntries = await t.context.repositoryInstance.findEntries('/doesnotexist')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[getMetaData] It must throw if entry id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getMetaData('/doesnotexits')
  })
})

test('[getMetaData] It must return correct meta data', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.getMetaData('/fo1/subFolder34/checkCT.jpeg'),
    {
      attributes: {
        description: 'Serega taking a picture'
      },
      tags: ['favorite', 'friends']
    }
  )

  t.deepEqual(
    await t.context.repositoryInstance.getMetaData('/fo1/subFolder34'),
    {
      tags: ['notEmpty', 'NY', '2018', 'friends'],
      attributes: {
        empty: false,
        title: 'New Year celebration',
        description: 'At Zhukovs home',
        numberOfFiles: 45
      }
    }
  )
})

test('[setMetaData] It must set meta data correctly', async (t) => {
  const file = '/fo1/subFolder34/anotherExt_f2.jpg'
  const newMetaData = {
    attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
    tags: ['newTag1', 'newTag2']
  }

  await t.context.repositoryInstance.setMetaData(
    '/fo1/subFolder34/anotherExt_f2.jpg',
    newMetaData
  )

  const metaFile = metaFileName(file, t.context.repositoryOptions)
  t.true(await fs.pathExists(metaFile))

  const readMetaData = await fs.readJson(metaFile)
  t.deepEqual(
    readMetaData,
    newMetaData
  )
})

test('[addTag] It must add tag correctly', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.addTag(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'addedTag'
    ),
    {
      attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
      tags: ['newTag1', 'newTag2', 'addedTag']
    }
  )
})

test('[addTag] It must not add a duplicate tag', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.addTag(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'newTag2'
    ),
    {
      attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
      tags: ['newTag1', 'newTag2']
    }
  )
})

test('[removeTag] It must remove tag correctly', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.removeTag(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'newTag2'
    ),
    {
      attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
      tags: ['newTag1']
    }
  )
})

test('[addAttribute] It must add attribute correctly', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.addAttribute(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'newAttr',
      true
    ),
    {
      attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds', newAttr: true },
      tags: ['newTag1', 'newTag2']
    }
  )
})

test('[addAttribute] It must update value if attribute already exist', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.addAttribute(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'newAtt1',
      147
    ),
    {
      attributes: { newAtt1: 147, newAtt2: 46, newAtt3: 'sfsds' },
      tags: ['newTag1', 'newTag2']
    }
  )
})

test('[removeAttribute] It must remove attribute correctly', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.removeAttribute(
      {
        attributes: { newAtt1: true, newAtt2: 46, newAtt3: 'sfsds' },
        tags: ['newTag1', 'newTag2']
      },
      'newAtt1'
    ),
    {
      attributes: { newAtt2: 46, newAtt3: 'sfsds' },
      tags: ['newTag1', 'newTag2']
    }
  )
})
