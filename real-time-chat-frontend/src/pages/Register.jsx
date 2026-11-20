import {useState} from "react";

function Register(props){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/register",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if(response.ok) {
                alert(data.message);
                props.onSwitchToLogin();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log("Registeration error:",error);
            alert("Unable to connect to server");
        }
    }

    return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-600">
                        Let's Chat
                    </h1>

                    <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                        Create Account
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Join Let's Chat and start conversations
                    </p>
                </div>


                <div className="space-y-4">
                    <input 
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500"
                    />

                    <input 
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500"
                    />
                    <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500"
                    />
                    <input 
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-teal-500"
                    />
                </div>


                <div className="mt-6">
                    <button
                    onClick={handleRegister} 
                    className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition">
                        Register
                    </button>
                </div>

                <p className="text-center text-gray-600 mt-6">
                Already have an account?{" "}
                    <span 
                    onClick={props.onSwitchToLogin}
                    className="text-teal-600 font-semibold cursor-pointer">
                        Login
                    </span>
                    </p>
            </div>
        </div>
    );
}

export default Register;