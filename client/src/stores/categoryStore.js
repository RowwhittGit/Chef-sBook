import { create } from 'zustand';

const useCategoryStore = create((set) => ({
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

export default useCategoryStore;
