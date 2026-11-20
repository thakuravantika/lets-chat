import {useState} from "react";

function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if(response.ok) {
                props.onLoginSuccess(data);
            }else{
                alert(data.message);
            }
        } catch (error) {
            console.log("Login error:", error);
        }
    };
    return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-full mx-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-600">
                        Let's Chat
                    </h1>

                    <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                        Welcome Back!
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Login to continue your conversations
                    </p>
                </div>

                <div className="space-y-4">
                    <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-gray-300 rounded-lg outline-none focus:border-teal-500"
                    />

                    <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-gray-300 rounded-lg outline-none focus:border-teal-500" 
                    />
                </div>

                <div className="mt-6">
                    <button
                    onClick={handleLogin}
                    className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
                    >
                        Login
                    </button>
                </div>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <span className="text-teal-600 font-semibold cursor-pointer">
                        Register
                    </span>
                </p>

            </div>
        </div>
    );
}

export default Login;