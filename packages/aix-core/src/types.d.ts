declare module 'langfuse' {
  export class Langfuse {
    constructor(config: any);
    trace(config: any): any;
    flushAsync(): Promise<void>;
  }
}
