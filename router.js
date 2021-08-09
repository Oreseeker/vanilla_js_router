/* Структура route = { path, component, title, children } */

function clear(containerEl) {
	while (containerEl.firstChild) containerEl.firstChild.remove();
}

function openRouteComponent(path, data) {
	/* this должен ссылаться на Router */

	/* Если мы заходили по какому-то маршруту, то мы уже сохранили
	   дерево маршрутов, нет смысла его строить заново, воспользуеммся
	   сохраненным результатом */
	let routeTree = (() => {
		const hashedRoute = this.hashedRoutes[path];
		if (hashedRoute) {
			console.log(`Extracting hashed route`);
			return this.hashedRoutes[path];
		}
		return this.getRouteTree(path, this.routes);
	})();

	/* Если нашелся маршрут, то сохраняем его дерево на случай,
	   если мы захотим еще раз перейти на тот же маршрут.
	   Тогда при последующем запросе мы не будем искать и строить дерево
	   заново, а воспользуемся сохраненным результатом. */
	this.hashedRoutes[path] = routeTree;

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
}

function getRouteTree(path, routes) {
	if (!path) {
		console.error('Wrong path value:', path);
		return null;
	}
	let currentSearchPath = [];
	let isFound = false;
	const scanRouteTree = (pth, rts) => {
		for (let i = 0; i < rts.length; i++) {
			if (isFound) break;
			currentSearchPath.push(rts[i]);
			if (rts[i].path === pth) {
				isFound = true;
				break;
			}
			const hasChildren = rts[i].children && rts[i].children.length;
			if (hasChildren) {
				scanRouteTree(path, rts[i].children);
			}
			if (!isFound) currentSearchPath.pop();
		}
	};
	scanRouteTree(path, routes);
	return currentSearchPath;
}

function to(path, title, data) {
	this.previousPath = this.currentPath;
	this.currentPath = path;
	window.history.pushState(data, title, path);
	this.openRouteComponent(path, data);
}

function Router(routes) {
	/* Функция-конструктор. Принимает в качестве аргументов
	   routes - конфигурация раутов для Web-приложения */
	console.log(`routes`, routes);
	this.routes = routes;
	this.currentPath = '/';
	this.previousPath = null;
	this.hashedRoutes = {};
	this.getRouteTree = getRouteTree.bind(this);
	this.clear = clear.bind(this);
	this.to = to.bind(this);
	this.openRouteComponent = openRouteComponent.bind(this);
}

const routes = [
	{
		path: '/',
		component: 'w-main',
		title: 'Main'
	},
	{
		path: '/catalog',
		component: 'w-catalog',
		title: 'Catalog'
	},
	{
		path: '/about-us',
		component: 'w-about-us',
		title: 'About us'
	},
	{
		path: '/feedback',
		component: 'w-feedback',
		title: 'Feedback'
	},
	{
		path: '/catalog/:id:/',
		component: 'w-product',
		title: 'Product'
	}
];

const router = new Router(routes);

export default router;