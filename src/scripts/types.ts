import { BaseType, EnterElement, Selection } from 'd3';

export type Point = [number, number];

type DefaultSelection<
  GElement extends BaseType = BaseType,
  Datum = any,
  PElement extends BaseType = BaseType,
  PDatum = any
> = Selection<GElement, Datum, PElement, PDatum>;

export type DataSelection<D = {}> = DefaultSelection<BaseType, D, BaseType, any>;
