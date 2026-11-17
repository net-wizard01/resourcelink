'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', lat: '', lon: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lon: position.coords.longitude.toString()
        }));
        setLocationStatus('Location detected successfully!');
      },
      () => {
        setLocationStatus('');
        alert("Unable to retrieve your location. Please allow location access.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegister) {
        const payload = { 
          ...form, 
          lat: parseFloat(form.lat || '40.7128'), 
          lon: parseFloat(form.lon || '-74.0060') 
        };
        const res = await api.post('/auth/register', payload);
        login(res.data.token, res.data.user);
      } else {
        const res = await api.post('/auth/login', {
          email: form.email, password: form.password
        });
        login(res.data.token, res.data.user);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <Hexagon className="fill-white" size={36} />
            <span className="text-3xl font-bold tracking-tight">ResourceLink</span>
          </div>
        </div>

        <div className="relative z-10 text-white space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight">
            Trade time.<br />
            Build community.
          </h1>
          <p className="text-lg text-blue-100 max-w-md">
            Join the hyper-local economy where your skills and tools are the only currency you need.
          </p>
          <ul className="space-y-3 mt-8">
            <li className="flex items-center gap-3 text-blue-50"><CheckCircle2 size={20} className="text-green-400"/> No money required</li>
            <li className="flex items-center gap-3 text-blue-50"><CheckCircle2 size={20} className="text-green-400"/> Find neighbors within 5km</li>
            <li className="flex items-center gap-3 text-blue-50"><CheckCircle2 size={20} className="text-green-400"/> Verified community members</li>
          </ul>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          ? {new Date().getFullYear()} ResourceLink. The future is local.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-gray-500">
              {isRegister ? 'Start trading with your neighbors today.' : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black"
                  value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>

            {isRegister && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                <label className="block text-sm font-medium text-blue-900">Your Location</label>
                <p className="text-xs text-blue-700">We use this to find neighbors within 5km. Your exact address is never shown.</p>
                
                {!form.lat ? (
                  <button type="button" onClick={detectLocation} className="w-full flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-700 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                    <MapPin size={16} /> {locationStatus || 'Detect My Location'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-white border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Location Set</span>
                    <button type="button" onClick={() => { setForm({...form, lat: '', lon: ''}); setLocationStatus(''); }} className="text-xs text-gray-500 hover:text-red-500 underline">
                      Reset
                    </button>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold transition-all disabled:opacity-70 items-center gap-2">
              {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Sign in')}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                {isRegister ? 'Sign in' : 'Register now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
