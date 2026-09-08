export default function ManagementHeaderRow({ backButton, children }) {
  return (
    <div className="space-y-3">
      {backButton && <div className="flex justify-start">{backButton}</div>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}