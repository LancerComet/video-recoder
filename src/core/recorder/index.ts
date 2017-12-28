/// <reference path="./index.d.ts" />

import { Ticker } from '../../utils/ticker'
import { Gif } from '../gif/gif'
import { download } from '../download'
import { isNumber } from '../../utils/is-number'

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 272
const DEFAULT_FPS = 15
const MILLISECONDS_PER_SECOND = 1000

class Recorder {
  /**
   * Target image width.
   *
   * @private
   * @type {number}
   * @memberof Recorder
   */
  private width: number = DEFAULT_WIDTH

  /**
   * Target image height.
   *
   * @private
   * @type {number}
   * @memberof Recorder
   */
  private height: number = DEFAULT_HEIGHT

  /**
   * FPS setting for video playback and gif.
   *
   * @private
   * @type {number}
   * @memberof Recorder
   */
  private fps: number = DEFAULT_FPS

  /**
   * Time between each frames.
   * Calculated from fps.
   *
   * @private
   * @type {number}
   * @memberof Recorder
   */
  private delay: number = null

  /**
   * Canvas element for rendering gif,
   *
   * @private
   * @type {HTMLCanvasElement}
   * @memberof Recorder
   */
  private canvas: HTMLCanvasElement

  /**
   * Context from canvas.
   *
   * @private
   * @type {CanvasRenderingContext2D}
   * @memberof Recorder
   */
  private context: CanvasRenderingContext2D

  /**
   * Video element that plays target video.
   *
   * @private
   * @type {HTMLVideoElement}
   * @memberof Recorder
   */
  private videoElement: HTMLVideoElement

  /**
   * Gif class object.
   * This is what you want.
   *
   * @private
   * @type {Gif}
   * @memberof Recorder
   */
  private gif: Gif

  /**
   * Recorded image data.
   *
   * @private
   * @type {ImageData[]}
   * @memberof Recorder
   */
  private recordedData: ImageData[] = []

  /**
   * If is in recording.
   *
   * @private
   * @type {boolean}
   * @memberof Recorder
   */
  private inRecording: boolean = false

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
   * Initialize canvas.
   *
   * @private
   * @memberof Recorder
   */
  private initCanvas () {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height

    const context = canvas.getContext('2d')

    this.canvas = canvas
    this.context = context
  }

  /**
   * Transfer video playback to canvas.
   *
   * @private
   * @memberof Recorder
   */
  private playVideoInCanvas () {
    const ticker = new Ticker(this.fps, () => {
      this.context.drawImage(this.videoElement, 0, 0, this.width, this.height)
    })
    ticker.start()
  }

  /**
   * Event handlers.
   *
   * @private
   * @type {{[eventName: string]: Function[]}}
   * @memberof Recorder
   */
  private eventHandlers: {[eventName: string]: Function[]} = {}

  /**
   * Emit target event.
   *
   * @private
   * @param {TRecorderEventType} eventName
   * @memberof Recorder
   */
  private emitEvent (eventName: TRecorderEventType) {
    this.eventHandlers[eventName].forEach(callback => callback())
  }

  /**
   * Register callbacks.
   *
   * @param {TRecorderEventType} eventName
   * @param {Function} callback
   * @memberof Recorder
   */
  on (eventName: TRecorderEventType, callback: Function) {
    if (typeof callback === 'function') {
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = []
      }
      this.eventHandlers[eventName].push(callback)
    }
  }

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
   * Render gif.
   *
   * @private
   * @memberof Recorder
   */
  private async renderExec () {
    // Add frame and render gif.
    for (let i = 0, length = this.recordedData.length; i < length; i++) {
      await this.gif.addFrame(this.recordedData[i])
    }

    this.gif.finish()
    this.emitEvent('encordingFinished')
  }

  /**
   * Start to record graphs.
   *
   * @memberof Recorder
   */
  startRecord () {
    if (!this.inRecording) {
      this.recordedData = []

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
    if (process.env.NODE_ENV === 'development') {
      console.log('[Recoder] Stop recording.')
    }

    this.ticker.stop()
    this.inRecording = false
    this.renderExec()
  }

  /**
   * Download gif file.
   *
   * @memberof Recorder
   */
  downloadGif () {
    const gifBinary = this.gif.getBinaryData()
    download(gifBinary, 'record.gif', 'image/gif')
  }

  constructor (options: IRecoderOptions) {
    if (isNumber(options.fps)) {
      this.fps = options.fps
    }

    // Transform fps to delay.
    this.delay = MILLISECONDS_PER_SECOND / this.fps

    if (isNumber(options.width)) {
      this.width = options.width
    }

    if (isNumber(options.height)) {
      this.height = options.height
    }

    if (typeof options.videoElement !== 'undefined') {
      this.videoElement = options.videoElement
    }

    this.initCanvas()
    this.playVideoInCanvas()
  }
}

export {
  Recorder
}

type TRecorderEventType = 'encordingFinished'
