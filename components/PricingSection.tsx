import Link from "next/link";
import { Button } from "./ui/button";

export default function PricingSection() {
  return (
      <div className="w-full max-w-6xl mt-16 mb-16 p-8 rounded-lg space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>
        <div className="flex flex-wrap justify-center lg:space-x-4 space-y-4 lg:space-y-0 items-stretch">
          {pricingOptions.map((option, index) => (
              <div
                  key={index}
                  className={`flex flex-col border rounded-lg p-4 w-full lg:w-1/4 ${option.bgColor}`}
              >
                <div className="flex-grow space-y-4">
                  <h3 className="text-2xl font-semibold text-center">
                    {option.title}
                  </h3>
                  <p className="text-xl font-bold text-center mb-2">
                    {option.price}
                  </p>
                  <p className="text-sm text-gray-600 text-center">
                    {option.description}
                  </p>
                  {option.mostPopular && (
                      <p className="text-center bg-blue-900 rounded-full px-8 py-3 font-bold text-white mb-2">
                        Most Popular
                      </p>
                  )}
                  <p className="text-center text-red-500 line-through mb-2">
                    {option.originalPrice}
                  </p>
                  <p className="text-center text-xl font-bold ">
                    {option.discountedPrice}
                  </p>
                </div>
                <div className="mt-10 text-center">
                  <Link href="/login">
                    {" "}
                    <Button className="w-3/4">{option.buttonText}</Button>
                  </Link>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}

const pricingOptions = [
  {
    title: "Starter",
    price: "1 Credit",
    originalPrice: "$19.99",
    discountedPrice: "Only $10.31",
    description: "",
    buttonText: "Choose Starter",
    bgColor: "bg-white",
    mostPopular: false
  },
  {
    title: "Basic",
    price: "3 Credits",
    originalPrice: "$34.99",
    discountedPrice: "Only $20.23",
    description: "",
    buttonText: "Choose Basic",
    bgColor: "bg-blue-50",
    mostPopular: true
  },
  // {
  //   title: "Premium",
  //   price: "5 Credits",
  //   originalPrice: "$49.99",
  //   discountedPrice: "Only $30.45",
  //   description: "",
  //   features: [
  //     "Costumes on all Tiles",
  //   ],
  //   buttonText: "Choose Premium",
  //   bgColor: "bg-white",
  // },
];
