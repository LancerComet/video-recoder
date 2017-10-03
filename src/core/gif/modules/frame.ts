import { NeuQuant } from './neu-quant'

/**
 * A single frame in a gif.
 *
 * @class Frame
 */
class Frame {
  /**
   * Quality setup for NeuQUant.
   *
   * @private
   * @type {number}
   * @memberof Frame
   */
  private quality: number

  /**
   * Frame data (Uint8ClampArray) in BGR.
   *
   * @private
   * @type {TSingleFrameBGRData}
   * @memberof Frame
   */
  private frameData: TSingleFrameBGRData

  /**
   * Indexed pixel.
   *
   * @private
   * @type {Uint8ClampedArray}
   * @memberof Frame
   */
  private indexedPixels: Uint8ClampedArray

  /**
   * Transform RGBA to BGR order.
   *
   * @private
   * @param {Uint8ClampedArray} singleFrameData
   * @returns {TSingleFrameBGRData}
   * @memberof Frame
   */
  private transformToBGR (singleFrameData: TRecordedSingleFrameData): TSingleFrameBGRData {
    const length = singleFrameData.byteLength

    const buffer = new ArrayBuffer(length)
    const result = new Uint8ClampedArray(buffer)

    let j = 0
    for (let i = 0; i < length; i += 4) {
      const r = singleFrameData[i]
      const g = singleFrameData[i + 1]
      const b = singleFrameData[i + 2]

      result[j++] = b
      result[j++] = g
      result[j++] = r
    }

    return result
  }

  /**
   * Use NeuQuant to analyzes frame colors and creates color map.
   *
   * @private
   * @memberof Frame
   */
  private analyseColor () {
    const length = this.frameData.byteLength
    const pixelCount = length / 3

    // Use NeuQuant to find image palette.
    const imageQuant = new NeuQuant(this.frameData, this.quality)
    imageQuant.buildColormap()  // Create reduced palette.
    // TODO: Line 256
  }

  constructor (singleFrameData: TRecordedSingleFrameData, quality: number) {
    this.frameData = this.transformToBGR(singleFrameData)
    this.quality = quality
    this.analyseColor()
  }
}

export {
  Frame
}

/**
 * Single frame pixel data in BGR order.
 * This array doesn't contain alpha channel, only BGR pixels.
 */
type TSingleFrameBGRData = Uint8ClampedArray
