import anyTest, { TestInterface } from 'ava'

import {
  addAttribute,
  addTag,
  removeAttribute,
  removeTag
} from './metaDataHelpers'
import { IMetaData, TAttribute } from './types'

const test = anyTest as TestInterface<{
  metaData: IMetaData
}>

test.beforeEach(t => {
  t.context.metaData = {
    attributes: [['newAtt1', true], ['newAtt2', 46], ['newAtt3', 'sfsds']],
    tags: ['newTag1', 'newTag2']
  }
})

test('[addTag] It must add tag correctly', t => {
  t.deepEqual(addTag(t.context.metaData, 'addedTag'), {
    ...t.context.metaData,
    tags: [...(t.context.metaData.tags as string[]), 'addedTag']
  })
})

test('[addTag] It must not add a duplicate tag', t => {
  t.deepEqual(addTag(t.context.metaData, 'newTag2'), t.context.metaData)
})

test('[removeTag] It must remove tag correctly', t => {
  t.deepEqual(removeTag(t.context.metaData, 'newTag2'), {
    ...t.context.metaData,
    tags: ['newTag1']
  })
})

test('[addAttribute] It must add attribute correctly', t => {
  t.deepEqual(addAttribute(t.context.metaData, ['newAttr', true]), {
    ...t.context.metaData,
    attributes: [
      ...(t.context.metaData.attributes as TAttribute[]),
      ['newAttr', true]
    ]
  })
})

test('[addAttribute] It must update value if attribute already exist', t => {
  t.deepEqual(addAttribute(t.context.metaData, ['newAtt1', 147]), {
    ...t.context.metaData,
    attributes: [['newAtt1', 147], ['newAtt2', 46], ['newAtt3', 'sfsds']]
  })
})

test('[removeAttribute] It must remove attribute correctly', t => {
  t.deepEqual(removeAttribute(t.context.metaData, 'newAtt1'), {
    ...t.context.metaData,
    attributes: [['newAtt2', 46], ['newAtt3', 'sfsds']]
  })
})
