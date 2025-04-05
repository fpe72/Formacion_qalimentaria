import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const fileMap = {
  'aviso-legal': '/assets/legal/aviso-legal.html',
  'politica-privacidad': '/assets/legal/politica-privacidad.html',
  'politica-cookies': '/assets/legal/politica-cookies.html'
};

export default function LegalPage() {
  const { file } = useParams();
  const [html, setHtml] = useState("");

  useEffect(() => {
    const path = fileMap[file];
    if (!path) {
      setHtml("<p>Documento no encontrado.</p>");
      return;
    }

    fetch(path)
      .then(res => res.text())
      .then(setHtml)
      .catch(err => setHtml("<p>Error cargando contenido legal.</p>"));
  }, [file]);

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto text-justify text-gray-800 bg-white rounded-xl shadow">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
