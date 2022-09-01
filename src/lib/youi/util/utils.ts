/* Check if a value is null */
export const isNull = (value: any) =>
  value === void 0 || value === null || value === "";

export function getOriginalBodyPadding() {
  const style:CSSStyleDeclaration = window ? window.getComputedStyle(document.body, null) : new CSSStyleDeclaration();
  return parseInt((style && style.getPropertyValue('padding-right')) || '0', 10);
}

export function getScrollbarWidth() {
  const scrollDiv = document.createElement('div');
  // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.width = '50px';
  scrollDiv.style.height = '50px';
  scrollDiv.style.overflow = 'scroll';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function setScrollbarWidth(padding) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
}

export function isBodyOverflowing() {
  return window ? document.body.clientWidth < window.innerWidth : false;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function isObject(value) {
  const type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

export function conditionallyUpdateScrollbar() {
  const scrollbarWidth = getScrollbarWidth();
  // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/js/src/modal.js#L433
  const fixedContent:HTMLElement = <HTMLElement>document.querySelectorAll(
    '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
  )[0];
  const bodyPadding = fixedContent
    ? parseInt(fixedContent.style.paddingRight || '0', 10)
    : 0;

  if (isBodyOverflowing()) {
    setScrollbarWidth(bodyPadding + scrollbarWidth);
  }
}

export function getColumnSizeClass(isXs:boolean, colWidth:number, colSize:string|boolean) {
  if (colSize === true || colSize === '') {
    return isXs ? 'col' : `col-${colWidth}`;
  } else if (colSize === 'auto') {
    return isXs ? 'col-auto' : `col-${colWidth}-auto`;
  }

  return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function browserEvent(target, ...args) {
  target.addEventListener(...args);

  return () => target.removeEventListener(...args);
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getNewCarouselActiveIndex(direction, items, activeIndex) {
  if (direction === 'prev') {
    return activeIndex === 0 ? items.length - 1 : activeIndex - 1;
  } else if (direction === 'next') {
    return activeIndex === items.length - 1 ? 0 : activeIndex + 1;
  }
}

export function toPixel(num:number){
  return num+'px';
}

function toClassName(value:string|number|any) {
  let result = '';

  if (typeof value === 'string' || typeof value === 'number') {
    result += value;
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      result = value.map(toClassName).filter(Boolean).join(' ');
    } else {
      for (const key in value) {
        if (value[key]) {
          result && (result += ' ');
          result += key;
        }
      }
    }
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default function classnames(...args) {
  return args.map(toClassName).filter(Boolean).join(' ');
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getTransitionDuration(element) {
  if (!element) return 0;

  // Get transition-duration of the element
  let { transitionDuration, transitionDelay } =
    window.getComputedStyle(element);

  const floatTransitionDuration = Number.parseFloat(transitionDuration);
  const floatTransitionDelay = Number.parseFloat(transitionDelay);

  // Return 0 if element or transition duration is not found
  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0;
  }

  // If multiple durations are defined, take the first
  transitionDuration = transitionDuration.split(',')[0];
  transitionDelay = transitionDelay.split(',')[0];

  return (
    (Number.parseFloat(transitionDuration) +
      Number.parseFloat(transitionDelay)) *
    1000
  );
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

