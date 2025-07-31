import { create } from 'zustand';

const useCategoryStore = create((set) => ({
  selectedCategory: 'All', // Default to "All" to show all recipes
  categories: [], // Store available categories
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  clearSelectedCategory: () => set({ selectedCategory: 'All' }),
  setCategories: (categories) => set({ categories }),
}));

export default useCategoryStore;