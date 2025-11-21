
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import App from "./App.js";
  import "./index.css";
  import ToastHost from "./components/ui/toast.js";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
      <ToastHost />
    </BrowserRouter>
  );
  