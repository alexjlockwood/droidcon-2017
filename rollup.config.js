import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/out-tsc/main.js',
  output: {
    file: 'src/bundle.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      module: true,
    }),
  ],
  name: 'app',
};
