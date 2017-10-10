const MAX_FRAMES_PER_SECONDS = 60

/**
 * Run requestAnimationFrame in limited frame rate.
 *
 * @class Ticker
 */
class Ticker {
  private fps: number
  private fpsInterval: number
  private callback: Function
  private rafID: any
  private i: number

  /**
   * Run raf in target frame rates.
   *
   * @memberof Ticker
   */
  start () {
    this.i = this.fpsInterval
    this.tick()
  }

  /**
   * Stop raf running process.
   *
   * @memberof Ticker
   */
  stop () {
    cancelAnimationFrame(this.rafID)
  }

  private tick () {
    if (this.i > 0) {
      this.i -= 1000 / MAX_FRAMES_PER_SECONDS
    } else {
      this.callback()
      this.i = this.fpsInterval
    }
    this.rafID = requestAnimationFrame(this.tick.bind(this))
  }

  constructor (fps: number, callback: Function) {
    this.fps = fps > 60 ? 60 : fps
    this.fpsInterval = 1000 / fps
    this.callback = callback
  }
}

export {
  Ticker
}
