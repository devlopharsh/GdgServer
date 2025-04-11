import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentNumber: "",
    branch: "",
    phoneNumber: "",
    hostler_dayscholar: ""
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setMessage("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        ...formData,
        recaptchaToken: captchaToken
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" name="name" placeholder="Name" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="text" name="studentNumber" placeholder="Student Number" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="text" name="branch" placeholder="Branch" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="text" name="phoneNumber" placeholder="Phone Number" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />

          <select
            name="hostler_dayscholar"
            className="w-full p-2 border rounded mt-2"
            onChange={handleChange}
            required
          >
            <option value="">Select Hostler/Day-Scholar</option>
            <option value="Hostler">Hostler</option>
            <option value="Day-Scholar">Day-Scholar</option>
          </select>

          <div className="mt-4 flex justify-center">
            <ReCAPTCHA
              sitekey="6Lfe3QArAAAAAJ94AS9ZdarxyuJfCX6cmN9wpA-9"
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          <button type="submit" className="w-full mt-4 p-2 bg-blue-500 text-white rounded">
            Register
          </button>
        </form>

        {message && <p className="mt-2 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
