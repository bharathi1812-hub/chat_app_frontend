import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  localStorage.setItem("username", username);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        alert("Invalid login");
        return;
      }

      const data = await response.json();

      // store token
      localStorage.setItem("token", data.token);

      // redirect to chat
      navigate("/chat");

    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 min-h-screen justify-center">
      <h1 className="text-3xl font-bold pb-2">Login</h1>

      <input
        type="text"
        placeholder="Username"
        className="input input-bordered w-80"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="input input-bordered w-80"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="btn btn-neutral w-80"
        onClick={handleLogin}
      >
        Login
      </button>

      <p>
        Don't have an account?{" "}
        <Link className="link" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;