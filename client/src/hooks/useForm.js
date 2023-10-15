import { useState, useEffect } from "react";

const useForm = (endpoint) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [messages, setMessages] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/get_csrf_token", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrf_token);
        } else {
          console.error("Failed to fetch CSRF token");
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirm_password: confirmPassword,
          csrf_token: csrfToken,
        }),
      });

      if (!response.ok) {
        console.error("Authentication failed. Status:", response.status);

        const data = await response.json();

        if (data.errors) {
          setMessages(Object.values(data.errors).flat());
        } else {
          setMessages(["Authentication failed. Please check your input"]);
        }
        return;
      }

      console.log("Response received from server:", response);
      const data = await response.json();

      console.log("Data received:", data);

      if (response.status === 200) {
        setMessages("Authentication successful!");
        // Optionally, you can clear the form fields here
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessages("");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessages("Authentication failed. Please check your input");
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    messages,
    handleSubmit,
  };
};

export default useForm;
