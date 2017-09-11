class Gif {
  private width: number
  private height: number
  private colors: number

  private fileHeader: ArrayBuffer
  private logicalDescriptor: ArrayBuffer
  private colorTable: ArrayBuffer

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
     *   m, cr, s, pixel in 1 byte
     *   background index in 1 byte
     *   pixel aspect radio in 1 byte
     * ]
     */

    const DESCRIPTOR_LENGTH = 7
    const descriptor = new ArrayBuffer(DESCRIPTOR_LENGTH)
    const dataView = new DataView(descriptor)

    // Write size info.
    // Each width and height takes 2 bytes.
    dataView.setUint16(this.width, 0)
    dataView.setUint16(this.height, 2)

    // TODO: Fill correct data.
    // m, cr, s, pixel
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
    const colorTable = new ArrayBuffer(this.colors * 3)
    const dataView = new DataView(colorTable)
    const DEFAULT_COLOR = 0  // 0 - 255 each channel.

    // Create color maps.
    // Color map is the member in color table.
    // Each color map takes 3 bytes.
    for (let i = 0; i < this.colors; i += 3) {
      dataView.setUint8(i, DEFAULT_COLOR)      // r.
      dataView.setUint8(i + 1, DEFAULT_COLOR)  // g.
      dataView.setUint8(i + 2, DEFAULT_COLOR)  // B.
    }

    this.colorTable = colorTable
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
    dataView.setUint16(1, 0)

    // Y offset.
    dataView.setUint16(3, 0)

    // Width.
    dataView.setUint16(5, this.width)

    // Height.
    dataView.setUint16(7, this.height)

    // m, 1, s, r, pixel
    dataView.setUint8(9, 1)
  }

  constructor (param: IGif) {
    this.width = param.width
    this.height = param.height

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
 * Interface of param of Gif constuctor.
 *
 * @interface IGif
 */
interface IGif {
  width: number
  height: number
  colors: number
}
