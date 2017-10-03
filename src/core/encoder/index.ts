/// <reference path="./index.d.ts" />

import { Gif } from '../gif'
import { isNumber } from '../../utils/is-number'

/**
 * Encoder receives Uint8ClampArray[] and save theme to GIF.
 */

/**
 * Encode Uint8ClampArray[] to GIF file.
 *
 * @param {IEncoderParam} param
 * @returns {Gif}
 */
function encode (param: IEncoderParam): Gif {
  if (!isNumber(param.width) || !isNumber(param.height)) {
    throw new TypeError('[Encoder] Width and height must be provided in number.')
  }

  const gifOption = {
    width: param.width,
    height: param.height
  }

  if (isNumber(param.fps)) {
    gifOption['fps'] = param.fps
  }

  if (isNumber(param.repeat)) {
    gifOption['repeat'] = param.repeat
  }

  // Create a new gif.
  const gif = new Gif(gifOption)

  // Create every single frame.
  const recordedPixelsData = param.recordedData
  for (let i = 0, length = recordedPixelsData.length; i < length; i++) {
    const singleFrameData: TRecordedSingleFrameData = recordedPixelsData[i]
    gif.newFrame(singleFrameData)
  }

  return gif
}

export {
  encode
}

