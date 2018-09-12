import { ApolloServer } from 'apollo-server'
import * as dotenv from 'dotenv'
import * as assert from 'assert'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepository } from './types'

dotenv.config()

const path = process.env.REPOSITORY_PATH as string
const metaFolderName = process.env.META_FOLDER as string || '.metaFolder'
assert(path, 'configuration error: repository path is missing')
const repository = new BasicFileSystemRepository({ metaFolderName, path })

export interface IContext {
  repository: IRepository
}

const context: IContext = { repository }

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
}).catch(reason => {
  console.log(reason)
})
