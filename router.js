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
		if (false/*hashedRoute*/) {
			console.log(`Extracting hashed route`);
			return this.hashedRoutes[path];
		}
		return this.getRouteTree(path, this.routes);
	})();
	console.log(`routeTree`, routeTree);

	/* Если нашелся маршрут, то сохраняем его дерево на случай,
	   если мы захотим еще раз перейти на тот же маршрут.
	   Тогда при последующем запросе мы не будем искать и строить дерево
	   заново, а воспользуемся сохраненным результатом. */
	this.hashedRoutes[path] = routeTree;

	const lastRouteIndex = routeTree.length - 1;
	const baseAppRouterViewEl = this.baseApp.shadowRoot.querySelector('.router-view');
	let containerEl = baseAppRouterViewEl;
	routeTree.forEach((rt, index) => {
		this.clear(containerEl);
		const componentTitle = rt.component;
		const componentEl = document.createElement(componentTitle);
		containerEl.append(componentEl);

		containerEl = componentEl.shadowRoot.querySelector('.router-view');;

		/* data присваивается конечному роуту в случае, если задана */
		if (index !== lastRouteIndex) return;
		const matchedRoutePath = this.matchedRoute.path;
		const routeParams = this.getPathParams(path, matchedRoutePath);
		console.log(`routeParams`, routeParams);
		const newData = { ...data, ...routeParams };
		console.log(`newData`, newData);
		const dataKeys = Object.keys(newData);
		dataKeys.forEach(key => componentEl[key] = newData[key]);
	});
}

function getPathSegments(path) {
	return path.split('/').slice(1);
}

function comparePathWithRoutePath(requestedPath, routePath) {
	const requestedPathSegments = getPathSegments(requestedPath);
	const routePathSegments = getPathSegments(routePath);
	if (requestedPathSegments.length !== routePathSegments.length) return false;
	for (let i = 0; i < routePathSegments.length; i ++) {
		const routePathSegmentStartsWithColumn = routePathSegments[i][0] === ':';
		if (requestedPathSegments[i] !== routePathSegments[i] && !routePathSegmentStartsWithColumn) return false;
	}
	return true;
}

function getPathParams(requestedPath, correspondingRoutePath) {
	const params = {};
	const routePathSegments = this.getPathSegments(correspondingRoutePath);
	const requestedPathSegments = this.getPathSegments(requestedPath);
	if (routePathSegments.length !== requestedPathSegments.length) {
		throw new Error('Paths given have different number of segments.');
	}
	routePathSegments.forEach((routePathSegment, index) => {
		if (routePathSegment[0] === ':') {
			const paramName = routePathSegment.slice(1);
			const paramValue = requestedPathSegments[index];
			params[paramName] = paramValue;
		}
	});
	return params;
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
			isFound = this.comparePathWithRoutePath(pth, rts[i].path);
			this.matchedRoute = rts[i];
			if (isFound) break;

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
	this.routes = [...routes];
	this.currentPath = '/';
	this.previousPath = null;
	this.matchedRoute = null;
	this.hashedRoutes = {};
	this.getRouteTree = getRouteTree.bind(this);
	this.clear = clear.bind(this);
	this.getPathSegments = getPathSegments.bind(this);
	this.comparePathWithRoutePath = comparePathWithRoutePath.bind(this);
	this.getPathParams = getPathParams.bind(this);
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
		title: 'Catalog',
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
		path: '/catalog/:productId',
		component: 'w-product',
		title: 'Product'
	}
];

const router = new Router(routes);

export default router;