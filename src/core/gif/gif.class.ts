import { isNumber } from '../../utils/is-number'
import { NeuQuant } from './neu-quant'
import { LZWEncoder } from './lzw-encoder'
import { ByteArray } from './byte-array'

/**
 * Gif class definition.
 * Format spec reference:
 * http://www.onicos.com/staff/iz/formats/gif.html
 * http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
 * http://www.blogjava.net/georgehill/articles/6550.html
 *
 * @class Gif
 */
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

  /** Color table Will be global color table if first frame, otherwise local color table. */
  private colorTable: number[]

  /**
   * DisposalMethod Code, 0 for none dispose.
   * For more detail, check out this aritcle at section "Graphic Control Extension":
   * http://blog.csdn.net/wzy198852/article/details/17266507
   */
  private disposalMethodCode: number = 0

  /** Color depth. Always be 8. */
  private colorDepth: number = 8

  /** Color table size. Always be 7. */
  private colorTableSize: number = 7

  /** Transparent color. */
  private transparentColor: any = null

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
   * Write byte to GIF Raw bytes.
   *
   * @private
   * @param {number} value
   * @memberof Gif
   */
  private writeByte (value: number) {
    this.gifRawBytes.writeByte(value & 0xFF)
  }

  /**
   * Write bytes to GIF Raw bytes.
   *
   * @private
   * @param {number[]} value
   * @memberof Gif
   */
  private writeBytes (value: number[]) {
    this.gifRawBytes.writeBytes(value)
  }

  /**
   * Write 2 bytes to GIF Raw bytes in Little Endian.
   *
   * @private
   * @param {number} value
   * @memberof Gif
   */
  private writeShort (value: number) {
    // Little endian.
    this.gifRawBytes.writeByte(value & 0xFF)  // Over 255 will be reset to 0.
    this.gifRawBytes.writeByte((value >> 8) & 0xFf)
  }

  /**
   * Write UTF-8 string to GIF Raw bytes.
   *
   * @private
   * @param {string} str
   * @memberof Gif
   */
  private writeString (str: string) {
    this.gifRawBytes.writeUTFBytes(str)
  }

  /**
   * Use NeuQuant to analyse current frame colors and creates color map.
   *
   * @private
   * @memberof Gif
   */
  private analyseColor () {
    const imageQuant = new NeuQuant(this.currentFramePixelsData, this.quality)
    imageQuant.buildColormap()
    this.colorTable = imageQuant.getColormap()

    // Index pixels.
    // Pixel Count. 3 bytes represent one pixel.
    const pixelCount = this.currentFramePixelsData.length / 3
    this.indexedPixels = new Uint8Array(pixelCount)

    // Map image pixels to new palette.
    let j = 0
    for (let i = 0; i < pixelCount; i++) {
      const index = imageQuant.lookupRGB(
        this.currentFramePixelsData[j++] & 0xff,
        this.currentFramePixelsData[j++] & 0xff,
        this.currentFramePixelsData[j++] & 0xff
      )

      this.indexedPixels[i] = index
    }

    // Reset data.
    this.currentFramePixelsData = null

    // TODO: Add transparent color support sometime.
  }

  /**
   * Write logical screen descriptor information.
   * 7 bytes data.
   *
   * @private
   * @memberof Gif
   */
  private writeLSD () {
    // Logical canvas width and height.
    this.writeShort(this.width)
    this.writeShort(this.height)

    // Packed files.
    // Check more detail at "Logical Screen Descriptor":
    // http://giflib.sourceforge.net/whatsinagif/bits_and_bytes.html
    this.writeByte(
      0x80 |               // 1: Global color table using flag. (0 is no global color table, 1 is used.)
      0x70 |               // 2 - 4: Color resulotion.
      0x00 |               // 5: Global color table sort flag: If the values is 1, then the colors in the
                           //    global color table are sorted in order of "decreasing importance,"
                           //    which typically means "decreasing frequency" in the image.
      this.colorTableSize  // 6 - 8: Global color table size.
    )

    // Background color index.
    this.writeByte(0)

    // Pixel aspect ratio, 0 for 1:1.
    this.writeByte(0)
  }

  /**
   * Write global / local color table data.
   * Will write global color table if is first frame.
   * Otherwise local color table.
   *
   * @private
   * @memberof Gif
   */
  private writePalette () {
    this.writeBytes(this.colorTable)

    // Fill rest empty color position to 0.
    const restColorLength = (3 * 256) - this.colorTable.length  // Max color count - exsiting color count.
    for (let i = 0; i < restColorLength; i++) {
      this.writeByte(0)
    }
  }

  /**
   * Write Netscape apoplication extension to indicate repeat count.
   * Check more detail at section "Application Extension":
   * http://giflib.sourceforge.net/whatsinagif/bits_and_bytes.html
   *
   * @private
   * @memberof Gif
   */
  private writeApplicationExtension () {
    this.writeByte(0x21)  // 1: GIF Extension Code.
    this.writeByte(0xFF)  // 2: Application Extension Label, always be 255.
    this.writeByte(11)  // 3: Length of Application Block, always be 11.
    this.writeString('NETSCAPE2.0')  // 4 - 14: String "NETSCAPE2.0".
    this.writeByte(3)  // 15: Length of Data Sub-Block, alaways be 3.
    this.writeByte(1)  // 16: Loop block ID, always be 1.
    this.writeShort(this.repeat)  // 17 - 18: Loop count integer in 2 bytes, little-endian.
    this.writeByte(0)  // 19: Sub-Block Terminator.
  }

  /**
   * Write graphics control extension.
   * 4-byte data.
   *
   * @private
   * @memberof Gif
   */
  private writeGraphicsControlExtension () {
    this.writeByte(0x21)    // 1: Extension Introducer. Always be 0x21.
    this.writeByte(0xF9)  // 2: Graphics Control Label. Always be F9.
    this.writeByte(4)     // 3: Byte size, this extension is a 4-byte extension.

    // Packet field.
    let disposalMethodsCode = 0  // 0: No action.
    let transparentColorFlag = 0

    if (this.transparentColor !== null) {
      disposalMethodsCode = 2
      transparentColorFlag = 1
    }

    // Check desposalMethodCode.
    if (this.disposalMethodCode >= 0) {
      disposalMethodsCode = this.disposalMethodCode & 7
    }

    disposalMethodsCode <<= 2

    // Fill Packet fields.
    this.writeByte(
      0 |  // 1-3: Reserved fields, always be 0.
      disposalMethodsCode |  // 4 - 6: Disposal Methds code.
      0 |  // 7: User input flag, always be 0.
      transparentColorFlag  // 8: Transparent Color Flag.
    )

    // Delay time.
    this.writeShort(this.delay)

    // Transparent Color Index.
    this.writeByte(this.transparentColorIndex)

    // Block terminator, always be 0.
    this.writeByte(0)
  }

  /**
   * Write image descriptor data to GIF raw bytes data.
   * 10 bytes.
   *
   * @private
   * @memberof Gif
   */
  private writeImageDescriptor () {
    this.writeByte(0x2C)          // 1: Image Seperator, always be 2C.
    this.writeShort(0)            // 2 - 3: Image left, normally this will be 0.
    this.writeShort(0)            // 4 - 5: Image top, normally this will be 0.
                                  // For this recoder, both top and left should be 0.
    this.writeShort(this.width)   // 6 - 7: Image width.
    this.writeShort(this.height)  // 8 - 9: Image height.

    // Packet fields.
    // If this is the first frame, no local color table represents.
    if (this.isFirstFrame) {
      this.writeByte(0)
    } else {
      this.writeByte(
        0x80 |  // 1: Local color table flag, TODO: Issue opened https://github.com/jnordberg/gif.js/issues/83
        0 |  // 2: Interlace Flag.
        0 |  // 3: Sorted: 0 for No.
        0 |  // 4 - 5: Reserved, always be 0.
        this.colorTableSize  // 6 - 8: Size of local color table.
      )
    }
  }

  /**
   * Write image pixels data into GIF raw bytes data.
   *
   * @private
   * @memberof Gif
   */
  private writeImagePixels () {
    const encoder = new LZWEncoder(this.width, this.height, this.indexedPixels, this.colorDepth)
    encoder.encode(this.gifRawBytes)
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

    // Set disposal methods code.
    if (isNumber(options.disposalMethodCode)) {
      this.disposalMethodCode = options.disposalMethodCode
    }

    // Write file head.
    this.writeString('GIF89a')
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

    const imageDataInBytes = imageData.data

    // Extracts ImageData to pixel byte array in BGR order.
    const width = this.width
    const height = this.height
    this.currentFramePixelsData = new Uint8Array(width * height * 3)

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

    // Do first frame jobs if necessary.
    if (this.isFirstFrame) {
      this.writeLSD()  // Add logical screen discriptor information.
      this.writePalette()  // Add global color table.

      // Add repeat information.
      if (this.repeat >= 0) {
        this.writeApplicationExtension()
      }
    }

    // Write graphics control extension.
    this.writeGraphicsControlExtension()

    // Write image descriptor.
    this.writeImageDescriptor()

    if (!this.isFirstFrame) {
      this.writePalette()
    }

    this.writeImagePixels()  // Write image pixels data that following image descriptor.
    this.isFirstFrame = false
  }

  /**
   * Frame adding finished.
   * Append file trailer to seal raw data.
   *
   * @memberof Gif
   */
  finish (): Uint8Array {
    this.writeByte(0x3B)
    return this.gifRawBytes.getBinaryData()
  }
}

export {
  Gif
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

  /**
   * DisposalMethod Code, 0 for none dispose.
   * For more detail, check out this aritcle at section "Graphic Control Extension":
   * http://blog.csdn.net/wzy198852/article/details/17266507
   *
   * @type {number}
   * @memberof IGifOptions
   */
  disposalMethodCode?: number
}
