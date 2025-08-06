const { useState, useEffect } = React;
const { useParams, useNavigate } = ReactRouterDOM;

import { userService } from "../services/user.service.js";

export function UserDetails() {
  const [user, setUser] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [params.userId]);

  function loadUser() {
    console.log(params.userId);
    userService
      .getById(params.userId)
      .then((user) => {
        console.log(user);
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

  if (!user) return <div>Loading...</div>;

  return (
    <section className="user-details">
      <h1>User {user.fullname}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim rem
        accusantium, itaque ut voluptates quo? Vitae animi maiores nisi,
        assumenda molestias odit provident quaerat accusamus, reprehenderit
        impedit, possimus est ad?
      </p>
      <button onClick={onBack}>Back</button>
    </section>
  );
}
