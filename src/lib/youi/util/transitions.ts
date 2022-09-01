import { getTransitionDuration } from './utils';

export function backdropIn(node:HTMLElement) {
  node.style.display = 'block';

  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t === 0) {
        node.classList.add('show');
      }
    }
  };
}

export function backdropOut(node:HTMLElement) {
  node.classList.remove('show');
  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t === 0) {
        node.style.display = 'none';
      }
    }
  };
}

export function collapseOut(node:HTMLElement) {
  node.style.height = `${node.getBoundingClientRect().height}px`;
  node.classList.add('collapsing');
  node.classList.remove('collapse', 'show');
  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t > 0) {
        node.style.height = '';
      } else if (t === 0) {
        node.classList.remove('collapsing');
        node.classList.add('collapse');
      }
    }
  };
}

export function collapseIn(node:HTMLElement) {
  node.classList.add('collapsing');
  node.classList.remove('collapse', 'show');
  node.style.height = "0";
  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t < 1) {
        node.style.height = `${node.scrollHeight}px`;
      } else {
        node.classList.remove('collapsing');
        node.classList.add('collapse', 'show');
        node.style.height = '';
      }
    }
  };
}

export function modalIn(node:HTMLElement) {
  node.style.display = 'block';
  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t > 0) {
        node.classList.add('show');
      }
    }
  };
}

export function modalOut(node:HTMLElement) {
  node.classList.remove('show');
  const duration = getTransitionDuration(node);

  return {
    duration,
    tick: (t:number) => {
      if (t === 1) {
        node.style.display = 'none';
      }
    }
  };
}
