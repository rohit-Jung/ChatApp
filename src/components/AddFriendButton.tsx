"use client";

import { FC, useState } from "react";
import Button from "./ui/Button";
import axios, { AxiosError } from "axios";
import { addFriendValidator } from "@/lib/validations/addFriendValidator";
import { ZodError } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

type FormData = {
  email: string;
};

const AddFriendButton: FC<AddFriendButtonProps> = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const handleAddFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email });
      // console.log(validatedEmail);
      const response = await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      console.log(response);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ZodError) {
        setError("email", {
          message: error.message,
        });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong" });
    }
  };

  // console.log("email error:", errors.email?.message);
  //handling the on submit event
  const onSubmit = (data: FormData) => {
    handleAddFriend(data.email);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Add friend by email
        </label>

        <div className="mt-2 flex gap-4">
          <input
            {...register("email")} //registering the email
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="you@example.com"
          />
          <Button type="submit">Add</Button>
        </div>
        <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>

        {isSuccess ? (
          <p className="mt-1 text-sm text-green-600">
            Friend Request Sent Successfully
          </p>
        ) : null}
      </form>
    </>
  );
};

export default AddFriendButton;
