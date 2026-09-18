export default function SearchBox({
  action,
  placeholder,
  defaultValue = "",
  name = "q",
  extra,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
  name?: string;
  extra?: React.ReactNode;
}) {
  return (
    <form action={action} method="get" className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <input className="field" name={name} defaultValue={defaultValue} placeholder={placeholder} />
      {extra}
      <button className="btn-ghost">Search</button>
    </form>
  );
}
