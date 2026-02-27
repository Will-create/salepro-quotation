const Fs = require('fs');
const Path = require('path');

const DATA_DIR = Path.join(process.cwd(), 'data');
const QUOTES_FILE = Path.join(DATA_DIR, 'quotes.json');
const PRODUCTS_FILE = Path.join(DATA_DIR, 'products.json');
const ADMINS_FILE = Path.join(DATA_DIR, 'admins.json');
const WAITLIST_FILE = Path.join(DATA_DIR, 'waitlist.json');
const ADMIN_COOKIE = 'admin_session';

exports.install = function() {
	F.auth(function($) {
		const token = $.controller ? $.controller.cookie(ADMIN_COOKIE) : null;
		const admins = readJSON(ADMINS_FILE);
		const user = Object.values(admins).find(a => a && a.token && a.token === token);
		$.callback(user ? { username: user.username, name: user.name || user.username, role: 'admin' } : null);
	});

	seedProducts();
	seedAdmins();
	ROUTE('GET /', view_home);
	ROUTE('GET /about/', view_about);
	ROUTE('GET /contact/', view_contact);
	ROUTE('GET /marketplace/', view_marketplace);
	ROUTE('GET /services/software-development/', view_service_software);
	ROUTE('GET /services/websites/', view_service_websites);
	ROUTE('GET /services/mobile-apps/', view_service_mobile);
	ROUTE('GET /services/consulting/', view_service_consulting);
	ROUTE('GET /salepro/', view_salepro);
	ROUTE('GET /salepro/restaurant/', view_salepro_restaurant);
	ROUTE('GET /salepro/quotation/', view_salepro_quotation);
	ROUTE('+GET /admin/*', view_admin);
	ROUTE('-GET /admin/*', view_login);
	ROUTE('-POST /admin/login/', admin_login);
	ROUTE('+POST /admin/logout/', admin_logout);

	ROUTE('GET /api/quotes/', quote_get);
	ROUTE('POST /api/quotes/', quote_save);

	ROUTE('GET /api/products/', products_list);
	ROUTE('GET /api/products/read/', product_read);
	ROUTE('POST /api/waitlist/', waitlist_add);
	ROUTE('+GET /api/admin/overview/', admin_overview);
	ROUTE('+GET /api/admin/products/', admin_products_list);
	ROUTE('+POST /api/admin/products/upsert/', admin_products_upsert);
};

function view_home($) { $.view('index'); }
function view_about($) { $.view('about'); }
function view_contact($) { $.view('contact'); }
function view_marketplace($) { $.view('marketplace'); }
function view_service_software($) { $.view('service_software'); }
function view_service_websites($) { $.view('service_websites'); }
function view_service_mobile($) { $.view('service_mobile'); }
function view_service_consulting($) { $.view('service_consulting'); }
function view_salepro($) { $.view('salepro'); }
function view_salepro_restaurant($) { $.view('salepro_restaurant'); }
function view_salepro_quotation($) { $.view('salepro_quotation'); }
function view_login($) { $.view('admin_login'); }
function view_admin($) { $.view('admin'); }

function ensureDataFiles() {
	if (!Fs.existsSync(DATA_DIR))
		Fs.mkdirSync(DATA_DIR, { recursive: true });
	if (!Fs.existsSync(QUOTES_FILE))
		Fs.writeFileSync(QUOTES_FILE, '{}', 'utf8');
	if (!Fs.existsSync(PRODUCTS_FILE))
		Fs.writeFileSync(PRODUCTS_FILE, '{}', 'utf8');
	if (!Fs.existsSync(ADMINS_FILE))
		Fs.writeFileSync(ADMINS_FILE, '{}', 'utf8');
	if (!Fs.existsSync(WAITLIST_FILE))
		Fs.writeFileSync(WAITLIST_FILE, '[]', 'utf8');
}

function readJSON(file) {
	ensureDataFiles();
	try {
		return JSON.parse(Fs.readFileSync(file, 'utf8') || '{}');
	} catch (e) {
		return {};
	}
}

function writeJSON(file, data) {
	ensureDataFiles();
	Fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function seedAdmins() {
	const admins = readJSON(ADMINS_FILE);
	const username = process.env.ADMIN_USER || 'admin';
	if (admins[username])
		return;
	admins[username] = {
		username: username,
		password: process.env.ADMIN_PASS || 'admin123',
		name: 'Administrator',
		token: null
	};
	writeJSON(ADMINS_FILE, admins);
}

function seedProducts() {
	const store = readJSON(PRODUCTS_FILE);
	if (!store['salepro-pos']) {
		store['salepro-pos'] = {
		slug: 'salepro-pos',
		name: 'SalePro POS',
		short: 'Open-source POS, Inventory, HRM et Accounting sous Laravel pour retail, warehouse et enterprise.',
		heroTitle: 'SalePro POS - Laravel-Based Inventory & Point of Sale System',
		heroSubtitle: 'SalePro POS est une solution open-source complete pour gerer stock, ventes, achats, paiements, RH, clients et comptabilite depuis n\'importe ou.',
		badges: ['Self-hosted', 'Full source code', 'Lifetime free updates', 'Online / Offline'],
		images: {
			hero: 'https://picsum.photos/id/180/1400/820',
			pos: 'https://picsum.photos/id/0/1200/760',
			inventory: 'https://picsum.photos/id/3/1200/760',
			reporting: 'https://picsum.photos/id/20/1200/760'
		},
		type: ['retail', 'ecommerce', 'hr', 'accounting'],
		deploy: ['local', 'cloud', 'hybrid'],
		pricing: ['annual', 'lifetime'],
		featured: 1,
		isNew: 0,
		link: '/salepro',
		cta: 'Voir le produit',
		tags: [
			'laravel', 'pos', 'inventory', 'stock', 'warehouse', 'supermarket', 'enterprise',
			'purchase', 'sale', 'payment', 'hrm', 'accounting', 'dashboard', 'reporting',
			'multi-warehouse', 'barcode', 'receipt-printer', 'weight-scale', 'multi-currency',
			'multi-language', 'gst', 'whatsapp', 'ecommerce-addon', 'woocommerce-addon',
			'offline', 'online', 'self-hosted', 'open-source'
		],
		marketingHighlights: [
			'Interface POS moderne, rapide et tactile, prete pour le terrain.',
			'Controle stock avance avec lot, expiration, variantes et multi-depots.',
			'Vue business en temps reel avec dashboard intelligent et rapports filtres.',
			'Plateforme complete: POS + inventory + HRM + accounting dans une seule base.'
		],
		keyBenefits: [
			'Advanced stock & inventory control with expiry, variants & multi-warehouse',
			'Modern POS interface with multi-currency and payment gateway support',
			'Smart dashboard and detailed real-time reporting',
			'Built-in HRM module with attendance, payroll, and departments',
			'Basic accounting module with bank transfers and balance sheets',
			'Multi-language, multi-currency, and GST-ready',
			'Supports barcode scanners, receipt printers, and weight scales'
		],
		coreFeatures: [
			{
				title: 'Dashboard',
				items: [
					'Sales, purchases, returns, and profit overview',
					'Monthly charts, cash flow, top-selling products',
					'Recent activities: sales, purchases, quotations'
				]
			},
			{
				title: 'Products',
				items: [
					'Standard, digital, combo, and service types',
					'Variants, batch/expiry, IMEI/serial, weight scale support',
					'Tax, GST, promotional pricing, barcode printing',
					'CSV import/export, product units, multiple images'
				]
			},
			{
				title: 'Sales & POS',
				items: [
					'Touchscreen-friendly POS design',
					'Installment payment feature',
					'Coupons, discounts, tax, shipping, gift card',
					'Draft/hold sale, suspend sales, multiple payments',
					'Payment gateways + custom payments, email / WhatsApp receipts',
					'Customer display feature and sales commission agents',
					'Search by product code, variant code, IMEI/serial',
					'Sell by retail / wholesale price'
				]
			},
			{
				title: 'Purchases',
				items: [
					'Vendor & purchase order management',
					'Returns, taxes, discounts, shipping',
					'Document uploads, CSV import',
					'Purchase payment and payment document upload'
				]
			},
			{
				title: 'Stock Transfer & Adjustments',
				items: [
					'Multi-warehouse transfers',
					'Stock counting & adjustment tools',
					'Bulk stock adjustment via CSV upload'
				]
			},
			{
				title: 'Production / Manufacturing',
				items: [
					'Log production of combo products from ingredient products',
					'Production increases end-product stock and decreases ingredient stock',
					'Recipe / BOM (Bill of Materials) support'
				]
			},
			{
				title: 'Accounting',
				items: [
					'Bank accounts, transfers, balance sheet',
					'Auto-linked transactions'
				]
			},
			{
				title: 'HRM',
				items: [
					'Employee records, departments, payroll',
					'Attendance, holiday/leave management'
				]
			},
			{
				title: 'People',
				items: [
					'Customers, suppliers and dual-role profiles',
					'Opening balance / due tracking',
					'Bulk promotion message via WhatsApp'
				]
			},
			{
				title: 'Reports',
				items: [
					'Sales, purchase, profit/loss, payments, customers, suppliers',
					'Stock expiry, alerts, daily targets, product reports',
					'CSV/PDF export with advanced filters'
				]
			},
			{
				title: 'Settings',
				items: [
					'Invoice printing and layout options',
					'Roles & permissions, user groups, tax rates',
					'Custom fields, SMS integrations, backup',
					'Dark mode, table layout, discount plans'
				]
			}
		],
		addons: [
			'eCommerce Add-on - Launch your eCommerce store from the same dashboard',
			'Restaurant Add-on - Kitchen, waiter, floor and tables management (Coming Soon)',
			'WooCommerce Add-on - Sync POS with your WooCommerce store'
		],
		globalReady: 'SalePro supports 18+ languages and all currencies. Easy to localize and deploy worldwide.',
		faq: [
			{
				q: 'Can I use it offline?',
				a: 'Yes. It works with Laragon, XAMPP, or MAMP. Official support focuses on live server setup.'
			},
			{
				q: 'What payment methods are supported?',
				a: 'Cash, Card, Razorpay, Cheque, Gift Card, Reward Points, plus custom payment options.'
			},
			{
				q: 'Are future updates free?',
				a: 'Yes. Lifetime free updates are included.'
			}
		],
		supportLinks: {
			documentation: '#',
			support: '#',
			featureRequest: '#',
			livePreview: '#',
			screenshots: '#'
		}
	};
	}

	if (!store['compta-bf']) {
		store['compta-bf'] = {
		slug: 'compta-bf',
		name: 'Compta BF',
		short: 'Pilotage comptable simplifie pour PME locales.',
		type: ['accounting'],
		deploy: ['cloud'],
		pricing: ['annual'],
		featured: 0,
		isNew: 1,
		image: 'https://picsum.photos/id/20/900/700',
		tags: ['comptabilite', 'rapports', 'fiscalite'],
		link: '#',
		cta: 'Bientot disponible'
	};
	}

	if (!store['rh-flow']) {
		store['rh-flow'] = {
		slug: 'rh-flow',
		name: 'RH Flow',
		short: 'Gestion des conges, presences et dossiers employes.',
		type: ['hr'],
		deploy: ['cloud', 'hybrid'],
		pricing: ['annual'],
		featured: 0,
		isNew: 0,
		image: 'https://picsum.photos/id/64/900/700',
		tags: ['rh', 'conges', 'personnel'],
		link: '#',
		cta: 'Bientot disponible'
	};
	}

	if (!store['shop-lite']) {
		store['shop-lite'] = {
		slug: 'shop-lite',
		name: 'Shop Lite',
		short: 'Point de vente leger pour petits commerces.',
		type: ['retail'],
		deploy: ['local'],
		pricing: ['lifetime'],
		featured: 0,
		isNew: 1,
		image: 'https://picsum.photos/id/292/900/700',
		tags: ['pos', 'retail', 'caisse'],
		link: '#',
		cta: 'Bientot disponible'
	};
	}

	if (!store['salepro-restaurant']) {
		store['salepro-restaurant'] = {
			slug: 'salepro-restaurant',
			name: 'SalePro Restaurant',
			short: 'Application dediee aux restaurants: salle, cuisine, tables, commandes et caisse. [Bientot]',
			type: ['restaurant'],
			deploy: ['cloud', 'hybrid'],
			pricing: ['annual'],
			featured: 1,
			isNew: 1,
			image: 'https://picsum.photos/id/1080/900/700',
			tags: ['restaurant', 'kitchen', 'tables', 'waiter', 'pos', 'online-order'],
			link: '/salepro/restaurant',
			cta: 'Voir la page'
		};
	}

	if (store['salepro-restaurant']) {
		store['salepro-restaurant'].link = '/salepro/restaurant';
		if (!store['salepro-restaurant'].cta || store['salepro-restaurant'].cta === 'Bientot disponible')
			store['salepro-restaurant'].cta = 'Voir la page';
	}

	writeJSON(PRODUCTS_FILE, store);
}

function quote_save($) {
	const body = $.body || {};
	const ref = (body.ref || '').toString().trim();
	if (!ref) {
		$.json({ ok: false, error: 'Reference manquante' });
		return;
	}

	const store = readJSON(QUOTES_FILE);
	store[ref] = {
		ref: ref,
		createdAt: body.createdAt || new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		client: body.client || {},
		commercial: body.commercial || {},
		state: body.state || {},
		discount: body.discount || 0,
		solution: body.solution || null
	};
	writeJSON(QUOTES_FILE, store);
	$.json({ ok: true, ref: ref });
}

function quote_get($) {
	const ref = (($.query && $.query.ref) || '').toString().trim();
	if (!ref) {
		$.json({ ok: false, error: 'Reference manquante' });
		return;
	}
	const store = readJSON(QUOTES_FILE);
	const item = store[ref];
	if (!item) {
		$.json({ ok: false, error: 'Devis introuvable' });
		return;
	}
	$.json({ ok: true, data: item });
}

function products_list($) {
	const store = readJSON(PRODUCTS_FILE);
	const items = Object.values(store || {}).map(item => {
		if (!item)
			return null;
		return {
			slug: item.slug,
			name: item.name,
			short: item.short,
			type: item.type || [],
			deploy: item.deploy || [],
			pricing: item.pricing || [],
			featured: item.featured || 0,
			isNew: item.isNew || 0,
			image: (item.images && item.images.hero) || item.image || 'https://picsum.photos/id/3/900/700',
			tags: item.tags || [],
			link: item.link || '#',
			cta: item.cta || 'Voir'
		};
	}).filter(Boolean);
	$.json({ ok: true, items: items });
}

function product_read($) {
	const slug = (($.query && $.query.slug) || '').toString().trim();
	if (!slug) {
		$.json({ ok: false, error: 'Slug manquant' });
		return;
	}
	const store = readJSON(PRODUCTS_FILE);
	const item = store[slug];
	if (!item) {
		$.json({ ok: false, error: 'Produit introuvable' });
		return;
	}
	$.json({ ok: true, item: item });
}

function waitlist_add($) {
	const body = $.body || {};
	const product = (body.product || '').toString().trim() || 'salepro-restaurant';
	const name = (body.name || '').toString().trim();
	const company = (body.company || '').toString().trim();
	const phone = (body.phone || '').toString().trim();
	const email = (body.email || '').toString().trim();
	const note = (body.note || '').toString().trim();

	if (!name || (!phone && !email)) {
		$.json({ ok: false, error: 'Nom et contact requis' });
		return;
	}

	let list = readJSON(WAITLIST_FILE);
	if (!Array.isArray(list))
		list = [];

	list.push({
		id: Date.now().toString(36).toUpperCase(),
		product: product,
		name: name,
		company: company,
		phone: phone,
		email: email,
		note: note,
		createdAt: new Date().toISOString()
	});

	writeJSON(WAITLIST_FILE, list);
	$.json({ ok: true });
}

function admin_login($) {
	const body = $.body || {};
	const username = (body.username || '').toString().trim();
	const password = (body.password || '').toString();
	if (!username || !password) {
		$.json({ ok: false, error: 'Identifiants manquants' });
		return;
	}

	const admins = readJSON(ADMINS_FILE);
	const admin = admins[username];
	if (!admin || admin.password !== password) {
		$.json({ ok: false, error: 'Identifiants invalides' });
		return;
	}

	admin.token = (Date.now().toString(36) + Math.random().toString(36).substring(2)).toUpperCase();
	admin.lastLogin = new Date().toISOString();
	admins[username] = admin;
	writeJSON(ADMINS_FILE, admins);

	$.cookie(ADMIN_COOKIE, admin.token, '7 days');
	$.json({ ok: true, user: { username: admin.username, name: admin.name || admin.username } });
}

function admin_logout($) {
	const token = $.cookie(ADMIN_COOKIE);
	const admins = readJSON(ADMINS_FILE);
	for (const key of Object.keys(admins)) {
		if (admins[key] && admins[key].token === token)
			admins[key].token = null;
	}
	writeJSON(ADMINS_FILE, admins);
	$.cookie(ADMIN_COOKIE, '', '-1 day');
	$.json({ ok: true });
}

function admin_overview($) {
	const products = Object.values(readJSON(PRODUCTS_FILE) || {});
	const quotes = Object.values(readJSON(QUOTES_FILE) || {});
	$.json({
		ok: true,
		stats: {
			products: products.length,
			featuredProducts: products.filter(p => p && p.featured).length,
			quotes: quotes.length
		}
	});
}

function admin_products_list($) {
	const items = Object.values(readJSON(PRODUCTS_FILE) || {}).filter(Boolean);
	$.json({ ok: true, items: items });
}

function asArray(v) {
	if (!v)
		return [];
	if (Array.isArray(v))
		return v.map(x => x.toString().trim()).filter(Boolean);
	return v.toString().split(',').map(x => x.trim()).filter(Boolean);
}

function asSlug(v) {
	return (v || '')
		.toString()
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function admin_products_upsert($) {
	const body = $.body || {};
	const slug = asSlug(body.slug || body.name);
	if (!slug) {
		$.json({ ok: false, error: 'Slug ou nom requis' });
		return;
	}

	const store = readJSON(PRODUCTS_FILE);
	const current = store[slug] || {};
	const item = {
		...current,
		slug: slug,
		name: (body.name || current.name || '').toString().trim(),
		short: (body.short || current.short || '').toString().trim(),
		type: asArray(body.type || current.type),
		deploy: asArray(body.deploy || current.deploy),
		pricing: asArray(body.pricing || current.pricing),
		tags: asArray(body.tags || current.tags),
		image: (body.image || current.image || '').toString().trim(),
		link: (body.link || current.link || '#').toString().trim(),
		cta: (body.cta || current.cta || 'Voir').toString().trim(),
		featured: body.featured === true || body.featured === '1' || body.featured === 1 ? 1 : 0,
		isNew: body.isNew === true || body.isNew === '1' || body.isNew === 1 ? 1 : 0,
		updatedAt: new Date().toISOString()
	};

	if (!item.name) {
		$.json({ ok: false, error: 'Nom du produit requis' });
		return;
	}

	store[slug] = item;
	writeJSON(PRODUCTS_FILE, store);
	$.json({ ok: true, item: item });
}
