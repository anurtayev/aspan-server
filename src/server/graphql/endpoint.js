import {graphql} from 'graphql'
import {schema} from './schema'
import {rootAlbum} from '../Repo'
import {log} from '../util/log'
import {Context as repoCtx} from '../Repo/repoCtx'

export default socket => {
  log.info(`client connected: ${socket.id}`)
  socket.on('graphql', async data => {
    log.info(`incoming graphql request:\n${data}`)
    let outgoingData

    try {
      outgoingData = await graphql(schema, data, await rootAlbum(repoCtx), repoCtx)
    } catch (e) {
      log.error(e)
    }

    if (outgoingData.errors) {
      log.error(JSON.stringify(outgoingData.errors))
      log.error(`outgoing graphql response: ${JSON.stringify(outgoingData)}`)
    }

    socket.emit('graphql', outgoingData)
    log.info(`outgoing graphql response:\n${JSON.stringify(outgoingData, sanitizeObject, 2)}`)
  })
  socket.on('disconnect', () => log.info(`client disconnected: ${socket.id}`))
}

const thumbFields = ['bufBase64', 'thumbBufBase64']

const sanitizeObject = (k, v) =>
  thumbFields.some(e => e === k)
    ? 'VALUE HAS BEEN SUPPRESSED'
    : v
