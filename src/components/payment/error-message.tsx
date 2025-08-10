interface ErrorMessageProps {
  title: string;
  message: string;
}

export function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <>
      <h2 className="mb-4 font-bold text-2xl">{title}</h2>
      <p>{message}</p>
    </>
  );
}
