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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Redirigiendo al pago..." : "Pagar y obtener código"}
        </button>
        <div className="mt-6 text-sm text-gray-600 text-center">
        <p><strong>Pago seguro con Stripe.</strong> No almacenamos datos de tarjeta.</p>
        <p>Tu información está protegida mediante <strong>cifrado SSL de 256 bits</strong>.</p>
        <p>El email que introduzcas se usará únicamente para enviarte el código de acceso al curso.</p>

        <div className="mt-3">
          <a href="/aviso-legal" className="underline text-blue-600">Aviso Legal</a> · 
          <a href="/politica-privacidad" className="underline text-blue-600 mx-2">Política de Privacidad</a> · 
          <a href="/politica-cookies" className="underline text-blue-600">Cookies</a>
        </div>
      </div>
            <div className="mt-4 flex justify-center items-center space-x-4">
            <img src="/assets/images/stripe-logo.svg" alt="Stripe" className="h-6" />
            <img src="/assets/images/ssl-secure.svg" alt="Conexión segura SSL" className="h-6" />
          </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
