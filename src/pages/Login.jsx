import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin } from '../components/Spin';

const Login = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setErrors({});
    }, 1500);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 flex flex-col items-center gap-8">
        <header className="w-full flex items-center justify-between mb-4">
          <Link
            to="/"
            className="text-teal-600 hover:text-teal-700 font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            ← Home
          </Link>
        </header>
        <main className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center gap-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-extrabold text-teal-700 mb-2 flex items-center justify-center gap-2">
                <span role="img" aria-label="login">
                  🔐
                </span>
                {step === 'email' ? 'Sign In' : 'Enter Verification Code'}
              </h2>
              <p className="text-gray-700">
                {step === 'email'
                  ? 'Sign in to continue your IELTS adventure!'
                  : `We've sent a 6-digit code to ${email}`}
              </p>
            </div>
            {step === 'email' ? (
              <form className="space-y-6 w-full" onSubmit={handleSendOtp}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors text-lg bg-white/80 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Spin />
                        Sending code...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span role="img" aria-label="mail">
                          📧
                        </span>{' '}
                        Send verification code
                      </span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6 w-full" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-4 text-center">
                    Enter the 6-digit code
                  </label>
                  <div className="flex justify-center space-x-3 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center border-2 border-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-2xl font-bold bg-white/80 shadow-md transition-all duration-200 mx-1"
                        placeholder=""
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-sm text-red-600 text-center">
                      {errors.otp}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Spin />
                        Verifying...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span role="img" aria-label="key">
                          🔑
                        </span>{' '}
                        Verify code
                      </span>
                    )}
                  </button>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      className="font-medium text-purple-600 hover:text-pink-500"
                      onClick={handleSendOtp}
                    >
                      Resend
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    ← Back to email
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
