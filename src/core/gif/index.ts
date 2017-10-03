/// <reference path="./index.d.ts" />

import { Frame } from './modules/frame'
import { ByteArray } from './modules/byte-array'
import { isNumber } from '../../utils/is-number'

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
  private fps: number = 10
  private repeat: TGiftRepeatType = -1
  private quality: number = 10
  private frames: Frame[] = []

  /** GIF File binary. */
  private output: ByteArray = new ByteArray()

  constructor (param: IGif) {
    // Basic configuration.
    if (!isNumber(param.width) || !isNumber(param.height)) {
      throw new TypeError('[Gif] Width and height must be provided in number.')
    }

    this.width = param.width
    this.height = param.height

    // Repeating.
    if (isNumber(param.repeat)) {
      this.repeat = param.repeat
    }

    // Quality.
    if (isNumber(param.quality)) {
      this.quality = param.quality
    }

    // FPS.
    if (isNumber(param.fps)) {
      this.fps = param.fps
    }

    // Write file header.
    this.writeUTFBytes('GIF89a')
  }

  /**
   * Write UTF Bytes to output binary.
   *
   * @private
   * @param {string} str
   * @memberof Gif
   */
  private writeUTFBytes (str: string) {
    this.output.writeUTFBytes(str)
  }

  /**
   * Create a new frame.
   *
   * @param {TRecordedSingleFrameData} singleFrameData
   * @memberof Gif
   */
  newFrame (singleFrameData: TRecordedSingleFrameData) {
    const frame = new Frame(singleFrameData, this.quality)
    this.frames.push(frame)
  }
}

export {
  Gif
}
