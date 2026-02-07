import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CDYgcZOp.mjs';
import { manifest } from './manifest_BuR2f-8n.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/mercadopago/success-payment.astro.mjs');
const _page2 = () => import('./pages/failure.astro.mjs');
const _page3 = () => import('./pages/success.astro.mjs');
const _page4 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/mercadopago/success-payment.ts", _page1],
    ["src/pages/failure.astro", _page2],
    ["src/pages/success.astro", _page3],
    ["src/pages/index.astro", _page4]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "b4d7021f-5c07-4f64-8571-40038ad158aa",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
