import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function RegistroFinal() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí podríamos validar el session_id si lo deseas más adelante
    setTimeout(() => setLoading(false), 1500);
  }, [sessionId]);

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      {loading ? (
        <p className="text-gray-500">Validando el pago...</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">¡Gracias por tu pago!</h2>
          <p className="text-lg">
            En breve recibirás por email tu <strong>código de activación</strong>.
          </p>
          <p className="mt-4 text-gray-600 text-sm">
            Si no lo ves, revisa tu carpeta de spam o contáctanos.
          </p>
        </>
      )}
    </div>
  );
}
