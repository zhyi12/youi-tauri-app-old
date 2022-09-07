<script>
  /**
   * @typedef {"close" | "open"} ListBoxMenuIconTranslationId
   */

  import Icon from "../icon/Icon.svelte";
  import downIcon from "../icons/caret-down"

  /** Set to `true` to open the list box menu icon */
  export let open = false;

  /** Default translation ids */
  export const translationIds = { close: "close", open: "open" };

  /**
   * Override the default translation ids
   * @type {(id: ListBoxMenuIconTranslationId) => string}
   */
  export let translateWithId = (id) => defaultTranslations[id];


  const defaultTranslations = {
    [translationIds.close]: "Close menu",
    [translationIds.open]: "Open menu",
  };

  $: description = open ? translateWithId("close") : translateWithId("open");
</script>

<div
  class:bx--list-box__menu-icon="{true}"
  class:bx--list-box__menu-icon--open="{open}"
  {...$$restProps}
  on:click|preventDefault
>
    <Icon data={downIcon}></Icon>
</div>
