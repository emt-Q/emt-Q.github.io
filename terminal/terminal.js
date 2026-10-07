(() => {
  'use strict';
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('command-input');
  const output = document.getElementById('terminal-output');
  const screen = document.getElementById('terminal-screen');
  const welcome = document.querySelector('.terminal-welcome');
  const commands = ['help', 'whoami', 'about', 'projects', 'experience', 'education', 'skills', 'contact', 'classic', 'clear'];
  const history = [];
  let historyIndex = 0;
  let draft = '';
  let contentPromise;
  let commandQueue = Promise.resolve();

  function loadContent() {
    if (!contentPromise) {
      contentPromise = fetch('content.json').then(response => {
        if (!response.ok) throw new Error('Profile content unavailable');
        return response.json();
      }).catch(error => {
        contentPromise = undefined;
        throw error;
      });
    }
    return contentPromise;
  }

  function createResult(command) {
    const block = document.createElement('div');
    block.className = 'terminal-result';
    const prompt = document.createElement('p');
    prompt.className = 'terminal-command';
    prompt.textContent = `❯ ${command}`;
    block.append(prompt);
    return block;
  }

  function text(block, value, error = false) {
    const pre = document.createElement('pre');
    pre.textContent = value;
    if (error) pre.className = 'terminal-error';
    block.append(pre);
  }

  function links(block, entries) {
    const container = document.createElement('div');
    container.className = 'result-links';
    entries.forEach(([label, href]) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      container.append(link);
    });
    block.append(container);
  }

  async function execute(raw) {
    const command = raw.toLowerCase().trim();
    if (command === 'clear') {
      output.replaceChildren();
      welcome.hidden = true;
      screen.scrollTop = 0;
      return;
    }
    const block = createResult(raw);
    if (command === 'help') {
      text(block, 'Look around, one command at a time.\n\nhelp        Show available commands\nwhoami      A quick introduction\nabout       A little about me\nprojects    Selected work & research results\nexperience  Where I’ve been working\neducation   Education & recognition\nskills      Technical interests & tools\ncontact     Get in touch\nclassic     Open the full profile\nclear       Start with a clean screen\n\nTip: Tab completes a command. ↑ and ↓ browse your history.');
    } else if (command === 'classic') {
      text(block, 'The full picture, in a more familiar format.');
      links(block, [['Open classic profile →', '../classic/']]);
    } else if (commands.includes(command)) {
      try {
        const content = await loadContent();
        const entry = content[command === 'whoami' ? 'about' : command];
        text(block, entry.text);
        links(block, entry.links);
      } catch {
        text(block, 'The profile content could not load. Try again, or explore the classic view.', true);
        links(block, [['Read the full profile →', '../classic/']]);
      }
    } else {
      text(block, `Command not found: ${raw}\nType “help” to see the available commands.`, true);
    }
    // Insert each response atomically, so assistive technology announces it once.
    output.append(block);
    while (output.children.length > 30) output.firstElementChild.remove();
    screen.scrollTop = Math.max(0, block.offsetTop - screen.offsetTop - 20);
  }

  function submit(value) {
    const raw = value.trim().slice(0, 200);
    if (!raw) return;
    if (history.at(-1) !== raw) history.push(raw);
    if (history.length > 100) history.shift();
    historyIndex = history.length;
    draft = '';
    input.value = '';
    input.focus({ preventScroll: true });
    commandQueue = commandQueue.then(() => execute(raw));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    submit(input.value);
  });
  document.querySelectorAll('[data-command]').forEach(button => {
    button.addEventListener('click', () => submit(button.dataset.command));
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      const prefix = input.value.trim().toLowerCase();
      const matches = commands.filter(command => command.startsWith(prefix));
      // Preserve normal Tab navigation unless there is a unique completion.
      if (prefix && matches.length === 1 && matches[0] !== prefix) {
        event.preventDefault();
        input.value = matches[0];
      }
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      submit('clear');
    }
  });
})();
