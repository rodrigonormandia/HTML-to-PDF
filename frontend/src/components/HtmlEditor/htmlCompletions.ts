import { type CompletionContext, type Completion } from '@codemirror/autocomplete';

// HTML tag completions with descriptions
const htmlTags: Completion[] = [
  // Document structure
  { label: 'html', type: 'keyword', info: 'Root element' },
  { label: 'head', type: 'keyword', info: 'Document metadata container' },
  { label: 'body', type: 'keyword', info: 'Document body' },
  { label: 'title', type: 'keyword', info: 'Document title' },
  { label: 'meta', type: 'keyword', info: 'Metadata element' },
  { label: 'link', type: 'keyword', info: 'External resource link' },
  { label: 'style', type: 'keyword', info: 'Style information' },
  { label: 'script', type: 'keyword', info: 'Executable script' },

  // Content sections
  { label: 'header', type: 'keyword', info: 'Header section' },
  { label: 'footer', type: 'keyword', info: 'Footer section' },
  { label: 'main', type: 'keyword', info: 'Main content' },
  { label: 'section', type: 'keyword', info: 'Generic section' },
  { label: 'article', type: 'keyword', info: 'Article content' },
  { label: 'aside', type: 'keyword', info: 'Sidebar content' },
  { label: 'nav', type: 'keyword', info: 'Navigation section' },

  // Text content
  { label: 'div', type: 'keyword', info: 'Generic container' },
  { label: 'span', type: 'keyword', info: 'Inline container' },
  { label: 'p', type: 'keyword', info: 'Paragraph' },
  { label: 'h1', type: 'keyword', info: 'Heading level 1' },
  { label: 'h2', type: 'keyword', info: 'Heading level 2' },
  { label: 'h3', type: 'keyword', info: 'Heading level 3' },
  { label: 'h4', type: 'keyword', info: 'Heading level 4' },
  { label: 'h5', type: 'keyword', info: 'Heading level 5' },
  { label: 'h6', type: 'keyword', info: 'Heading level 6' },
  { label: 'blockquote', type: 'keyword', info: 'Block quotation' },
  { label: 'pre', type: 'keyword', info: 'Preformatted text' },
  { label: 'code', type: 'keyword', info: 'Code snippet' },

  // Inline text
  { label: 'a', type: 'keyword', info: 'Anchor/link' },
  { label: 'strong', type: 'keyword', info: 'Strong importance' },
  { label: 'em', type: 'keyword', info: 'Emphasis' },
  { label: 'b', type: 'keyword', info: 'Bold text' },
  { label: 'i', type: 'keyword', info: 'Italic text' },
  { label: 'u', type: 'keyword', info: 'Underline' },
  { label: 'small', type: 'keyword', info: 'Small text' },
  { label: 'mark', type: 'keyword', info: 'Marked/highlighted text' },
  { label: 'sub', type: 'keyword', info: 'Subscript' },
  { label: 'sup', type: 'keyword', info: 'Superscript' },

  // Lists
  { label: 'ul', type: 'keyword', info: 'Unordered list' },
  { label: 'ol', type: 'keyword', info: 'Ordered list' },
  { label: 'li', type: 'keyword', info: 'List item' },
  { label: 'dl', type: 'keyword', info: 'Description list' },
  { label: 'dt', type: 'keyword', info: 'Description term' },
  { label: 'dd', type: 'keyword', info: 'Description details' },

  // Tables
  { label: 'table', type: 'keyword', info: 'Table element' },
  { label: 'thead', type: 'keyword', info: 'Table header group' },
  { label: 'tbody', type: 'keyword', info: 'Table body group' },
  { label: 'tfoot', type: 'keyword', info: 'Table footer group' },
  { label: 'tr', type: 'keyword', info: 'Table row' },
  { label: 'th', type: 'keyword', info: 'Table header cell' },
  { label: 'td', type: 'keyword', info: 'Table data cell' },
  { label: 'caption', type: 'keyword', info: 'Table caption' },
  { label: 'colgroup', type: 'keyword', info: 'Column group' },
  { label: 'col', type: 'keyword', info: 'Column definition' },

  // Forms
  { label: 'form', type: 'keyword', info: 'Form element' },
  { label: 'input', type: 'keyword', info: 'Input field' },
  { label: 'textarea', type: 'keyword', info: 'Multi-line text input' },
  { label: 'button', type: 'keyword', info: 'Button element' },
  { label: 'select', type: 'keyword', info: 'Dropdown select' },
  { label: 'option', type: 'keyword', info: 'Select option' },
  { label: 'label', type: 'keyword', info: 'Form label' },
  { label: 'fieldset', type: 'keyword', info: 'Form field group' },
  { label: 'legend', type: 'keyword', info: 'Fieldset caption' },

  // Media
  { label: 'img', type: 'keyword', info: 'Image element' },
  { label: 'figure', type: 'keyword', info: 'Figure with caption' },
  { label: 'figcaption', type: 'keyword', info: 'Figure caption' },
  { label: 'video', type: 'keyword', info: 'Video content' },
  { label: 'audio', type: 'keyword', info: 'Audio content' },
  { label: 'source', type: 'keyword', info: 'Media source' },
  { label: 'svg', type: 'keyword', info: 'SVG graphics' },
  { label: 'canvas', type: 'keyword', info: 'Canvas graphics' },

  // Other
  { label: 'br', type: 'keyword', info: 'Line break' },
  { label: 'hr', type: 'keyword', info: 'Horizontal rule' },
  { label: 'address', type: 'keyword', info: 'Contact information' },
  { label: 'time', type: 'keyword', info: 'Date/time' },
  { label: 'progress', type: 'keyword', info: 'Progress indicator' },
];

// PDF-specific CSS class completions
const pdfClasses: Completion[] = [
  {
    label: 'page-break',
    type: 'class',
    info: 'Force page break after element',
    detail: 'CSS class'
  },
  {
    label: 'page-break-before',
    type: 'class',
    info: 'Force page break before element',
    detail: 'CSS class'
  },
  {
    label: 'avoid-break',
    type: 'class',
    info: 'Prevent page break inside element',
    detail: 'CSS class'
  },
];

// Common HTML attributes
const htmlAttributes: Completion[] = [
  { label: 'class', type: 'property', info: 'CSS class names' },
  { label: 'id', type: 'property', info: 'Unique identifier' },
  { label: 'style', type: 'property', info: 'Inline CSS styles' },
  { label: 'src', type: 'property', info: 'Source URL' },
  { label: 'href', type: 'property', info: 'Hyperlink reference' },
  { label: 'alt', type: 'property', info: 'Alternative text' },
  { label: 'title', type: 'property', info: 'Advisory title' },
  { label: 'width', type: 'property', info: 'Element width' },
  { label: 'height', type: 'property', info: 'Element height' },
  { label: 'type', type: 'property', info: 'Element type' },
  { label: 'name', type: 'property', info: 'Element name' },
  { label: 'value', type: 'property', info: 'Element value' },
  { label: 'placeholder', type: 'property', info: 'Placeholder text' },
  { label: 'disabled', type: 'property', info: 'Disable element' },
  { label: 'readonly', type: 'property', info: 'Read-only element' },
  { label: 'required', type: 'property', info: 'Required field' },
  { label: 'colspan', type: 'property', info: 'Column span' },
  { label: 'rowspan', type: 'property', info: 'Row span' },
];

/**
 * Custom HTML completion source for CodeMirror.
 * Provides completions for HTML tags, attributes, and PDF-specific classes.
 */
export function htmlCompletions(context: CompletionContext) {
  // Check if we're typing after '<' (tag name)
  const tagMatch = context.matchBefore(/<[\w]*/);
  if (tagMatch) {
    return {
      from: tagMatch.from + 1, // Start after '<'
      options: htmlTags,
      validFor: /^[\w]*$/,
    };
  }

  // Check if we're typing a class name (after class=")
  const classMatch = context.matchBefore(/class="[^"]*[\w-]*/);
  if (classMatch) {
    const classValueStart = classMatch.text.lastIndexOf('"') + 1;
    const lastSpace = classMatch.text.lastIndexOf(' ');
    const from = classMatch.from + Math.max(classValueStart, lastSpace + 1);

    return {
      from,
      options: pdfClasses,
      validFor: /^[\w-]*$/,
    };
  }

  // Check if we're typing an attribute name (after space in tag)
  const attrMatch = context.matchBefore(/<[\w]+\s+[\w]*/);
  if (attrMatch) {
    const lastSpace = attrMatch.text.lastIndexOf(' ');
    return {
      from: attrMatch.from + lastSpace + 1,
      options: htmlAttributes,
      validFor: /^[\w]*$/,
    };
  }

  return null;
}
