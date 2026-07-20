import { useState } from "react";
import axios from "axios";
import Login from "./login";
import Dashboard from "./Dashboard";

function App() {
  const [showSignup, setShowSignup] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");

  const [user, setUser] = useState(null); // <-- logged in user

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password,
      });

      setMessage(res.data.message || "User registered successfully");
      setUsername("");
      setEmail("");
      setPassword("");

      setShowSignup(false); // go to login after signup
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleLoginSuccess = (userData) => {
    // THIS is what should run after login
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowSignup(false); // go back to login screen
  };

  // If user is logged in → show Dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Otherwise, show signup/login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">AI Notes Vault</h1>

      {showSignup ? (
        <>
          <h2  className="text-xl font-semibold text-center mb-4">Sign Up</h2>

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: "1rem" }}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-indigo-300"

                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-indigo-300"

                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition"

            >
              Sign Up
            </button>
          </form>

          {message && (
            <p className="text-center text-sm mt-4">{message}</p>
          )}
          {error && (
            <p className="text-center text-sm mt-4">{error}</p>
          )}

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setShowSignup(false);
                setMessage("");
                setError("");
              }}
              className="text-center text-sm mt-4"
            >
              Login
            </button>
          </p>
        </>
      ) : (
        <>
          <Login onLogin={handleLoginSuccess} />
          <p className="text-center text-sm mt-4">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setShowSignup(true);
                setMessage("");
                setError("");
              }}
              className="text-center text-sm mt-4"
            >
              Sign up
            </button>
          </p>
        </>
      )}
    </div>
    </div>
  );
}

export default App;
