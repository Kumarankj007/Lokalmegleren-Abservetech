/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ErrorIcon from "@mui/icons-material/Error";
import { Checkbox } from "@mui/material";
import { Controller } from "react-hook-form";

const InputCard = ({
  name,
  label = "",
  placeholder = "",
  pattern,
  required = false,
  requiredMsg = "",
  textarea = false,
  checkBox = false,
  inputProps,
  control,
  errors,
  register,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  pattern?: any;
  required?: boolean;
  requiredMsg?: string;
  textarea?: boolean;
  checkBox?: boolean;
  inputProps?: any;
  control: any;
  errors: any;
  register?: any;
}) => {
  const checkLabel = { inputProps: { "aria-label": "Checkbox terms" } };
  return (
    <div className="w-full mb-5">
      {label != "" && (
        <p className="mb-[8px] text-[16px] text-[#333] font-semibold">
          {label}
          {required && <span className="text-[#eb1700]">*</span>}
        </p>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: requiredMsg,
          validate: (value) =>
            value.trim() !== "" || "Navnet kan ikke bare være mellomrom",
          pattern: pattern,
        }}
        render={({ field }) =>
          textarea ? (
            <textarea
              {...field}
              {...inputProps}
              rows={6}
              placeholder={placeholder}
              className="w-full placeholder-[#757575] shadow-sm px-[20px] py-3 border border-[#757575] rounded-[10px]"
            />
          ) : !checkBox ? (
            <input
              {...field}
              {...inputProps}
              placeholder={placeholder}
              className="w-full placeholder-[#757575] shadow-sm px-[20px] h-[50px] border border-[#757575] rounded-[10px]"
            />
          ) : (
            <>
              <Checkbox
                {...field}
                {...checkLabel}
                sx={{
                  "&.MuiCheckbox-root": {
                    padding: 0,
                  },
                  "&.Mui-checked": {
                    "& .MuiSvgIcon-root": {
                      fill: "#fff", // For the checkmark icon
                    },
                  },
                }}
                className="accent-[#d6bc77] fil"
                {...register("termsAccepted", {
                  required: "Vennligst godkjenn vilkårene",
                })}
              />
              <span className="text-[#222] font-normal text-[14px] ml-3">
                Jeg har lest og godkjent vilkårene
              </span>
            </>
          )
        }
      />
      {errors[name] && (
        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
          <ErrorIcon
            fontSize="small"
            className="mr-[8px] text-[16px] text-[#b71000]"
          />
          {errors?.[name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default InputCard;
