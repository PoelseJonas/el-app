/** Large page title at the top of each page, like iOS "large titles". */
export function PageHeader({ title }: { title: string }) {
  return <h1 className="mb-4 text-large-title">{title}</h1>;
}
