import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'dist/out-tsc/src/main.js',
  output: {
    file: 'src/bundle.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    commonjs({
      include: ['node_modules/earcut/**', 'node_modules/bezier-js/**'],
    }),
    resolve({
      jsnext: true,
      main: true,
      module: true,
    }),
    typescript({ typescript: require('typescript') }),
  ],
  name: 'app',
};
