/** A one-line "Questions? Email us" note with a mailto link. */
export default function HelpEmail({
  prompt,
  email,
  className = '',
}: {
  prompt: string;
  email: string;
  className?: string;
}) {
  return (
    <p className={`text-center text-xs text-muted-foreground ${className}`}>
      {prompt}
      <a href={`mailto:${email}`} className="mt-0.5 block font-medium text-primary hover:underline break-all">
        {email}
      </a>
    </p>
  );
}
