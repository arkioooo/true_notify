/** Title + hairline rule (".sh"), with optional trailing content such as a button. */
export default function SectionHeader({ title, style, children }) {
  return (
    <div className="sh" style={style}>
      <span className="sh-t">{title}</span>
      <div className="sh-l"></div>
      {children}
    </div>
  );
}
