import { useEffect, useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL, REGISTER_CONTESTANT } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

const RegistrationForm = () => {
const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
});

const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: ""
});

const [showPassword, setShowPassword] = useState(false);
const [passwordStrength, setPasswordStrength] = useState("");
const [isFormValid, setIsFormValid] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);

const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
    if (!username) return "Username is required";
    if (!usernameRegex.test(username)) {
    return "Username must be 3-15 alphanumeric characters";
    }
    return "";
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
    }
    return "";
};

const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength === 0) return "";
    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must contain at least one special character";
    }
    return "";
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = "";
    if (name === "username") {
    error = validateUsername(value);
    } else if (name === "email") {
    error = validateEmail(value);
    } else if (name === "password") {
    error = validatePassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid) {
      return;
    }
    try {
      const api= new ApiHelper(BASE_URL)
      const response = await api.postForm(`${REGISTER_CONTESTANT}`, formData);
      
      console.log("Registration successful:", response);
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You have successfully registered. Click below to log in.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        
        window.location.href = "/login";
      });
  
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ username: "", email: "", password: "" });
        setPasswordStrength("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
      });
    }
  
};

useEffect(() => {
    const isValid = !errors.username && !errors.email && !errors.password &&
    formData.username && formData.email && formData.password;
    setIsFormValid(isValid);
}, [errors, formData]);

return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-theme-color-primary mb-8">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
            </label>
            <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-theme-color-primary focus:border-theme-color-primary"}`}
                aria-invalid={errors.username ? "true" : "false"}
            />
            </div>
            {errors.username && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.username}</p>
            )}
        </div>

        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
            </label>
            <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-theme-color-primary focus:border-theme-color-primary"}`}
                aria-invalid={errors.email ? "true" : "false"}
            />
            </div>
            {errors.email && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
            )}
        </div>

        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
            </label>
            <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-theme-color-primary focus:border-theme-color-primary"}`}
                aria-invalid={errors.password ? "true" : "false"}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>
            )}
            {passwordStrength && (
              <div className="mt-2">
                <div className="text-sm font-medium">Password Strength:</div>
                <div className={`text-sm ${passwordStrength === "weak" ? "text-red-500" : passwordStrength === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-all duration-200 ${isFormValid ? "bg-theme-color-primary hover:bg-theme-color-primary-dark" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Register
          </button>
        </form>

        {showSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md text-center" role="alert">
            Registration successful!
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;