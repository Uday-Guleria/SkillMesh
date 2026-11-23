export default function Heading({ title, desc, action = null }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">YOUR SPACE · SKILLMESH</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}
