import * as testRepository from '../src/testRepository'
import * as dotenv from 'dotenv'
import { remove } from 'fs-extra'

dotenv.config()
const path = process.env.REPOSITORY_PATH as string
const metaFolderName = process.env.META_FOLDER as string || '.metaFolder'

remove(path)
testRepository.create({ path, metaFolderName })
