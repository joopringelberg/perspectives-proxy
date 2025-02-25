import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/perspectives-proxy.ts',
  output: {
    file: 'dist/perspectives-proxy.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json', // Ensure Rollup uses the correct tsconfig file
      declaration: true,
      declarationDir: 'dist'
    })
  ]
};