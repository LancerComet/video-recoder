/**
 * Options for recoder.
 *
 * @interface IRecoderOptions
 */
interface IRecoderOptions {
  /**
   * Image width.
   *
   * @type {number}
   * @memberof IRecoderOptions
   */
  width: number

  /**
   * image height.
   *
   * @type {number}
   * @memberof IRecoderOptions
   */
  height: number

  /**
   * Target fps.
   *
   * @type {number}
   * @memberof IRecoderOptions
   */
  fps: number

  /**
   * Video element, source of video.
   *
   * @type {HTMLVideoElement}
   * @memberof IRecoderOptions
   */
  videoElement: HTMLVideoElement
}
