import { isNumber } from '../../utils/is-number'

class Gif {
  /** Image width. */
  private width: number

  /** Image height. */
  private height: number

  /** Delay between frame to frame. In hundreds. */
  private delay: number

  /** Current frame's pixel data in BGR order. No Alpha channel. */
  private currentFramePixelsData: Uint8Array

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

  constructor (options: IGifOptions) {
    if (
      !isNumber(options.width) ||
      !isNumber(options.height)
    ) {
      throw new TypeError('[Gif] Width and height must be provided.')
    }

    this.width = ~~options.width
    this.height = ~~options.height

    // Init fps.
    isNumber(options.delay) && this.setDelay(options.delay)

    // Write file head.
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

    // TODO: 158.
  }
}

interface IGifOptions {
  width: number
  height: number
  delay?: number
}
