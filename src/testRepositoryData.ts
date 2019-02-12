import { TEntry, IMetaData } from './types'

export const entryLiterals: Array<Pick<TEntry, 'id' | 'type'> & IMetaData> = [
  {
    id: '/f1',
    type: 'file'
  },
  {
    id: '/f2',
    type: 'file',
    tags: ['receipts', 'electronics', 'NYtour']
  },
  {
    id: '/fo1',
    type: 'folder',
    tags: ['firstFolder'],
    attributes: [
      ['title', 'fatWedding'],
      ['description', 'who-an!'],
      ['lop', 'ka']
    ]
  },
  {
    id: '/fo1/sf1',
    type: 'folder'
  },
  {
    id: '/fo1/sf2',
    type: 'folder'
  },
  {
    id: '/fo1/sfo1',
    type: 'folder'
  },
  {
    id: '/fo1/subFolder34',
    type: 'folder',
    tags: ['notEmpty', 'NY', '2018', 'friends'],
    attributes: [
      ['empty', false],
      ['title', 'New Year celebration'],
      ['description', 'At Zhukovs home'],
      ['numberOfFiles', 45]
    ]
  },
  {
    id: '/fo1/subFolder34/checkCT.jpeg',
    type: 'file',
    attributes: [['description', 'Serega taking a picture']],
    tags: ['favorite', 'friends']
  },
  {
    id: '/fo1/subFolder34/anotherExt_f2.jpg',
    type: 'file'
  },
  {
    id: '/fo1/subFolder34/gifFile.gif',
    type: 'file'
  }
]
