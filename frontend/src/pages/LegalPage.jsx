import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LegalPage() {
  const { file } = useParams();
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch(`/api/legal/${file}`)
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
