"use client";

import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit";
  /** Associates a button with a form elsewhere on the page. */
  form?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * Primary CTA: full width, chunky solid-offset shadow. Press moves it into
 * the lip. A `href` renders a link with the same look.
 */
export function Btn({
  children,
  href,
  onClick,
  type = "button",
  form,
  disabled = false,
  className = "",
  id,
}: ButtonProps) {
  const classes = `btn ${className}`.trim();
  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={classes} id={id}>
        {children}
      </Link>
    );
  }
  return (
    <button
      id={id}
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}

/** Quiet secondary action: Start over, Back to the walk, Skip. */
export function TextBtn({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const classes = `text-btn ${className}`.trim();
  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
