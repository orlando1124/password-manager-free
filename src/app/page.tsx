import SignUp from "@/components/SignUp";
import Login from "@/components/Login";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-8 items-center p-8">
      <SignUp />
      <Login />
    </main>
  );
}