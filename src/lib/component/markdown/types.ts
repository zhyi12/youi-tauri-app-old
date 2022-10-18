import type { Schema } from 'hast-util-sanitize'
import type { Image } from 'mdast'
import type { Options } from 'remark-rehype'
import type { Processor } from 'unified'

export interface EditorProps extends ViewerProps {
  /**
   * Editor display mode
   *
   * - `split`: edit on the left and preview on the right
   * - `tab`: click tabs to switch between edit and preview
   * - `auto`: auto determined by the width of editor container
   *
   * @defaultValue `auto`
   */
  mode?: 'split' | 'tab' | 'auto'
  /**
   * Debounce time (ms) for preview
   *
   * @defaultValue 300
   */
  previewDebounce?: number
  /**
   * Editor placeholder
   */
  placeholder?: string
  /**
   * CodeMirror editor config
   *
   * https://codemirror.net/doc/manual.html#config
   */
  // editorConfig?: Omit<EditorConfiguration, 'value' | 'placeholder'>
  /**
   * i18n locale
   *
   * @defaultValue en
   */
  // locale?: Partial<BytemdLocale>
  /**
   * Handle images upload
   */
  uploadImages?: (
    files: File[]
  ) => Promise<Pick<Image, 'url' | 'alt' | 'title'>[]>
  /**
   * Override the default preview area render
   *
   * If specified, the built-in viewer would not take effect.
   */
  overridePreview?(el: HTMLElement, props: ViewerProps): void
  /**
   * Maximum length (number of characters) of value
   */
  maxLength?: number
}

export interface MdPlugin {
  remark?: (p: Processor) => Processor,
  rehype?: (p: Processor) => Processor
}

export interface ViewerProps {
  /**
   * Markdown text
   */
  value: string
  /**
   * Markdown plugin list
   */
  plugins?: MdPlugin[]
  /**
   * Sanitize strategy: Defaults to GitHub style sanitation with class names allowed
   *
   * https://github.com/syntax-tree/hast-util-sanitize/blob/main/lib/github.json
   *
   * If you want further customization, pass a function to mutate sanitize schema.
   */
  sanitize?: (schema: Schema) => Schema
  /**
   * custom remark-rehype options: Defaults value { allowDangerousHtml: true }
   *
   * https://github.com/remarkjs/remark-rehype
   */
  remarkRehype?: Options
}
