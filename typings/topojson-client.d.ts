declare module 'topojson-client' {
  export function feature(topology: any, object: any): any;
  export function neighbors(objects: any[]): any[];
  export function mergeArcs(topology: any, objects: any[]): any;
  export function mesh(topology, object: any, filter?: Function): any;
}
