import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin } from '../components/Spin';
import { login, verifyOTP } from '../services/dataService';

const Login = () => {
  const [authStep, setAuthStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const onCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const next = [...code];
      next[index] = value;
      setCode(next);
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const onCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
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

  const validateCode = () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return false;
    }
    return true;
  };

  const onSendCode = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    setLoading(true);
    try {
      await login(email);
      setAuthStep('otp');
      setErrors({});
    } catch (error) {
      setErrors({
        email: 'Failed to send verification code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) {
      return;
    }
    setLoading(true);
    try {
      const codeString = code.join('');
      await verifyOTP(email, codeString);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ otp: 'Invalid verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const onBackToEmail = () => {
    setAuthStep('email');
    setCode(['', '', '', '', '', '']);
    setErrors({});
  };

  const renderOtpInputs = () => (
    <div className="flex justify-center space-x-3 mb-4">
      {code.map((digit, index) => (
        <input
          key={index}
          id={`code-${index}`}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => onCodeChange(index, e.target.value)}
          onKeyDown={(e) => onCodeKeyDown(index, e)}
          className="w-14 h-14 text-center border-2 border-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-2xl font-bold bg-white/80 shadow-md transition-all duration-200 mx-1"
          placeholder=""
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative z-10 overflow-hidden flex flex-col justify-center md:pr-20">
      <video
        src="banner.mp4"
        className="absolute inset-0 -z-10 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="w-full max-w-md ml-auto max-sm:mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 flex flex-col items-center gap-8">
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
                <span role="img">🔐</span>
                {authStep === 'email' ? 'Sign In' : 'Enter Verification Code'}
              </h2>
              <p className="text-gray-700">
                {authStep === 'email'
                  ? 'Sign in to continue your IELTS adventure!'
                  : `We've sent a 6-digit code to ${email}`}
              </p>
            </div>
            {authStep === 'email' ? (
              <form className="space-y-6 w-full" onSubmit={onSendCode}>
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
                    onChange={onEmailChange}
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
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spin />
                        Sending code...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span role="img">📧</span>
                        Send verification code
                      </span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6 w-full" onSubmit={onVerifyCode}>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-4 text-center">
                    Enter the 6-digit code
                  </label>
                  {renderOtpInputs()}
                  {errors.otp && (
                    <p className="text-sm text-red-600 text-center">
                      {errors.otp}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spin />
                        Verifying...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span role="img">🔑</span>
                        Verify code
                      </span>
                    )}
                  </button>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?
                    <button
                      type="button"
                      className="font-medium text-purple-600 hover:text-pink-500"
                      onClick={onSendCode}
                    >
                      Resend
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={onBackToEmail}
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
