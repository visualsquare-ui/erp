"use client";

import { useEffect } from "react";

function applyMarketingLanguage(language: "en" | "ko") {
  document.documentElement.lang = language;

  document.querySelectorAll<HTMLElement>("[data-en][data-ko]").forEach((el) => {
    const text = el.dataset[language];

    if (!text) {
      return;
    }

    if (text.includes("<span") || text.includes("<br")) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  document.querySelectorAll<HTMLButtonElement>("[data-language-toggle]").forEach((button) => {
    button.textContent = language === "ko" ? "EN" : "KR";
    button.style.backgroundColor = language === "ko" ? "var(--coral)" : "";
    button.style.borderColor = language === "ko" ? "var(--coral)" : "";
    button.style.color = language === "ko" ? "#ffffff" : "";
  });
}

export function MarketingLanguageToggle() {
  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem("visualsquare-language") === "ko" ? "ko" : "en";

    applyMarketingLanguage(savedLanguage);

    const handleClick = () => {
      const nextLanguage = document.documentElement.lang === "ko" ? "en" : "ko";
      window.localStorage.setItem("visualsquare-language", nextLanguage);
      applyMarketingLanguage(nextLanguage);
    };

    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-language-toggle]");
    buttons.forEach((button) => {
      button.addEventListener("click", handleClick);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleClick);
      });
    };
  }, []);

  return null;
}
