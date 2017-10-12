import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/app.js',
  output: {
    file: 'src/bundle.js',
    format: 'umd',
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
