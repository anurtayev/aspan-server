import { IEntry, IMetaData } from './types'

export interface IEntryLiteral {
  entry: IEntry,
  metaData?: IMetaData
}

export const entryLiterals: IEntryLiteral[] = [
  {
    entry: {
      id: '/f1',
      isFile: true
    }
  },
  {
    entry: {
      id: '/f2',
      isFile: true
    },
    metaData: {
      attributes: {
        name: 'f2',
        contentType: ''
      },
      tags: ['receipts', 'electronics', 'NYtour']
    }
  },
  {
    entry: {
      id: '/fo1',
      isFile: false
    },
    metaData: {
      tags: ['firstFolder'],
      attributes: {
        name: 'fo1',
        contentType: '',
        title: 'fatWedding',
        description: 'who-an!',
        lop: 'ka'
      }
    }
  },
  {
    entry: {
      id: '/fo1/sf1',
      isFile: true
    }
  },
  {
    entry: {
      id: '/fo1/sf2',
      isFile: true
    }
  },
  {
    entry: {
      id: '/fo1/sfo1',
      isFile: false
    }
  },
  {
    entry: {
      id: '/fo1/subFolder34',
      isFile: false
    },
    metaData: {
      tags: ['notEmpty', 'NY', '2018', 'friends'],
      attributes: {
        name: 'subFolder34',
        contentType: '',
        empty: false,
        title: 'New Year celebration',
        description: 'At Zhukovs home',
        numberOfFiles: 45
      }
    }
  },
  {
    entry: {
      id: '/fo1/subFolder34/checkCT.jpeg',
      isFile: true
    },
    metaData: {
      attributes: {
        name: 'checkCT',
        contentType: 'jpeg',
        description: 'Serega taking a picture'
      },
      tags: ['favorite', 'friends']
    }
  }, {
    entry: {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      isFile: true
    }
  }, {
    entry: {
      id: '/fo1/subFolder34/gifFile.gif',
      isFile: true
    }
  }
]
