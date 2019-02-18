import { ApolloServer } from 'apollo-server'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import BasicFileSystemRepository from './BasicFileSystemRepository'
import { options } from './util'
import { IContext } from './types'

const ctx: IContext = { repository: new BasicFileSystemRepository(options) }

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ctx
})

server
  .listen()
  .then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
  .catch(reason => {
    console.log(reason)
  })
