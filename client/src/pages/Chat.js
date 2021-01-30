import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  For,
  Match,
  onMount,
  Switch
} from "solid-js";

import io from 'socket.io-client';

import { throttle } from 'min-dash';

const THROTTLE_INTERVAL = 500;

export default function Chat(props) {
  let socket;

  const [ chatMessages, setChatMessages ] = createSignal([]);

  const [ chatMessage, setChatMessage ] = createSignal(null);

  const chatMessagesLength = createMemo(() => chatMessages().length, 0, true);

  const emitTyping = throttle(() => {
    socket.emit('typing', {
      name: props.name
    });
  }, THROTTLE_INTERVAL);

  const onInput = ({ target }) => {
    emitTyping();

    setChatMessage(target.value);
  }

  const onSubmit = event => {
    event.preventDefault();

    socket.emit('chatMessage', {
      name: props.name,
      message: chatMessage()
    });

    setChatMessage(null);
  };

  onMount(() => {
    socket = io();

    socket.emit('enterChat', {
      name: props.name
    });

    socket.on('chatMessage', function(chatMessage) {
      setChatMessages([
        ...chatMessages(),
        chatMessage
      ]);
    });
    
    socket.on('chatMessages', function(chatMessages) {
      setChatMessages(chatMessages);
    });

    window.onbeforeunload = () => {
      socket.emit('leaveChat', {
        name: props.name
      });

      socket.disconnect();
    };
  });

  let chatMessagesRef,
      inputRef;

  createEffect(() => {
    console.log('focus');

    inputRef.focus();
  });

  createEffect(() => {
    console.log('scroll');

    if (chatMessagesLength()) {
      chatMessagesRef.scrollTop = chatMessagesRef.scrollHeight;
    }
  });

  return <div class="chat">
    <ul ref={ chatMessagesRef } id="messages">
      <For each={ chatMessages() }>
        { (chatMessage, index) => {
            const previous = chatMessages()[ index() - 1 ],
                  isMe = () => props.name === chatMessage.name,
                  isTyping = () => chatMessage.typing,
                  isEnter = () => chatMessage.enter,
                  isLeave = () => chatMessage.leave,
                  message = () => !!chatMessage.message,
                  isFirstMessage = () => {
                    if (!previous || !message()) {
                      return false;
                    }

                    return !previous.message || previous.name !== chatMessage.name;
                  };

            return <>
              <Show when={ isFirstMessage() && !isMe() && message() } >
                <li class="name">{ chatMessage.name }</li>
              </Show>
              <Switch>
                <Match when={ isMe() && message() }>
                  <li class="chat-message me">{ chatMessage.message }</li>
                </Match>
                <Match when={ !isMe() && message() }>
                  <li class="chat-message not-me">{ chatMessage.message }</li>
                </Match>
                <Match when={ isEnter() }>
                  <li class="chat-message enter">{ `${ chatMessage.name } entered the chat.` }</li>
                </Match>
                <Match when={ isLeave() }>
                  <li class="chat-message leave">{ `${ chatMessage.name } left the chat.` }</li>
                </Match>
                <Match when={ !isMe() && isTyping() }>
                  <li class="chat-message typing">{ `${ chatMessage.name } is typing...` }</li>
                </Match>
              </Switch>
            </>;
        } }
      </For>
    </ul>
    <form id="form" onSubmit={ onSubmit }>
      <input ref={ inputRef } id="input" value={ chatMessage() } onInput={ onInput } autocomplete="off" spellcheck="false" />
      <button>Send</button>
    </form>
  </div>;
}

function getClassName(chatMessage, name) {
  const classNames = [
    'chat-message'
  ];

  if (chatMessage.enter) {
    classNames.push('enter');
  } else if (chatMessage.leave) {
    classNames.push('leave');
  } else if (chatMessage.name === name) {
    classNames.push('me');
  } else {
    classNames.push('not-me');
  }

  return classNames.join(' ');
}