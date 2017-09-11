import { Ticker } from './ticker'

class Recorder {
  private fps: number = 10
  private inRecording: boolean = false
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D

  /**
   * Contains recorded data.
   * Every single item in this array is the data of each frame.
   *
   * @private
   * @type {Uint8ClampedArray[]}
   * @memberof Recorder
   */
  private recordData: Uint8ClampedArray[] = []

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
    this.recordData.push(bufferData)
  }

  /**
   * Save data to Gif.
   *
   * @private
   * @memberof Recorder
   */
  private saveToGif () {

  }

  startRecord () {
    if (!this.inRecording) {
      this.inRecording = true
      const ticker = new Ticker(this.fps, () => this.recordExec())
      ticker.start()
    }
  }

  stopRecord () {
    this.inRecording = false
    this.saveToGif()
  }

  constructor (canvas: HTMLCanvasElement, fps: number = 10) {
    this.fps = fps
    this.canvas = canvas
    this.context = canvas.getContext('2d')
  }
}

export {
  Recorder
}
