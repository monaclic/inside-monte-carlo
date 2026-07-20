"use client";

import { useEffect } from "react";

const WEBFLOW_SITE_ID = "66cc288225154d2a15304039";
const RUNTIME_SCRIPTS = [
  ["inside-jquery", "/assets/js/jquery.js"],
  ["inside-webflow-chunk", "/assets/js/webflow-chunk.js"],
  ["inside-webflow", "/assets/js/webflow.js"],
] as const;

function loadScript(id: string, source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    const onLoad = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    const onError = () => reject(new Error(`Impossible de charger ${source}`));

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.id = id;
      script.src = source;
      script.async = false;
      document.body.appendChild(script);
    }
  });
}

export function WebflowRuntime({ pageId }: { pageId: string }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.wfDomain = "inside-monte-carlo.vercel.app";
    html.dataset.wfPage = pageId;
    html.dataset.wfSite = WEBFLOW_SITE_ID;
    html.classList.add("w-mod-js");

    const runtimeWindow = window as typeof window & {
      __WEBFLOW_CURRENCY_SETTINGS?: Record<string, unknown>;
    };
    runtimeWindow.__WEBFLOW_CURRENCY_SETTINGS = {
      currencyCode: "EUR",
      symbol: "€",
      decimal: ",",
      fractionDigits: 2,
      group: " ",
      template: "{{wf {&quot;path&quot;:&quot;symbol&quot;,&quot;type&quot;:&quot;PlainText&quot;} }} {{wf {&quot;path&quot;:&quot;amount&quot;,&quot;type&quot;:&quot;CommercePrice&quot;} }}",
      hideDecimalForWholeNumbers: false,
    };

    let active = true;
    const startWebflow = async () => {
      try {
        for (const [id, source] of RUNTIME_SCRIPTS) {
          await loadScript(id, source);
        }
      } catch (error) {
        if (active) {
          console.error("Le moteur d'animations Webflow n'a pas pu démarrer.", error);
        }
      }
    };

    void startWebflow();
    return () => {
      active = false;
    };
  }, [pageId]);

  return null;
}
