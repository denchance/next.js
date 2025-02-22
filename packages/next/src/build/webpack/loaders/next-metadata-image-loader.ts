import loaderUtils from 'next/dist/compiled/loader-utils3'
import { getImageSize } from '../../../server/image-optimizer'

interface Options {
  isServer: boolean
  isDev: boolean
  assetPrefix: string
  basePath: string
}

async function nextMetadataImageLoader(this: any, content: Buffer) {
  const options: Options = this.getOptions()
  const {
    // TODO-APP: support assetPrefix
    assetPrefix = '',
    // isServer,
    isDev,
    // basePath
  } = options
  const context = this.rootContext

  const opts = { context, content }

  // e.g. icon.png -> server/static/media/metadata/icon.399de3b9.png
  const interpolatedName = loaderUtils.interpolateName(
    this,
    '/static/media/metadata/[name].[hash:8].[ext]',
    opts
  )
  const outputPath = assetPrefix + '/_next' + interpolatedName
  let extension = loaderUtils.interpolateName(this, '[ext]', opts)
  if (extension === 'jpg') {
    extension = 'jpeg'
  }

  const imageSize = await getImageSize(content, extension).catch((err) => err)

  if (imageSize instanceof Error) {
    const err = imageSize
    err.name = 'InvalidImageFormatError'
    throw err
  }

  const stringifiedData = JSON.stringify({
    url: outputPath,
    sizes: `${imageSize.width}x${imageSize.height}`,
  })

  this.emitFile(`../${isDev ? '' : '../'}${interpolatedName}`, content, null)

  return `export default ${stringifiedData};`
}

export const raw = true
export default nextMetadataImageLoader
