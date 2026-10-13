"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/hooks/Mutations/useLoginMutation";
import { APICONSTANT } from "@/services/config";
import { useTransition } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Inputs = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

const RegForm = () => {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<Inputs>();
  
    const registerMutation = useRegisterMutation();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
      startTransition(async () => {
        const payload = {
          ...data,
        };
        try {
          await registerMutation.mutateAsync({
            url: { apiUrl: APICONSTANT.REGISTER },
            body: payload,
          });
        } catch (error) {
          console.error("Register failed", error);
        }
      });
  };

  const password = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstname">First Name</Label>
        <Input
          id="firstname"
          placeholder="First Name"
          size="lg"
          {...register("firstname", { required: "First name is required" })}
        />
        {errors.firstname && (
          <p className="text-red-500 text-sm">{errors.firstname.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastname">Last Name</Label>
        <Input
          id="lastname"
          placeholder="Last Name"
          size="lg"
          {...register("lastname", { required: "Last name is required" })}
        />
        {errors.lastname && (
          <p className="text-red-500 text-sm">{errors.lastname.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="mail@example.com"
          size="lg"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          rules={{
            required: "Role is required",
          }}
          // defaultValue="ADMIN"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                disabled={isPending}
                size="lg"
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
      {errors.role && (
        <p className="text-destructive text-sm mt-2">
          {errors.role.message}
        </p>
      )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          size="lg"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm password"
          size="lg"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms */}
      <div className="flex gap-2 items-center">
        <Checkbox id="checkbox" defaultChecked />
        <Label htmlFor="checkbox">
          You Accept Our Terms And Conditions And Privacy Policy
        </Label>
      </div>

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ?  "Create An Account" : "Create An Account"}
      </Button>
    </form>
  );
};

export default RegForm;
