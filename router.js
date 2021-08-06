/* Структура route = { path, component, title, children } */

const clear = containerEl => {
	while (containerEl.firstChild) containerEl.firstChild.remove();
};

const openRouteComponent = (route, data) => {
	/* this должен ссылаться на Router */
	let routeTree = getRouteTree(route, this.routes);
	const lastRouteIndex = routeTree.length - 1;
	let containerEl = this.baseApp.routerViewEl;
	routeTree.forEach((rt, index) => {
		this.clear(containerEl);
		const componentTitle = rt.component;
		const componentEl = document.createElement(componentTitle);
		containerEl.append(componentEl);

		containerEl = componentEl.routerViewEl;

		/* data присваивается конечному роуту в случае, если задана */
		if (index !== lastRouteIndex) return;
		if (data) {
			const dataKeys = Object.keys(data);
			dataKeys.forEach(key => componentEl.key = data[key]);
		}
	});
};

const getRouteTree = (route, routes) => {
	if (!route) {
		console.error('Wrong route value:', route);
		return null;
	}
	let currentSearchPath = [];
	let isFound = false;
	const scanRouteTree = (rt, rts) => {
		for (let i = 0; i < rts.length; i++) {
			if (isFound) break;
			currentSearchPath.push(rts[i]);
			if (rts[i].path === rt.path) {
				isFound = true;
				break;
			}
			const hasChildren = rts[i].children && rts[i].children.length;
			if (hasChildren) {
				scanRouteTree(rt, rts[i].children);
			}
			if (!isFound) currentSearchPath.pop();
		}
	};
	scanRouteTree(route, routes);
	return currentSearchPath;
};

const to = (route, title, data) => {
	this.previousRoute = this.currentRoute;
	this.currentRoute = route;
	window.history.pushState(data, title, route.path);
	this.openRouteComponent(route, data);

};

function Router(routes) {
	/* Функция-конструктор. Принимает в качестве аргументов baseApp -
	   ссылкк на основной компонент приложения и routes - конфигурация раутов
	   для Web-приложения */
	this.routes = routes;
	this.currentRoute = '/';
	this.previousRoute = null;
	this.clear = clear;
	this.to = to;
	this.openRouteComponent = openRouteComponent;
}

const routes = [
	{
		path: '/',
		title: 'root',
		component: 'Title',
		children: [
			{
				path: '/users/',
				title: 'users',
				children: [
					{
						path: '/users/1',
						title: 'tasks'
					}
				]
			},
			{
				path: '/demo',
				title: 'demo'
			}
		]
	},
	{
		path: '/root2'
	},
	{
		path: '/root3'
	}
];

const router = new Router(routes);

export default router;