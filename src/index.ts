// Core types and classes
export type { View, Thunk } from './core/index.js';
export { Tag } from './core/index.js';
export type { FluentCustomMethods } from './core/index.js';
export { RawString, Raw } from './core/index.js';
export { Empty, El } from './core/index.js';
export { isTag, isRawString } from './core/index.js';

// ARIA types — for setRole / setAria (A-02)
export type { AriaRole, AriaAttributeName, AriaValue, AriaAttrs } from './core/index.js';

// Theming — defineTheme + the augmentation seams (C-02).
// Users augment the FluentCustom* interfaces via `declare module "fluent-html"`.
export { defineTheme } from './core/index.js';
export type {
  ThemeSpec,
  ThemeKeys,
  FluentCustomColors,
  FluentCustomSpacing,
  FluentCustomFontSize,
  FluentCustomRadius,
  FluentCustomShadow,
  FluentCustomFontFamily,
} from './core/index.js';
export type { CssPropertyName } from './core/index.js';

// Object-form variants (llm-styling/object-variants)
export type { VariantStyleObject, StyleProps, NestedVariants, DirectVariant } from './core/index.js';

// HTML attribute types
export type {
  InputType,
  NumericInputType,
  DateTimeInputType,
  NoMinMaxInputType,
  AutocompleteHint,
  AutofillField,
  AddressField,
  AddressPurpose,
  FormEnctype,
  FormMethod,
  BrowsingContext,
  LinkRel,
  ReferrerPolicy,
  BooleanAttribute,
  // Iframe security unions (B-03)
  SandboxToken,
  PermissionsPolicyDirective,
  // Head-element / resource-hint unions (B-008)
  FetchPriority,
  LinkElementRel,
  LinkAs,
  LinkType,
  ScriptType,
  MetaName,
  Charset,
  // Native interactivity (B-010)
  PopoverState,
  PopoverAction,
  CommandFor,
  ClosedBy,
  // Global editing / keyboard attributes
  EnterKeyHint,
  ContentEditable,
  Autocapitalize,
  Spellcheck,
} from './elements/html-types.js';

// Table accessibility (B-04)
export type { TableCellScope } from './elements/index.js';

// Render
export { render, renderWithNonce } from './render/index.js';
export { renderToStream, renderToStreamWithNonce, renderToIterable } from './render/index.js';
export type { RenderOptions, RenderStreamOptions } from './render/index.js';

// Escaping / URL sanitization helpers — the typed setters apply sanitizeUrl
// automatically; exported for consumers who build attribute values by hand.
export { escapeHtml, escapeAttr, sanitizeUrl } from './render/index.js';

// Tag classes with typed attributes
export {
  ButtonTag,
  InputTag,
  NumericInputTag,
  DateTimeInputTag,
  NoMinMaxInputTag,
  TextareaTag,
  ImgTag,
  AnchorTag,
  LabelTag,
  SelectTag,
  OptionTag,
  OptgroupTag,
  FormTag,
  VideoTag,
  AudioTag,
  SourceTag,
  TrackTag,
  CanvasTag,
  SvgTag,
  IframeTag,
  ObjectTag,
  EmbedTag,
  MapTag,
  AreaTag,
  MetaTag,
  LinkTag,
  StyleTag,
  ScriptTag,
  BaseTag,
  TimeTag,
  DataTag,
  InsTag,
  DelTag,
  QTag,
  BlockquoteTag,
  ProgressTag,
  MeterTag,
  DetailsTag,
  DialogTag,
  FieldsetTag,
  OutputTag,
  SlotTag,
  ThTag,
  TdTag,
  ColTag,
  ColgroupTag,
} from './elements/index.js';

// Structural / Semantic elements
export {
  Div,
  Main,
  Header,
  Footer,
  Section,
  Article,
  Nav,
  Aside,
  Figure,
  Figcaption,
  Address,
  Hgroup,
  Search,
} from './elements/index.js';

// Text content
export {
  P,
  H1, H2, H3, H4, H5, H6,
  Span,
  Blockquote,
  Pre,
  Code,
  Hr,
  Br,
  Wbr,
} from './elements/index.js';

// Inline text semantics
export {
  Strong,
  Em,
  B, I, U, S,
  Mark,
  Small,
  Sub,
  Sup,
  Abbr,
  Cite,
  Q,
  Dfn,
  Kbd,
  Samp,
  Var,
  Bdi,
  Bdo,
  Ruby,
  Rt,
  Rp,
} from './elements/index.js';

// Lists
export {
  Ul,
  Ol,
  Li,
  Dl,
  Dt,
  Dd,
  Menu,
} from './elements/index.js';

// Tables
export {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Caption,
  Colgroup,
  Col,
} from './elements/index.js';

// Forms
export {
  Form,
  Input,
  Textarea,
  Button,
  Label,
  Select,
  Option,
  Optgroup,
  Datalist,
  Fieldset,
  Legend,
  Output,
} from './elements/index.js';

// Interactive elements
export {
  Details,
  Summary,
  Dialog,
} from './elements/index.js';

// Media elements
export {
  Img,
  Picture,
  Source,
  Video,
  Audio,
  Track,
  Canvas,
  Svg,
  // SVG elements
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
  Polyline,
  Ellipse,
  G,
  Defs,
  Use,
  Text,
  Tspan,
  // SVG gradients / paint servers / filters
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Mask,
  Filter,
  FeGaussianBlur,
} from './elements/index.js';

// Embedded content
export {
  Iframe,
  ObjectEl,
  Embed,
} from './elements/index.js';

// Links
export {
  A,
  MapEl,
  Area,
} from './elements/index.js';

// Document metadata / Head elements
export {
  HTML,
  HtmlTag,
  Document,
  DocumentTag,
  Doctype,
  Head,
  Body,
  Title,
  Meta,
  Link,
  Style,
  Script,
  Base,
  Noscript,
  Template,
} from './elements/index.js';

// Data / Time elements
export {
  Time,
  Data,
  Ins,
  Del,
} from './elements/index.js';

// Progress / Meter
export {
  Progress,
  Meter,
} from './elements/index.js';

// Web Components
export {
  Slot,
} from './elements/index.js';

// Typed form binding (B-01) — `Form<T>(state?, f => …)`; types for `state`/builder
export type { FormState, FormBinding, ErrorBag, SelectOption } from './elements/index.js';

// Overlay — Tag.prototype.overlay() (the method is registered via the control barrel)
export type { OverlayPosition } from './control/index.js';

// Control flow
export {
  IfThen,
  IfThenElse,
  Match,
  MatchValue,
  ForEach,
  ForEachElse,
  ForEachKeyed,
  Repeat,
  Intersperse,
} from './control/index.js';

// HTMX
export {
  hx,
  resolveSelector,
  // Selector helpers
  id,
  clss,
  closest,
  find,
  next,
  previous,
} from './htmx.js';
// Type-only re-exports (`export type` — TS1205-safe under verbatimModuleSyntax).
export type {
  HTMX,
  HxSwap,
  HxSwapStyle,
  HxTrigger,
  HxEncoding,
  HxTarget,
  HxHttpMethod,
  HxSync,
  HxOptions,
  HxConfig,
  HxStatusConfig,
  QueryParams,
  QueryParamValue,
} from './htmx.js';

// Common Patterns
export {
  // Partial helpers (htmx 4) — replaced the removed OOB/withOOB
  Partial,
  // Global config helper (htmx 4)
  HtmxConfig,
  // Response helpers
  hxResponse,
  HxResponse,
} from './patterns.js';
export type {
  HtmxGlobalConfig,
  HxResponseResult,
  HxLocationConfig,
} from './patterns.js';

// Type-safe IDs
export {
  createId,
  defineIds,
  isId,
  extractId,
  extractSelector,
} from './ids.js';
export type { Id } from './ids.js';

// Type-safe Routes
export {
  defineRoutes,
} from './routes.js';

export type {
  RouteDef,
  RouteHxOptions,
  ParamTypeName,
  ParamType,
} from './routes.js';

// Behavior system (v4 — flat data-behavior-* emission, ADR-01)
export type { BehaviorMap, BehaviorName, BehaviorTarget } from './behaviors/map.js';
export type { BehaviorEvent, LifecycleEvent } from './behaviors/events.js';
export { EVENT_TABLE, HTMX_EVENTS } from './behaviors/events.js';
