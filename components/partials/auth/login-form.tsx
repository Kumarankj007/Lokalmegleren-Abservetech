"use client";
import React from "react";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/components/navigation";
import { APICONSTANT } from "@/services/config";
import { useLoginMutation } from "@/hooks/Mutations/useLoginMutation";
import { loginUser } from "@/action/auth-action";
import { showToast } from "@/lib/toastSonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
  // role: z.string().min(1, { message: "Please select a role." }),
});
const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const [passwordType, setPasswordType] = React.useState("password");

  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email:
        process.env.NEXT_PUBLIC_MODE == "development" ? "admin@gmail.com" : "",
      password: process.env.NEXT_PUBLIC_MODE == "development" ? "123456" : "",
      // role: process.env.NEXT_PUBLIC_MODE == "development" ? "ADMIN" : "",
      // email: "admin@nexcodez.com",
      // password: "123456",
    },
  });

  // const onSubmit = (data: z.infer<typeof schema>) => {
  //   startTransition(async () => {
  //     try {
  //       const response = await loginUser(data);

  //       if (!!response.error) {
  //         // toast("Event has been created", {
  //         //   description: "Sunday, December 03, 2023 at 9:00 AM",

  //         // })
  //       } else {
  //         await showToast.promise(
  //           loginUser(data),
  //           {
  //             loading: "Logging you in...",
  //             success: "Welcome back!",
  //             error: "Login failed. Please try again.",
  //           }
  //         )
  //         router.push('/dashboard/analytics');
  //       }
  //     } catch (err: any) {
  //       showToast.error(err.message);
  //     }
  //   });
  // };

  const loginMutation = useLoginMutation();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      const payload = {
        ...data,
      };
      try {
        await loginMutation.mutateAsync({
          url: { apiUrl: APICONSTANT.LOGIN },
          body: payload,
        });
      } catch (error) {
        console.error("Login failed", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className=" font-medium text-default-600">
          Email{" "}
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("email")}
          type="email"
          id="email"
          className={cn("", {
            "border-destructive ": errors.email,
          })}
        />
      </div>
      {errors.email && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.email.message}
        </div>
      )}
      
      <div className="mt-3.5 space-y-2">
        <Label htmlFor="password" className="mb-2 font-medium text-default-600">
          Password{" "}
        </Label>
        <div className="relative">
          <Input
            size="lg"
            disabled={isPending}
            {...register("password")}
            type={passwordType}
            id="password"
            className="peer  "
            placeholder=" "
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
      </div>
      {errors.password && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.password.message}
        </div>
      )}

      {/* <div className="space-y-2">
        <Label htmlFor="role">Role</Label>

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                size="lg"
                disabled={isPending}
              >
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div> */}
      {/* {errors.role && (
        <p className="text-destructive text-sm mt-2">
          {errors.role.message}
        </p>
      )} */}

      {/* <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Checkbox id="checkbox" defaultChecked />
          <Label htmlFor="checkbox">Keep Me Signed In</Label>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-default-800 dark:text-default-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div> */}
      <Button fullWidth disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Loading..." : "Sign In"}
      </Button>
    </form>
  );
};
export default LoginForm;
