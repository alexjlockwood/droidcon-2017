import * as d3 from 'lib/d3';

type BaseType = d3.BaseType;
type EnterElement = d3.EnterElement;
type Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> = d3.Selection<
  GElement,
  Datum,
  PElement,
  PDatum
>;

type DefaultSelection<
  GElement extends BaseType = BaseType,
  Datum = any,
  PElement extends BaseType = BaseType,
  PDatum = any
> = Selection<GElement, Datum, PElement, PDatum>;

export type DataSelection<D = {}> = DefaultSelection<BaseType, D, BaseType, any>;

type Transition<
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
> = d3.Transition<GElement, Datum, PElement, PDatum>;

type DefaultTransition<
  GElement extends BaseType = BaseType,
  Datum = any,
  PElement extends BaseType = BaseType,
  PDatum = any
> = Transition<GElement, Datum, PElement, PDatum>;

export type DataTransition<D = {}> = DefaultTransition<BaseType, D, BaseType, any>;
