import { IMetaData, IFile, IFolder } from './types'

type TMeta = {
  meta?: IMetaData
}
type TReducedFile = Pick<IFile, 'name' | 'type' | 'contentType'> & TMeta
type TReducedFolder = Pick<IFolder, 'name' | 'type'> &
  TMeta & {
    children?: TChildren
  }
export type TChildren = Array<TReducedFile | TReducedFolder>

export const tstEntries: TChildren = [
  {
    name: 'f1',
    type: 'file',
    contentType: '.jpg'
  },
  {
    name: 'f2',
    type: 'file',
    contentType: '.gif',
    meta: { tags: ['receipts', 'electronics', 'NYtour'] }
  },
  {
    name: 'fo1',
    type: 'folder',
    meta: {
      tags: ['firstFolder'],
      attributes: [
        ['title', 'fatWedding'],
        ['description', 'who-an!'],
        ['lop', 'ka']
      ]
    },
    children: [
      {
        name: 'sf1',
        type: 'folder'
      },
      {
        name: 'sf2',
        type: 'folder'
      },
      {
        name: 'sfo1',
        type: 'folder'
      },
      {
        name: 'subFolder34',
        type: 'folder',
        meta: {
          tags: ['notEmpty', 'NY', '2018', 'friends'],
          attributes: [
            ['empty', false],
            ['title', 'New Year celebration'],
            ['description', 'At Zhukovs home'],
            ['numberOfFiles', 45]
          ]
        },
        children: [
          {
            name: 'checkCT',
            type: 'file',
            contentType: '.jpg',
            meta: {
              attributes: [['description', 'Serega taking a picture']],
              tags: ['favorite', 'friends']
            }
          },
          {
            name: 'anotherExt_f2',
            type: 'file',
            contentType: '.jpg'
          },
          {
            name: 'gifFile',
            type: 'file',
            contentType: '.jpg'
          }
        ]
      }
    ]
  }
]
