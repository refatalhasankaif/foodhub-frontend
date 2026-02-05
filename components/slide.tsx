// components/HeroSlider.tsx
"use client";

import React, { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    image: "/images/slide-1.jpg",
    title: "Craving Something Delicious?",
    description: "Order your favorite food in minutes",
  },
  {
    id: 2,
    image: "/images/slide-2.jpg",
    title: "Fresh & Hot Delivery",
    description: "Straight from the best restaurants near you",
  },
  {
    id: 3,
    image: "/images/slide-3.jpg",
    title: "Big Savings Every Day",
    description: "Exclusive deals and discounts",
  },
  {
    id: 4,
    image: "/images/slide-4.jpg",
    title: "Pizza Night Made Easy",
    description: "Explore hundreds of pizza options",
  },
  {
    id: 5,
    image: "/images/slide-5.jpg",
    title: "Healthy Choices Available",
    description: "Salads, bowls, and nutritious meals",
  },
  {
    id: 6,
    image: "/images/slide-6.jpg",
    title: "Fast & Reliable",
    description: "Track your order in real-time",
  },
];

export default function Slide() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/45" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}