import React from "react";
import {
  GiRiceCooker, GiDumpling, GiNoodles, GiPickle, GiCauldron, GiMeat,
  GiChemicalDrop, GiDonut, GiWineGlass, GiMountainCave,
  GiCampCookingPot, GiPalm, GiMountains, GiPrayerBeads,
} from "react-icons/gi";
import { SiHappycow } from "react-icons/si";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import useCategoryStore from "../stores/categoryStore";

// Dish Type Icons
const iconDalBhat = <GiRiceCooker className="w-[60px] h-[60px] text-red-500" />;
const iconMomo = <GiDumpling className="w-[60px] h-[60px] text-red-500" />;
const iconSnacks = <GiNoodles className="w-[60px] h-[60px] text-red-500" />;
const iconPickle = <GiPickle className="w-[60px] h-[60px] text-red-500" />;
const iconThakali = <MdOutlineRestaurantMenu className="w-[60px] h-[60px] text-red-500" />;
const iconDhido = <GiCauldron className="w-[60px] h-[60px] text-red-500" />;
const iconMeat = <GiMeat className="w-[60px] h-[60px] text-red-500" />;
const iconFermented = <GiChemicalDrop className="w-[60px] h-[60px] text-red-500" />;
const iconDesserts = <GiDonut className="w-[60px] h-[60px] text-red-500" />;
const iconDrinks = <GiWineGlass className="w-[60px] h-[60px] text-red-500" />;

// Ethnic Group Icons
const iconNewari = <SiHappycow className="w-[60px] h-[60px] text-red-500" />;
const iconGurung = <GiMountainCave className="w-[60px] h-[60px] text-red-500" />;
const iconTamang = <GiPrayerBeads className="w-[60px] h-[60px] text-red-500" />;
const iconMagar = <GiCampCookingPot className="w-[60px] h-[60px] text-red-500" />;
const iconTharu = <GiPalm className="w-[60px] h-[60px] text-red-500" />;
const iconSherpa = <GiMountains className="w-[60px] h-[60px] text-red-500" />;

const categories = [
  { id: 1, name: "Dal Bhat", image: iconDalBhat },
  { id: 2, name: "Momo", image: iconMomo },
  { id: 3, name: "Snacks", image: iconSnacks },
  { id: 4, name: "Pickle", image: iconPickle },
  { id: 5, name: "Thakali", image: iconThakali },
  { id: 6, name: "Dhido", image: iconDhido },
  { id: 7, name: "Meat Dishes", image: iconMeat },
  { id: 8, name: "Fermented Foods", image: iconFermented },
  { id: 9, name: "Desserts", image: iconDesserts },
  { id: 10, name: "Drinks", image: iconDrinks },

  // Ethnic Categories
  { id: 11, name: "Newari", image: iconNewari },
  { id: 12, name: "Gurung", image: iconGurung },
  { id: 13, name: "Tamang", image: iconTamang },
  { id: 14, name: "Magar", image: iconMagar },
  { id: 15, name: "Tharu", image: iconTharu },
  { id: 16, name: "Sherpa", image: iconSherpa },
];

function Filters({ input }) {
  const setSelectedCategory = useCategoryStore((state) => state.setSelectedCategory);

  return !input ? (
    <div className="flex flex-wrap justify-center items-center gap-6 w-full h-full bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 xl:px-[400px]">
      {categories.map((item) => (
        <div
          key={item.name}
          className="w-[120px] h-[130px] bg-white items-center flex justify-center flex-col gap-5 p-4 text-[15px] text-gray-600 rounded-md shadow-xl transition-transform duration-300 hover:scale-90 hover:bg-green-200 cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedCategory(item.name)}
        >
          <div>{item.image}</div>
          <div className="text-center">{item.name}</div>
        </div>
      ))}
    </div>
  ) : null;
}

export default Filters;
