// /config/categoryColors.ts
export const defaultCategoryColor = '#607d8b';

export type CategoryConfig = {
  color: string;
  showInHeader: boolean;
  showInDropdown: boolean;
  media: string[]; // e.g. ['/media/cat-header.jpg']
  linkTo?: string; // Path to specific page or undefined for shared page
  dataFolder?: string; // Path to data folder
};

export const categoryConfigMap: Record<string, CategoryConfig> = {
  'Love Letters': {
    color: '#f44336',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    dataFolder: 'texts/Love-Letter',
  },
  'Image-Critique': {
    color: '#3f51b5',
    showInHeader: false,
    showInDropdown: true,
    media: ['/media/image-header.jpg'],
    linkTo: '/categories/image-critique',
    dataFolder: 'texts/Image-Critique',
  },
  'Bascule': {
    color: '#4caf50',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    dataFolder: 'texts/Bascule',
  },
  'Sensure': {
    color: '#ff9800',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    linkTo: '/categories/sensure',
    dataFolder: 'texts/Sensure',
  },
  'Automaton': {
    color: '#9c27b0',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    dataFolder: 'texts/Automaton',
  },
  'Hypothèses': {
    color: '#009688',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    dataFolder: 'texts/Hypothèses',
  },
  'Bicaméralité': {
    color: '#009688',
    showInHeader: false,
    showInDropdown: true,
    media: [],
    dataFolder: 'texts/Bicaméralité',
  },
  'Banque des rêves': {
    color: '#607d8b',
    showInHeader: true,
    showInDropdown: false,
    media: [],
    linkTo: '/categories/banque-des-reves',
    dataFolder: 'texts/Love-Letter',
  },
  'Cartographie': {
    color: '#607d8b',
    showInHeader: true,
    showInDropdown: false,
    media: [],
    linkTo: '/categories/cartographie',
    dataFolder: 'texts/Cartographie des lieux',
  },
  'Événements': {
    color: '#607d8b',
    showInHeader: true,
    showInDropdown: false,
    media: [],
    linkTo: '/evenements',
    dataFolder: 'texts/Événements',
  },
  'À propos': {
    color: '#607d8b',
    showInHeader: true,
    showInDropdown: false,
    media: [],
    linkTo: '/categories/info',
    dataFolder: 'texts/À propos',
  },
};

// Helper function to convert category name to slug format for URLs
export const categoryToSlug = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD') // Normalize diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]/g, ''); // Remove non-word characters except hyphens
};

// Helper to get the appropriate link for a category
export const getCategoryLink = (category: string): string => {
  const config = categoryConfigMap[category];
  if (!config) return '/';
  
  if (config.linkTo) {
    // Return specific page path if defined
    return config.linkTo;
  }
  
  // Otherwise use the default category path with slug
  return `/categories/${categoryToSlug(category)}`;
};

// Helper to get all categories that should show in header
export const getHeaderCategories = (): string[] => {
  return Object.keys(categoryConfigMap).filter(
    category => categoryConfigMap[category].showInHeader
  );
};

// Helper to get all categories that should show in dropdown
export const getDropdownCategories = (): string[] => {
  return Object.keys(categoryConfigMap).filter(
    category => categoryConfigMap[category].showInDropdown
  );
};

// Helper to get category objects with name and color
export const getCategoryObjects = (categoryNames: string[] = []): Array<{name: string, color: string}> => {
  if (categoryNames.length === 0) {
    // Return all categories if none specified
    categoryNames = Object.keys(categoryConfigMap);
  }
  
  return categoryNames.map(name => ({
    name,
    color: categoryConfigMap[name]?.color || defaultCategoryColor
  }));
};