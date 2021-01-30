import {
  createSignal
} from "solid-js";

export default function SetName(props) {
  const [ name, setName ] = createSignal(null);

  const onInput = ({ target }) => {
    setName(target.value);
  }

  const onSubmit = event => {
    event.preventDefault();

    props.setName(name());
  };

  return <div class="set-name">
    <form onSubmit={ onSubmit }>
      <label for="name">Enter Name</label>
      <input id="name" value={ name() } onInput={ onInput }></input>
    </form>
  </div>;
}