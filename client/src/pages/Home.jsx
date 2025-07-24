import React from 'react';
import Header from '../components/Header';
import useCategoryStore from '../stores/categoryStore';
import Filters from '../components/Filters';

function Home() {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  return (
    <div>
      <Header />
      <Filters />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Home Page</h1>
        <div className="text-lg">Selected Category: <span className="font-semibold text-blue-600">{selectedCategory}</span></div>
      </div>
    </div>
  );
}

export default Home;
