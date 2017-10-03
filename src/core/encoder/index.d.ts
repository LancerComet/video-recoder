/**
 * Interface for encoder.
 *
 * @interface IEncoderParam
 */
interface IEncoderParam {
  /**
   * The data that recorded by Recorder.
   *
   * @type {TRecordedFramesData}
   * @memberof IEncoderParam
   */
  recordedData: TRecordedFramesData

  /**
   * Width of gif.
   *
   * @type {number}
   * @memberof IEncoderParam
   */
  width: number

  /**
   * Height of gif.
   *
   * @type {number}
   * @memberof IEncoderParam
   */
  height: number

  /**
   * Frame rate.
   *
   * @type {number}
   * @memberof IEncoderParam
   */
  fps?: number

  /**
   * Repeat configuration.
   *
   * @type {TGiftRepeatType}
   * @memberof IEncoderParam
   */
  repeat?: TGiftRepeatType
}
