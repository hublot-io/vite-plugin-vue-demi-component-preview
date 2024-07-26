//@ts-ignore
import * as vue from "vue-demi";
//@ts-ignore
import { DefineComponent } from 'vue-demi';

const { h } = vue;
const { isVue2 } = vue
const defineAsyncComponent = vue.defineAsyncComponent;

//@ts-ignore
export default function (app) {

	const location = globalThis.location;

	if (location && location.pathname.includes('/__preview/')) {

		const importPath = location.pathname.replace('/__preview', '');
		
			//@ts-ignore
		if (import.meta.hot) {
			fireHash();
			window.addEventListener('hashchange', fireHash);
		}
	

		if(isVue2){
			import(/* @vite-ignore */importPath).then(module => {
				import(/* @vite-ignore */importPath + '__preview.vue').then(previewModule => {
					const componentName = importPath.split("/")

					app.component = {
						[componentName[componentName.length-1].split(".")[0]] : module.default,
						'PreviewComponent': previewModule.default
					} 
					//@ts-ignore
					app.compnent = previewModule.default
				})
			})
		} else {
			const Component = defineAsyncComponent(() => import(/* @vite-ignore */importPath));
			const Layout = defineAsyncComponent(() => import(/* @vite-ignore */importPath + '__preview.vue'));
			
			(app._component as DefineComponent).setup = () => {
				return () => h(Layout, undefined, {
				//@ts-ignore
					default: (props: any) => h(Component, props)
				});
			};
	
		}
		
		
		function fireHash() {
			try {
					//@ts-ignore
				import.meta.hot?.send('vue-component-preview:hash', {
					file: importPath,
					text: location.hash ? atob(location.hash.substring(1)) : '',
				});
			} catch { }
		}
	}
}
