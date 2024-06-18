"use client";

import { ButtonHTMLAttributes, FC, useState } from "react";
import Button from "./ui/Button";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSignOut, setIsSignOut] = useState(false);
  return (
    <>
      <Button
        {...props}
        variant={"ghost"}
        onClick={async () => {
          setIsSignOut(true);
          try {
            await signOut();
          } catch (error) {
            toast.error("Error signing out");
          } finally {
            setIsSignOut(false);
          }
        }}
      >
        {isSignOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
      </Button>
    </>
  );
};

export default SignOutButton;
