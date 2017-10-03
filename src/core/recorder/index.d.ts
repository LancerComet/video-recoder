/**
 * Options for recoder.
 *
 * @interface IRecoderOptions
 */
interface IRecoderOptions {
  canvasElement: HTMLCanvasElement
  fps: number
}

/**
 * Recorded single frame pixel data.
 * Stands for the pixel data for each frame image.
 */
type TRecordedSingleFrameData = Uint8ClampedArray

/**
 * Recorded frames data.
 * The pixel data of every single frame is contained in this array.
 */
type TRecordedFramesData = TRecordedSingleFrameData[]
