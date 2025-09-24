"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import SignUp from "@/components/SignUp";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <SignUp />;
}
