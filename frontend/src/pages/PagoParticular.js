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
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
