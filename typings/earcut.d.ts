declare module 'earcut' {
  type Point = number[];
  type Ring = Point[];
  type Polygon = Ring[];
  type Triangles = Point[];
  export default function earcut(points: Polygon): Triangles;
}
