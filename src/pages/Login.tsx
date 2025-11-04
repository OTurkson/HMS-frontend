import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, tokenUtils } from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const onButtonClick = async () => {
    let isValid = true;
    setLoginError("");

    if (email.trim() === "") {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      setIsLoading(true);
      try {
        // Attempt to login using the API
        const response = await authAPI.login(email, password);
        
        // Store tokens
        tokenUtils.setTokens(response.access, response.refresh);
        
        // Navigate to dashboard on successful login
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Login failed:", error);
        setLoginError(
          error.response?.data?.detail || 
          error.response?.data?.message || 
          "Invalid credentials. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mainContainer">
      <div className="titleContainer">
        <div>Login</div>
      </div>
      <br />
      <div className="inputContainer">
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className="inputBox"
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className="inputContainer">
        <input
          value={password}
          placeholder="Enter your password here"
          type="password"
          onChange={(ev) => setPassword(ev.target.value)}
          className="inputBox"
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      {loginError && (
        <div className="inputContainer">
          <label className="errorLabel" style={{ color: 'red', fontSize: '14px' }}>
            {loginError}
          </label>
        </div>
      )}
      <br />
      <div className="inputContainer">
        <input
          className="inputButton"
          type="button"
          onClick={onButtonClick}
          value={isLoading ? "Logging in..." : "Log in"}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
        />
      </div>
    </div>
  );
};

export default Login;
