class Gif {
  private width: number
  private height: number

  private fileHeader: ArrayBuffer
  private logicalDescriptor: ArrayBuffer
  private globalColorTable: ArrayBuffer

  /**
   * Create file header.
   *
   * @protected
   * @memberof Gif
   */
  protected createFileHeader () {
    const FILE_HEADER_LENGTH = 6
    const fileHeader = new ArrayBuffer(FILE_HEADER_LENGTH)
    const fileHeaderView = new DataView(fileHeader)

    // Write header data.
    const header = ['G', 'I', 'F', '8', '9', 'a']
    header.forEach((item, index) => fileHeaderView.setUint8(index, charToCode(item)))

    this.fileHeader = fileHeader
  }

  /**
   * Create Logical Screen Descriptor.
   *
   * @protected
   * @memberof Gif
   */
  protected createLogicalDescriptor () {
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
    const descriptorView = new DataView(descriptor)

    // Write size info.
    // Each width and height takes 2 bytes.
    descriptorView.setUint16(this.width, 0)
    descriptorView.setUint16(this.height, 2)

    // TODO: Fill correct data.
    // m, cr, s, pixel
    descriptorView.setUint8(0, 4)

    // Background index.
    descriptorView.setUint8(0, 5)

    // Pixel Aspect Radio.
    descriptorView.setUint8(0, 6)

    this.logicalDescriptor = descriptor
  }

  /**
   * Create global color table.
   *
   * @protected
   * @memberof Gif
   */
  protected createGlobalColorTable () {

  }

  constructor (param: IGif) {
    this.width = param.width
    this.height = param.height

    this.createFileHeader()
    this.createLogicalDescriptor()
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
}
