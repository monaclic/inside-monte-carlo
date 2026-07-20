"use client";

import { useEffect, useState } from "react";

const preloaderImages = [
  "/assets/images/inside-monte-carlo-05.jpg",
  "/assets/images/inside-monte-carlo-14.jpg",
  "/assets/images/inside-monte-carlo-17.jpg",
  "/assets/images/inside-monte-carlo-24.jpg",
];

export function MotionLayer() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduceMotion) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      const reducedMotionTimer = window.setTimeout(() => setLoaded(true), 0);
      return () => window.clearTimeout(reducedMotionTimer);
    }

    revealElements.forEach((element) => element.classList.add("is-reveal-pending"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    revealElements.forEach((element) => observer.observe(element));
    const preloaderTimer = window.setTimeout(() => setLoaded(true), 2100);

    return () => {
      observer.disconnect();
      window.clearTimeout(preloaderTimer);
    };
  }, []);

  return (
    <div className="preloader" data-loaded={loaded || undefined} aria-hidden="true">
      <div className="preloader__images">
        {preloaderImages.map((image, index) => (
          <span
            className="preloader__image"
            key={image}
            style={{ backgroundImage: `url(${image})`, animationDelay: `${index * 140}ms` }}
          />
        ))}
      </div>
      <div className="preloader__brand">
        <span>Inside</span>
        <span>Monte-Carlo</span>
      </div>
      <span className="preloader__counter">01 / 04</span>
    </div>
  );
}
