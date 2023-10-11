import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { PreviewStatus } from "./components/previewStatus";

const root = document.createElement("div");
root.id = "skylark-preview-extension";
root.setAttribute("style", "font-size: 16px");
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PreviewStatus />
  </React.StrictMode>,
);
