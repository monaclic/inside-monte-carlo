import { readFileSync } from "node:fs";
import path from "node:path";
import { WebflowRuntime } from "@/components/webflow-runtime";

const HOME_PAGE_ID = "66cc288225154d2a15304038";
const homeMarkup = readFileSync(
  path.join(process.cwd(), "src/content/blogwear-home.html"),
  "utf8",
);

export default function Home() {
  return (
    <>
      <WebflowRuntime pageId={HOME_PAGE_ID} />
      <div
        className="webflow-page-host"
        dangerouslySetInnerHTML={{ __html: homeMarkup }}
      />
    </>
  );
}
