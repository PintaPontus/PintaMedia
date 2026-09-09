import {Service, signal} from '@angular/core';
import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';

@Service()
export class FfmpegService {
  readonly message = signal('');
  readonly loaded = signal(false);
  private readonly ffmpeg = new FFmpeg();

  async load() {
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm';

    this.ffmpeg.on('log', ({type, message}) => {
      console.log(`[ffmpeg:${type}]`, message);
      this.message.set(message);
    });
    this.ffmpeg.on('progress', ({progress, time}) => {
      console.log('progress', progress, time);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        'text/javascript',
      ),
    });
    console.log('FFmpeg caricato');
    this.loaded.set(true);
  }

  async transcode() {
    await this.ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
    await this.ffmpeg.exec(
      ['-i', 'input.webm', '-threads', '8', '-c:v', 'libx264', '-preset', 'ultrafast', 'output.mp4']
    );
    const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array<ArrayBuffer>;
    return URL.createObjectURL(new Blob([data], {type: 'video/mp4'}));
  }
}
