const { useState, useEffect } = React;
const { useParams, useNavigate } = ReactRouterDOM;


import { userService } from "../services/user.service.js";
import { bugService } from "../services/bug.service.js";
import { BugList } from "../cmps/BugList.jsx";
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js";



export function UserDetails() {
  const [user, setUser] = useState(null);
  const [bugs, setBugs] = useState(null);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadBugs()
  }, [params.userId]);

  function loadBugs() {
    const filterBy={byUser: params.userId}
    bugService
      .query(filterBy)
      .then(setBugs)
      .catch((err) => showErrorMsg(`Couldn't load bugs - ${err}`));
  }

  function loadUser() {
    userService
      .getById(params.userId)
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log("err:", err);
        navigate("/");
      });
  }

  function onBack() {
    navigate("/bug");
  }
    function onRemoveBug(bugId) {
      bugService
        .remove(bugId)
        .then(() => {
          const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId);
          setBugs(bugsToUpdate);
          showSuccessMsg("Bug removed");
        })
        .catch((err) => showErrorMsg(`Cannot remove bug`, err));
    }
  
  function onEditBug(bug) {
    const severity = +prompt("New severity?", bug.severity);
    const bugToSave = { ...bug, severity };

    bugService
      .save(bugToSave)
      .then((savedBug) => {
        const bugsToUpdate = bugs.map((currBug) =>
          currBug._id === savedBug._id ? savedBug : currBug
        );
        setBugs(bugsToUpdate);
        showSuccessMsg("Bug updated");
      })
      .catch((err) => showErrorMsg("Cannot update bug", err));
  }
  if (!user) return <div>Loading...</div>;

  return (
    <section className="user-details">
      <h1>User {user.fullname}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      <button onClick={onBack}>Back</button>
    </section>
  );
}
