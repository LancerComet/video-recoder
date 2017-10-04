import { isNumber } from '../../utils/is-number'
import { NeuQuant } from './neu-quant'
import { ByteArray } from './byte-array'

class Gif {
  /** Image width. */
  private width: number

  /** Image height. */
  private height: number

  /** Delay between frame to frame. In hundreds. */
  private delay: number = 10

  /** Repeat. */
  private repeat: number = 0

  /** Current frame's pixel data in BGR order. No Alpha channel. */
  private currentFramePixelsData: Uint8Array

  /** Converted frame indexed to palette. */
  private indexedPixels: Uint8Array

  /** Quality of color quantization. Default is 10. */
  private quality: number = 10

  /** Color table. Maybe array like object. */
  private colorTab: any = null

  /** Active palette entries. */
  private usedEntry: boolean[] = []

  /** Color depth. Always be 8. */
  private get colorDepth () { return 8 }

  /** Color table size. Always be 7. */
  private get colorTableSize () { return 7 }

  /** Transparent color. */
  private transparentColor: any

  /** Transparent color index. */
  private transparentColorIndex: number

  /** Is this frame is first frame. */
  private isFirstFrame: boolean = true

  /** Gif Output. */
  private gifRawBytes: ByteArray = new ByteArray()

  /**
   * Set delay between frame to frame.
   *
   * @private
   * @param {number} milliseconds
   * @memberof Gif
   */
  private setDelay (milliseconds: number) {
    this.delay = Math.round(milliseconds / 10)
  }

  /**
   * Write UTF-8 string to GIF Raw bytes.
   *
   * @private
   * @param {string} str
   * @memberof Gif
   */
  private writeUTFBytes (str: string) {
    this.gifRawBytes.writeUTFBytes(str)
  }

  /**
   * Use NeuQuant to analyse current frame colors and creates color map.
   *
   * @private
   * @memberof Gif
   */
  private analyseColor () {
    const length = this.currentFramePixelsData.length
    const pixelCount = length / 3  // 3 bytes represent one pixel.

    this.indexedPixels = new Uint8Array(pixelCount)

    const imageQuant = new NeuQuant(this.currentFramePixelsData, this.quality)
    imageQuant.buildColormap()
    this.colorTab = imageQuant.getColormap()

    // Map image pixels to new palette.
    let j = 0
    for (let i = 0; i < pixelCount; i++) {
      const index = imageQuant.lookupRGB(
        this.currentFramePixelsData[j++] & 0xff,
        this.currentFramePixelsData[j++] & 0xff,
        this.currentFramePixelsData[j++] & 0xff
      )

      this.usedEntry[index] = true
      this.indexedPixels[i] = index
    }

    // Reset data.
    this.currentFramePixelsData = null

    // TODO: Add transparent color support sometime.
  }

  constructor (options: IGifOptions) {
    if (
      !isNumber(options.width) ||
      !isNumber(options.height)
    ) {
      throw new TypeError('[Gif] Width and height must be provided.')
    }

    this.width = ~~options.width
    this.height = ~~options.height

    // Set fps.
    isNumber(options.delay) && this.setDelay(options.delay)

    // Set quality.
    if (isNumber(options.quality)) {
      this.quality = options.quality < 1 ? 1 : options.quality
    }

    // Set repeat.
    if (isNumber(options.repeat)) {
      this.repeat = options.repeat
    }

    // Set delay.
    if (isNumber(options.delay)) {
      this.delay = options.delay
    }

    // Write file head.
    this.writeUTFBytes('GIF89a')
  }

  /**
   * Add new frame.
   *
   * @param {(CanvasRenderingContext2D | ImageData)} data
   * @memberof Gif
   */
  addFrame (data: CanvasRenderingContext2D | ImageData) {
    // Prepare ImageData.
    let imageData: ImageData = null
    if (typeof data['getImageData'] === 'function') {
      imageData = (<CanvasRenderingContext2D> data).getImageData(
        0, 0, this.width, this.height
      )
    } else {
      imageData = <ImageData> data
    }

    // Extracts ImageData to pixel byte array in BGR order.
    const width = this.width
    const height = this.height
    this.currentFramePixelsData = new Uint8Array(width * height * 3)

    const imageDataInBytes = imageData.data
    let count = 0
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const b = (i * width * 4) + j * 4
        this.currentFramePixelsData[count++] = imageDataInBytes[b]      // B.
        this.currentFramePixelsData[count++] = imageDataInBytes[b + 1]  // G.
        this.currentFramePixelsData[count++] = imageDataInBytes[b + 2]  // R.
      }
    }

    // Use NeuQuant to analyse current frame colors and creates color map.
    this.analyseColor()
  }
}

/**
 * Option for Gif.
 *
 * @interface IGifOptions
 */
interface IGifOptions {
  /**
   * Image width.
   *
   * @type {number}
   * @memberof IGifOptions
   */
  width: number

  /**
   * Image height.
   *
   * @type {number}
   * @memberof IGifOptions
   */
  height: number

  /**
   * Delay between each frames.
   *
   * @type {number}
   * @memberof IGifOptions
   */
  delay?: number

  /**
   * Image quality.
   * This will affect quality of color quantization (conversion of images to the maximum 256
   * colors allowed by the GIF specification).
   * Lower values (minimum = 1) produce better colors, but slow processing significantly.
   * 10 is the default, and produces good color mapping at reasonable speeds.
   * Values greater than 20 do not yield significant improvements in speed.
   *
   * @type {number}
   * @memberof IGifOptions
   */
  quality?: number

  /**
   * Repeat configuration.
   *
   *  -1: No repeat.
   *  0: Infinite loop.
   *  Anything else: Repeat time.
   *
   * @type {number}
   * @memberof IGifOptions
   */
  repeat?: -1 | 0 | number

  /**
   * The transparent color for the last added frame and any subsequent frames.
   * Since all colors are subject to modification in the quantization process,
   * the color in the final palette for each frame closest to the given color
   * becomes the transparent color for that frame. May be set to null to
   * indicate no transparent color.
   *
   * @type {*}
   * @memberof IGifOptions
   */
  transparentColor?: any
}
