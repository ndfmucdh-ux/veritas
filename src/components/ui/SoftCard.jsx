/** Reusable soft card: surface background, rounded corners, soft shadow. */
export default function SoftCard({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`card-soft ${className}`} {...props}>
      {children}
    </Tag>
  );
}