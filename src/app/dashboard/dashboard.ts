import {Component, inject, signal} from '@angular/core';
import {FfmpegService} from '../ffmpeg.service';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {

  readonly videoSrc = signal<string | null>(null);
  protected readonly ffmpegService = inject(FfmpegService);
  readonly message = this.ffmpegService.message

  constructor() {
  }

  async load() {
    await this.ffmpegService.load()
  }

  async transcode() {
    try {
      this.videoSrc.set(await this.ffmpegService.transcode())
    } catch (e) {
      console.error(e);
    }
  }

}
