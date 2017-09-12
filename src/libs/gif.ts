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
  private width: number
  private height: number
  private packetByte: {
    globalColorTableFlag: 0 | 1
    colorResolution: number
    colorSortByte: 0 | 1
  }

  private globalColorTable: Array<Array<[number, number, number]>> | false

  private colors: number

  private fileHeader: ArrayBuffer
  private logicalDescriptor: ArrayBuffer
  private colorTableBuffer: ArrayBuffer

  /**
   * Create file header.
   *
   * @private
   * @memberof Gif
   */
  private createFileHeader () {
    const FILE_HEADER_LENGTH = 6
    const fileHeader = new ArrayBuffer(FILE_HEADER_LENGTH)
    const dataView = new DataView(fileHeader)

    // Write header data.
    const header = ['G', 'I', 'F', '8', '9', 'a']
    header.forEach((item, index) => dataView.setUint8(index, charToCode(item)))

    this.fileHeader = fileHeader
  }

  /**
   * Create Logical Screen Descriptor.
   *
   * @private
   * @memberof Gif
   */
  private createLogicalDescriptor () {
    /**
     * [
     *   width in 2 bytes
     *   height in 2 bytes
     *   packedByte in 1 byte
     *   background index in 1 byte
     *   pixel aspect radio in 1 byte
     * ]
     */

    const DESCRIPTOR_LENGTH = 7
    const descriptor = new ArrayBuffer(DESCRIPTOR_LENGTH)
    const dataView = new DataView(descriptor)

    // Write size info.
    // Each width and height takes 2 bytes.
    // GIF is a little-endian format.
    dataView.setUint16(this.width, 0, true)
    dataView.setUint16(this.height, 2, true)

    // Packed byte.
    // bit 0: Global color table flag.
    // bit 1 - 3: Color Resolution.
    // bit 4: Sort Flag to Global Color Table.
    // bit 5 - 7: Size of Global Color Table.
    const isUsingGlobalColorTable = this.globalColorTable ? 1 : 0
    const colorResolution = this.packetByte.colorResolution
    const sortFlag = this.packetByte.colorSortByte
    const packedByte = '' +
      isUsingGlobalColorTable +
      colorResolution.toString(2) +
      sortFlag +

    dataView.setUint8(0, 4)

    // Background index.
    dataView.setUint8(0, 5)

    // Pixel Aspect Radio.
    dataView.setUint8(0, 6)

    this.logicalDescriptor = descriptor
  }

  /**
   * Create global color table.
   *
   * @private
   * @memberof Gif
   */
  private createColorTable () {
    const colorTableBuffer = new ArrayBuffer(this.colors * 3)
    const dataView = new DataView(colorTableBuffer)
    const DEFAULT_COLOR = 0  // 0 - 255 each channel.

    // Create color maps.
    // Color map is the member in color table.
    // Each color map takes 3 bytes.
    for (let i = 0; i < this.colors; i += 3) {
      dataView.setUint8(i, DEFAULT_COLOR)      // r.
      dataView.setUint8(i + 1, DEFAULT_COLOR)  // g.
      dataView.setUint8(i + 2, DEFAULT_COLOR)  // B.
    }

    this.colorTableBuffer = colorTableBuffer
  }

  /**
   * Create image descriptor.
   *
   * @private
   * @memberof Gif
   */
  private createImageDescriptor () {
    /**
     * [
     *   0x2c               - 1 byte
     *   x offset           - 2 bytes
     *   y offset           - 2 bytes
     *   width              - 2 bytes
     *   height             - 2 bytes
     *   m, i, s, r, pixel  - 1 byte
     * ]
     */
    const imageDescriptor = new ArrayBuffer(10)
    const dataView = new DataView(imageDescriptor)

    // Descriptor starting flag.
    // Fixed value: 44 (00101100).
    dataView.setUint8(0, 44)

    // X offset.
    dataView.setUint16(1, 0, true)

    // Y offset.
    dataView.setUint16(3, 0, true)

    // Width.
    dataView.setUint16(5, this.width, true)

    // Height.
    dataView.setUint16(7, this.height, true)

    // m, 1, s, r, pixel
    dataView.setUint8(9, 1)
  }

  constructor (param: IGif) {
    this.width = param.width
    this.height = param.height
    this.packetByte = {
      globalColorTableFlag: param.gloalColorTable ? 1 : 0,
      colorResolution: param.packedByte.colorResolution,
      colorSortByte: param.packedByte.colorSortFlag
    }

    this.globalColorTable = param.gloalColorTable || false

    this.colors = param.colors

    this.createFileHeader()
    this.createLogicalDescriptor()
    this.createColorTable()
    this.createImageDescriptor()
  }
}

export {
  Gif
}

/**
 * Transform char to ASCII code.
 *
 * @param {string} char
 * @returns {number}
 */
function charToCode (char: string): number {
  return char.charCodeAt(0)
}

/**
 * Calc global color table size
 */
function calcGlobalColorTableSize () {
  // TODO: 2^(n+1) - 1
}

/**
 * Interface of param of Gif constuctor.
 *
 * @interface IGif
 */
interface IGif {
  /** Image Width. */
  width: number

  /** Image Height. */
  height: number

  /** Packed byte data. */
  packedByte: {
    /** Color resolution. */
    colorResolution: number

    /** Whether color in global color table is sort. */
    colorSortFlag: 0 | 1
  }

  /**
   * Global Color Table data.
   *
   * @type {Array<Array<[number, number, number]>>}
   * @memberof IGif
   */
  gloalColorTable?: Array<Array<[number, number, number]>>

  /** Color number of this gif file. */
  colors: number
}
