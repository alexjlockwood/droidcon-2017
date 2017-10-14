declare module 'bezier-js' {
  interface Point {
    x: number;
    y: number;
    z?: number;
  }

  export default class Bezier {
    constructor(points: Point[]);

    length(): number;

    split(t1: number, t2?: number): Bezier;
  }
}
