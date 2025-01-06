function FormattedDate({ date }) {
  return (
    <span className="uppercase">
      <time dateTime={date.toISOString()}>
        {date.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </span>
  );
}

export default FormattedDate;
