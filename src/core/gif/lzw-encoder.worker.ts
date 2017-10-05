
import { LZWEncoder } from './lzw-encoder'

addEventListener('message', event => {
  const { width, height, pixels, colorDepth, gifRawBytes } = <IPostedData> event.data
  const encoder = new LZWEncoder(width, height, pixels, colorDepth)
  const result = encoder.encodeInWorker(gifRawBytes)
  postMessage(result)
})

interface IPostedData {
  width: number
  height: number
  pixels: Uint8Array
  colorDepth: number
  gifRawBytes: number[]
}
