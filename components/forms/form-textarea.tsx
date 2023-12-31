"use client";

import { KeyboardEventHandler, forwardRef } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { FormErrors } from "./form-errors";
import { useFormStatus } from "react-dom";

interface FormTextareaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disable?: boolean;
  defaultValue?: string;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?:  KeyboardEventHandler<HTMLTextAreaElement | undefined> | undefined;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required,
      disable,
      defaultValue,
      errors,
      className,
      onBlur,
      onClick,
      onKeyDown,
    },
    ref
  ) => {

    const {pending} = useFormStatus();

    return (
        <div className="w-full space-y-2" >
            <div className="w-full space-y-1 " >
                {label ? (
                    <Label
                        htmlFor={id}
                        className="text-xs font-semibold text-neutral-700"
                    >
                        {label}
                    </Label>
                ) : null}
                <Textarea
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    onClick={onClick}
                    ref={ref}
                    required={required}
                    placeholder={placeholder}
                    name={id}
                    id={id}
                    disabled={disable || pending}
                    className={cn("resize-none outline-none shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0", className)}
                    aria-describedby={`${id}-error`}
                    defaultValue={defaultValue}
                />
            </div>
            <FormErrors
                id={id}
                errors={errors}
            />
        </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
