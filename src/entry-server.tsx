import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { pageSeo } from "./seo";

export function renderPage(path: string) {
  return {
    markup: renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    ),
    seo: pageSeo(path),
  };
}

export { indexablePaths } from "./seo";
