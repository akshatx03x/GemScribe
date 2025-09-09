import React, { useState } from 'react';
import { auth, googleProvider, githubProvider } from './utils/firebase';
import { signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/authService';

const App = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const googleLogin = async () => {
    try {
      setError('');
      const response = await signInWithPopup(auth, googleProvider);

      const user = response.user;
      const userData = {
        name: user.displayName || 'Google User',
        email: user.email,
        avatar: user.photoURL || 'https://example.com/default-avatar.png',
        phoneNumber: user.phoneNumber,
      };

      const responseData = await authService.googleLogin(userData);
      console.log('Google Login Success:', responseData);

      localStorage.setItem('token', responseData.token);
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error.message);
      setError(error.message);
    }
  };

  const gitLogin = async () => {
    try {
      setError('');
      githubProvider.addScope('repo');

      const response = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(response);
      const accessToken = credential.accessToken;

      const user = response.user;
      const userData = {
        name: user.displayName || 'GitHub User',
        email: user.email,
        avatar: user.photoURL || 'https://example.com/default-avatar.png',
        phoneNumber: user.phoneNumber,
        githubToken: accessToken,
        provider: 'github',
      };

      const responseData = await authService.googleLogin(userData);
      console.log('GitHub Login Success:', responseData);

      localStorage.setItem('token', responseData.token);
      navigate('/');
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };



  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4 font-inter relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 z-0 opacity-80" style={{
        background: `radial-gradient(circle at 50% 50%, rgba(13, 148, 136, 0.08) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(5, 5, 10, 0) 100%)`,
        filter: 'blur(100px)'
      }}></div>

      <div className="bg-gray-900/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-8 w-full max-w-md border border-gray-800/50 relative z-10 text-center">
        <div className="mb-8">
          <h1 className="font-extrabold text-5xl italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-yellow-400">
            Gemscribe
          </h1>
          <p className='text-gray-400 mt-1 font-medium px-8 text-sm'>
            ~AI Readme Generator
          </p>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-gray-300 mb-8 text-base">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-xl mb-6 text-sm border border-red-800/30">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 hover:bg-gray-700/50 text-gray-200 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          <button
            onClick={gitLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 hover:bg-gray-700/50 text-gray-200 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub"
              className="w-5 h-5"
            />
            Sign in with GitHub
          </button>

          
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <a className="text-cyan-300 hover:text-cyan-200 transition-colors duration-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a className="text-cyan-300 hover:text-cyan-200 transition-colors duration-200">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;