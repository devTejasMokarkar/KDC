export type ServiceItem = { id: string; price: number; main: string; sub: string };

export const SERVICE_CATEGORIES = [
  'wash',
  'iron',
  'dryclean',
  'colorrestore',
  'rafoo',
] as const;

export const SERVICE_SUBCATS = [
  { id: 'tops' },
  { id: 'bottoms' },
  { id: 'formal' },
  { id: 'ethnic' },
  { id: 'home' },
  { id: 'dress' },
] as const;

export const SERVICE_ITEMS: ServiceItem[] = [
  { id: 'tshirt-wash', price: 200, main: 'wash', sub: 'tops' },
  { id: 'shirt-wash', price: 180, main: 'wash', sub: 'tops' },
  { id: 'polo-wash', price: 220, main: 'wash', sub: 'tops' },
  { id: 'jeans-wash', price: 280, main: 'wash', sub: 'bottoms' },
  { id: 'shorts-wash', price: 150, main: 'wash', sub: 'bottoms' },
  { id: 'pyjama-wash', price: 160, main: 'wash', sub: 'bottoms' },
  { id: 'kurta-wash', price: 300, main: 'wash', sub: 'ethnic' },
  { id: 'salwarsuit-wash', price: 350, main: 'wash', sub: 'ethnic' },
  { id: 'bedsheet-wash', price: 400, main: 'wash', sub: 'home' },
  { id: 'pillowcover-wash', price: 100, main: 'wash', sub: 'home' },
  { id: 'curtain-wash', price: 500, main: 'wash', sub: 'home' },
  { id: 'sofacover-wash', price: 600, main: 'wash', sub: 'home' },
  { id: 'carcover-wash', price: 550, main: 'wash', sub: 'home' },
  { id: 'schooldress-wash', price: 250, main: 'wash', sub: 'dress' },
  { id: 'casualdress-wash', price: 320, main: 'wash', sub: 'dress' },

  { id: 'shirt-iron', price: 350, main: 'iron', sub: 'tops' },
  { id: 'tshirt-iron', price: 260, main: 'iron', sub: 'tops' },
  { id: 'formalshirt-iron', price: 380, main: 'iron', sub: 'tops' },
  { id: 'trouser-iron', price: 250, main: 'iron', sub: 'bottoms' },
  { id: 'jeans-iron', price: 320, main: 'iron', sub: 'bottoms' },
  { id: 'skirt-iron', price: 280, main: 'iron', sub: 'bottoms' },
  { id: 'kurta-iron', price: 340, main: 'iron', sub: 'ethnic' },
  { id: 'kurtapyjama-iron', price: 480, main: 'iron', sub: 'ethnic' },
  { id: 'salwarsuit-iron', price: 420, main: 'iron', sub: 'ethnic' },
  { id: 'bedsheet-iron', price: 450, main: 'iron', sub: 'home' },
  { id: 'pillowcover-iron', price: 130, main: 'iron', sub: 'home' },
  { id: 'sundress-iron', price: 400, main: 'iron', sub: 'dress' },
  { id: 'schooldress-iron', price: 300, main: 'iron', sub: 'dress' },

  { id: 'formalshirt-dc', price: 450, main: 'dryclean', sub: 'tops' },
  { id: 'trouser-dc', price: 420, main: 'dryclean', sub: 'bottoms' },
  { id: 'blazer-dc', price: 900, main: 'dryclean', sub: 'formal' },
  { id: 'suit2pc-dc', price: 1600, main: 'dryclean', sub: 'formal' },
  { id: 'suit3pc-dc', price: 2000, main: 'dryclean', sub: 'formal' },
  { id: 'coat-dc', price: 1200, main: 'dryclean', sub: 'formal' },
  { id: 'jacket-dc', price: 850, main: 'dryclean', sub: 'formal' },
  { id: 'waistcoat-dc', price: 400, main: 'dryclean', sub: 'formal' },
  { id: 'tie-dc', price: 150, main: 'dryclean', sub: 'formal' },
  { id: 'saree-dc', price: 650, main: 'dryclean', sub: 'ethnic' },
  { id: 'sherwani-dc', price: 1100, main: 'dryclean', sub: 'ethnic' },
  { id: 'lehenga-dc', price: 1500, main: 'dryclean', sub: 'ethnic' },
  { id: 'dupatta-dc', price: 300, main: 'dryclean', sub: 'ethnic' },
  { id: 'blanket-dc', price: 700, main: 'dryclean', sub: 'home' },
  { id: 'carpet-dc', price: 800, main: 'dryclean', sub: 'home' },
  { id: 'sofacover-dc', price: 750, main: 'dryclean', sub: 'home' },
  { id: 'carcover-dc', price: 700, main: 'dryclean', sub: 'home' },
  { id: 'gown-dc', price: 950, main: 'dryclean', sub: 'dress' },
  { id: 'frock-dc', price: 500, main: 'dryclean', sub: 'dress' },

  { id: 'shirt-cr', price: 800, main: 'colorrestore', sub: 'tops' },
  { id: 'tshirt-cr', price: 700, main: 'colorrestore', sub: 'tops' },
  { id: 'trouser-cr', price: 750, main: 'colorrestore', sub: 'bottoms' },
  { id: 'jeans-cr', price: 780, main: 'colorrestore', sub: 'bottoms' },
  { id: 'blazer-cr', price: 1100, main: 'colorrestore', sub: 'formal' },
  { id: 'kurta-cr', price: 820, main: 'colorrestore', sub: 'ethnic' },
  { id: 'saree-cr', price: 950, main: 'colorrestore', sub: 'ethnic' },
  { id: 'gown-cr', price: 1050, main: 'colorrestore', sub: 'dress' },

  { id: 'shirt-rafoo', price: 150, main: 'rafoo', sub: 'tops' },
  { id: 'tshirt-rafoo', price: 120, main: 'rafoo', sub: 'tops' },
  { id: 'trouser-rafoo', price: 180, main: 'rafoo', sub: 'bottoms' },
  { id: 'jeans-rafoo', price: 200, main: 'rafoo', sub: 'bottoms' },
  { id: 'blazer-rafoo', price: 300, main: 'rafoo', sub: 'formal' },
  { id: 'kurta-rafoo', price: 170, main: 'rafoo', sub: 'ethnic' },
  { id: 'saree-rafoo', price: 220, main: 'rafoo', sub: 'ethnic' },
  { id: 'sherwani-rafoo', price: 350, main: 'rafoo', sub: 'ethnic' },
  { id: 'sofacover-rafoo', price: 250, main: 'rafoo', sub: 'home' },
  { id: 'schooldress-rafoo', price: 140, main: 'rafoo', sub: 'dress' },
];

export const TIME_SLOTS = ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm', '6:00 pm'] as const;

export const subsFor = (mainId: string) => {
  const set = new Set(SERVICE_ITEMS.filter((i) => i.main === mainId).map((i) => i.sub));
  return SERVICE_SUBCATS.filter((s) => set.has(s.id));
};

export const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDate = (date: Date, locale?: string) =>
  date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });

export const formatDateString = (value: string, locale?: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d), locale);
};
