import {
  createSignal,
  Match,
  Switch
} from "solid-js";

import Chat from './pages/Chat';
import SetName from './pages/SetName';

export default function App() {
  const [ name, setName ] = createSignal(null);

  return <>
    <Switch fallback={<div>Not Found</div>}>
      <Match when={ name() === null }>
        <SetName setName={ setName } />
      </Match>
      <Match when={ name() !== null }>
        <Chat name={ name() } />
      </Match>
    </Switch>
  </>;
}