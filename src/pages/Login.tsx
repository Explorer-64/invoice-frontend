import { SignInOrUpForm } from "app";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-center">Welcome to Invoice My Jobs</h1>
      <SignInOrUpForm signInOptions={{ google: true, emailAndPassword: true }} />
    </div>
  );
}
