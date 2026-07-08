"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Input } from "@/components/ui/field";
import { formatPhoneNumber } from "@/lib/utils";

// 숫자만 입력해도 010-0000-0000 형식으로 하이픈을 자동으로 붙이는 전화번호 입력.
export function PhoneInput({
  defaultValue = "",
  placeholder = "010-0000-0000",
  ...props
}: Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(() => formatPhoneNumber(defaultValue));

  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      maxLength={13}
      value={value}
      onChange={(event) => setValue(formatPhoneNumber(event.target.value))}
      placeholder={placeholder}
    />
  );
}
