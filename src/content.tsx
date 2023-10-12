import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { PreviewStatus, PreviewStatusLine } from "./components/previewStatus";

const root = document.createElement("div");
root.id = "skylark-preview-extension";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PreviewStatusLine />
    <PreviewStatus />
  </React.StrictMode>,
);
