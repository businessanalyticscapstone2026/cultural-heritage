import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-DuDV08C_.js
var $$splitComponentImporter = () => import("./explore-DaVSZzMp.mjs");
var Route = createFileRoute("/explore")({
	validateSearch: (search) => ({ q: search.q ?? "" }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
