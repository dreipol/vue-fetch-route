import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: 'src/index.js',
    plugins: [
        resolve({
            jsnext: true,
        }),
        commonjs(),
    ],
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs',
        },
    ],
};
