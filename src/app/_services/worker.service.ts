export enum State {
  idle,
  working
}

export abstract class WorkerService {
  worker: Worker;
  state = State.idle;

  constructor() {
    this.initWorker();
  }

  get isIdle() {
    return this.state === State.idle;
  }

  get isWorking() {
    return this.state === State.working;
  }

  abstract workerMessage(data: any): void;

  initWorker() {
    this.worker = new Worker(new URL('./solution.worker', import.meta.url));
    this.worker.onmessage = ({data}) => {
      this.workerMessage(data);
    }
  }

  stop() {
    this.worker.terminate();
    this.initWorker();
    this.state = State.idle;
  }

  protected postMessage(data: any) {
    this.worker.postMessage(data);
    this.state = State.working;
  }
}
