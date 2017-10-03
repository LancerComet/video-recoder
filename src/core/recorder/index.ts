/// <reference path="./index.d.ts" />

import { Ticker } from '../../utils/ticker'

class Recorder {
  private fps: number = 10
  private inRecording: boolean = false
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D

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
   * Recorded data.
   * Every single item in this array is the data of each frame.
   *
   * @type {TRecordedFramesData}
   * @memberof Recorder
   */
  recordedData: TRecordedFramesData = []

  /**
   * Record exec.
   *
   * @private
   * @memberof Recorder
   */
  private recordExec () {
    if (!this.inRecording) { return }

    // Get single frame image data.
    const frameImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const bufferData = frameImageData.data
    this.recordedData.push(bufferData)
  }

  /**
   * Clear all recorded data.
   *
   * @private
   * @memberof Recorder
   */
  private clearData () {
    this.recordedData = []
  }

  /**
   * Start to record graphs.
   *
   * @memberof Recorder
   */
  startRecord () {
    if (!this.inRecording) {
      this.clearData()

      // Create a new ticker to capture images in target frame rate.
      const ticker = new Ticker(this.fps, () => this.recordExec())
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

    if (process.env.NODE_ENV === 'development') {
      console.log('[Recoder] Stop recording.')
      console.log(this.recordedData)
    }
  }

  constructor (options: IRecoderOptions) {
    if (typeof options.fps === 'number') {
      this.fps = options.fps
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

