// tslint:disable:variable-name

import { TEntry } from './types'
import { NumberStringBooleanInstance } from './NumberStringBoolean'

export const resolvers = {
  NumberStringBoolean: NumberStringBooleanInstance,

  Query: {
    getRootFolderEntries(_root, _args, { repository }) {
      const rootFolderPath = '/'
      return repository.getFolderEntries(rootFolderPath)
    },

    getFolderEntries(_root, { id }, { repository }) {
      return repository.getFolderEntries(id)
    }
  },

  Mutation: {
    addTag(_root, { id, tag }, { repository }) {
      return repository.addTag(id, tag)
    },

    removeTag(_root, { id, tag }, { repository }) {
      return repository.removeTag(id, tag)
    },

    addAttribute(_root, { id, attribute }, { repository }) {
      return repository.addAttribute(id, attribute)
    },

    removeAttribute(_root, { id, attributeKey }, { repository }) {
      return repository.removeAttribute(id, attributeKey)
    }
  },

  Entry: {
    __resolveType(obj) {
      if (obj.type === 'file') {
        return 'File'
      } else {
        return 'Folder'
      }
    }
  },

  Folder: {
    metaData(entry: TEntry, _args, { repository }) {
      return repository.getMetaData(entry.id)
    },

    children(entry: TEntry, _args, { repository }) {
      return repository.getFolderEntries(entry.id)
    }
  },

  File: {
    metaData(entry: TEntry, _args, { repository }) {
      return repository.getMetaData(entry.id)
    }
  }
}
