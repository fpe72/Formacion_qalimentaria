import { useEffect, useState } from "react";

export default function PagoParticular() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);

  // Llamamos al backend para obtener la info del curso
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/stripe/course-info`)
      .then(res => res.json())
      .then(data => setCourseInfo(data))
      .catch(err => console.error("Error al obtener info del curso", err));
  }, []);

  const handlePago = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/payment/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No se pudo iniciar el proceso de pago.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("Error al conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Pago para usuarios particulares</h2>

      {courseInfo && (
        <p className="text-lg font-medium text-gray-800 mb-4">
          {courseInfo.name} – {courseInfo.price.toFixed(2)} €
        </p>
      )}

      <form onSubmit={handlePago} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tu email:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            {loading ? "Redirigiendo al pago..." : "Pagar y obtener código"}
          </button>

          <p className="text-xs text-center text-gray-500 mt-2">
            El pago se realiza de manera segura mediante <strong>Stripe</strong>. Tus datos bancarios están cifrados y no se almacenan.
          </p>

          <div className="mt-8 border-t pt-4 text-xs text-center text-gray-600">
            
            <div className="flex justify-center items-center space-x-4 mb-2">
              <img src="/assets/images/stripe-logo.svg" alt="Stripe" className="h-5"/>
              <img src="/assets/images/ssl-secure.svg" alt="Conexión segura SSL" className="h-5"/>
            </div>

            <p className="mb-1"><strong>Transacción segura con cifrado SSL de 256 bits</strong></p>
            <p className="mb-3">Tu email sólo se usa para enviarte el acceso a la formación.</p>

            <div className="flex justify-center space-x-2 underline">
              <a href="/aviso-legal" className="text-blue-500">Aviso Legal</a>
              <span>·</span>
              <a href="/politica-privacidad" className="text-blue-500">Privacidad</a>
              <span>·</span>
              <a href="/politica-cookies" className="text-blue-500">Cookies</a>
            </div>
          </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
