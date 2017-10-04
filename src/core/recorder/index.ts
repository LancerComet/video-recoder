/// <reference path="./index.d.ts" />

import { Ticker } from '../../utils/ticker'
import { Gif } from '../gif/gif'
import { download } from '../download'

class Recorder {
  private delay: number = 150
  private inRecording: boolean = false
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private gif: Gif
  private recordedData: ImageData[] = []

  /**
   * Ticker object.
   * This will be set to a new Ticker once recording is started.
   *
   * @private
   * @type {Ticker}
   * @memberof Recorder
   */
  private ticker: Ticker

  /**
   * Record exec.
   *
   * @private
   * @memberof Recorder
   */
  private recordExec () {
    if (!this.inRecording) { return }

    // Capture image data and save it.
    this.recordedData.push(this.context.getImageData(
      0, 0, this.canvas.width, this.canvas.height
    ))

    if (process.env.NODE_ENV === 'development') {
      console.log('[Recorder] Frame captured.')
    }
  }

  /**
   * Start to record graphs.
   *
   * @memberof Recorder
   */
  startRecord () {
    if (!this.inRecording) {
      // Init gif.
      const gif = new Gif({
        width: this.canvas.width,
        height: this.canvas.height,
        repeat: 0,
        quality: 10,
        delay: this.delay
      })
      this.gif = gif

      // Create a new ticker to capture images in target frame rate.
      const ticker = new Ticker(this.delay, () => this.recordExec())
      ticker.start()
      this.ticker = ticker

      this.inRecording = true

      if (process.env.NODE_ENV === 'development') {
        console.log('[Recoder] Start recording.')
      }
    }
  }

  /**
   * Stop current recording.
   *
   * @memberof Recorder
   */
  stopRecord () {
    this.ticker.stop()
    this.inRecording = false

    const gif = this.gif

    // Add frame and render gif.
    for (let i = 0, length = this.recordedData.length; i < length; i++) {
      gif.addFrame(this.recordedData[i])
    }

    const gifBinary = gif.finish()
    download(gifBinary, 'record.gif', 'image/gif')

    this.recordedData = []

    if (process.env.NODE_ENV === 'development') {
      console.log('[Recoder] Stop recording.')
      console.log(gifBinary)
    }
  }

  constructor (options: IRecoderOptions) {
    if (typeof options.delay === 'number') {
      this.delay = options.delay
    }

    if (Object.prototype.toString.call(options.canvasElement) === '[object HTMLCanvasElement]') {
      this.canvas = options.canvasElement
    }

    this.context = this.canvas.getContext('2d')
  }
}

export {
  Recorder
}

