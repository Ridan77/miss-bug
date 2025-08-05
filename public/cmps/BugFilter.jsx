const { useState, useEffect } = React;

export function BugFilter({ filterBy, onSetFilterBy, sortBy, onSetSortBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy);
  const [sortByToEdit, setSortByToEdit] = useState(sortBy);

  useEffect(() => {
    onSetFilterBy(filterByToEdit);
  }, [filterByToEdit]);

  useEffect(() => {
    onSetSortBy(sortByToEdit);
  }, [sortByToEdit]);

  function handleChange({ target }) {
    const field = target.name;
    let value = target.value;
    console.log(field, value);

    switch (target.type) {
      case "number":
      case "range":
        value = +value || "";
        break;

      case "checkbox":
        value = target.checked ? -1 : 1;
        console.log(value);
        break;

      default:
        break;
    }
    if (field === "sortField" || "sortDir") {
      setSortByToEdit((prevSort) => ({ ...prevSort, [field]: value }));
    } else
      setFilterByToEdit((prevFilter) => ({ ...prevFilter, [field]: value }));
  }
  function onSubmitFilter(ev) {
    ev.preventDefault();
    console.log("after submit");
    onSetFilterBy(filterByToEdit);
  }
  const { sortField, sortDir } = sortByToEdit;
  const { txt, minSeverity, label } = filterByToEdit;
  return (
    <section className="bug-filter">
      <h2>Filter</h2>
      <form onSubmit={onSubmitFilter}>
        <label htmlFor="txt">Text: </label>
        <input
          value={txt}
          onChange={handleChange}
          type="text"
          placeholder="By Text"
          id="txt"
          name="txt"
        />

        <label htmlFor="minSeverity">Min Severity: </label>
        <input
          value={minSeverity}
          onChange={handleChange}
          type="number"
          placeholder="By Min Severity"
          id="minSeverity"
          name="minSeverity"
        />
        <select value={label} onChange={handleChange} name="label" id="label">
          <option value="">Filter by Label</option>
          <option value="critical">critial</option>
          <option value="need-CR">need-CR</option>
          <option value="dev-branch">dev-branch</option>
          <option value="urgent">urgent</option>
          <option value="ASAP">ASAP</option>
        </select>
        <div className="sort-container">
          <select
            value={sortField}
            onChange={handleChange}
            name="sortField"
            id="sortField">
            <option value="">Sort by</option>
            <option value="title">Title</option>
            <option value="severity">Severity</option>
            <option value="createdAt">Created At</option>
          </select>

          <input
            onChange={handleChange}
            type="checkbox"
            id="sortDir"
            name="sortDir"
            value={sortDir}
          />
          <label className="sort-label" for="sortDir">
            Descending
          </label>
        </div>
      </form>
    </section>
  );
}
