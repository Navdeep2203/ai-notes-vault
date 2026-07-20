import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("Full response data:", res.data);
      console.log("User data from backend:", res.data.user);

      if(onLogin){
        console.log("Calling onlogin....");
        onLogin(res.data.user)
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong");
      }
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        AI Notes Vault
      </h1>

      <h2 className="text-xl font-semibold text-center mb-4">
        Login
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
    </div>
  </div>
);

}

export default Login;
