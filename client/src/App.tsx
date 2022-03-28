import { BrowserRouter, Routes, Route } from "react-router-dom";
import Galaxy from "./three/Galaxy";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/galaxy" element={<Galaxy />} />
        <Route path="/galaxy/:location" element={<Galaxy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
