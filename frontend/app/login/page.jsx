
'use client'
import Link from 'next/link';

const LoginPage = () => {

    const handleSubmit = async (e) => { 
        e.preventDefault();

        const formData = {
            email: e.target.email.value,
            password: e.target.password.value,
        };

        const res = await fetch('http://localhost:5000/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include', // Important to send cookies
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = 'http://localhost:5000/';
        } else {
            alert(data.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Login to your account
                </h2>

                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter email"
                    className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500"
                />

                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter password"
                    className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500"
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-md cursor-pointer hover:bg-indigo-700 transition"
                >
                    Login
                </button>
            </form>

            <p className="mt-6 text-white">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline hover:text-indigo-300">
                    Sign up
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
