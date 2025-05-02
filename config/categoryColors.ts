export const defaultCategoryColor = '#607d8b';

export type CategoryConfig = {
  color: string;
  showInHeader: boolean;
  showInDropdown: boolean;
  media: string[]; // e.g. ['/media/cat-header.jpg']
};

export const categoryConfigMap: Record<string, CategoryConfig> = {
  'Love Letters': {
    color: '#f44336',
    showInHeader: false,
    showInDropdown: true,
    media: [],
  },
  'Image-Critique': {
    color: '#3f51b5',
    showInHeader: true,
    showInDropdown: false,
    media: ['/media/image-header.jpg'],
  },
  'Bascule': {
    color: '#4caf50',
    showInHeader: false,
    showInDropdown: true,
    media: [],
  },
  'Sensure': {
    color: '#ff9800',
    showInHeader: false,
    showInDropdown: true,
    media: [],
  },
  'Automaton': {
    color: '#9c27b0',
    showInHeader: true,
    showInDropdown: false,
    media: [],
  },
  'Bicaméralité': {
    color: '#009688',
    showInHeader: true,
    showInDropdown: false,
    media: [],
  },
  'Banque des rêves': {
    color: '#607d8b',
    showInHeader: false,
    showInDropdown: true,
    media: [],
  },
  'Cartographie': {
    color: '#607d8b',
    showInHeader: false,
    showInDropdown: true,
    media: [],
  },
};
