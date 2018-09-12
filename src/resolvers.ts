import { IEntry } from './types'
import { IContext } from './index'
import { IntStringBooleanInstance } from './IntStringBoolean'

export const resolvers = {
    IntStringBoolean: IntStringBooleanInstance,

    Query: {
        // tslint:disable-next-line:variable-name
        getRootFolderEntries(_root, _args, { repository }: IContext) {
            const rootFolderPath = '/'
            return repository.getFolderEntries(rootFolderPath)
        },

        // tslint:disable-next-line:variable-name
        getFolderEntries(_root, { id }, { repository }: IContext) {
            return repository.getFolderEntries(id)
        }
    },

    Entry: {
        __resolveType(obj) {
            if (obj.isFile) {
                return 'File'
            } else {
                return 'Folder'
            }
        }
    },

    Folder: {
        // tslint:disable-next-line:variable-name
        children(entry: IEntry, _args, { repository }: IContext) {
            return repository.getFolderEntries(entry.id)
        }
    },

    File: {
        // tslint:disable-next-line:variable-name
        contentType(entry: IEntry, _args, { repository }: IContext) {
            return repository.getContentType(entry.id)
        },

        // tslint:disable-next-line:variable-name
        size(entry: IEntry, _args, { repository }: IContext) {
            return repository.getSize(entry.id)
        }
    }
}
