// Core types and classes
export type { View, Thunk } from './core/index.js';
export { Tag } from './core/index.js';
export { RawString, Raw } from './core/index.js';
export { Empty, El } from './core/index.js';

// Render
export { render } from './render/index.js';

// Tag classes with typed attributes
export {
  ButtonTag,
  InputTag,
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

// Utilities
export {
  Overlay,
  OverlayPosition,
} from './control/index.js';

// Control flow
export {
  IfThen,
  IfThenElse,
  SwitchCase,
  Match,
  ForEach,
  ForEach1,
  ForEach2,
  ForEach3,
  Repeat,
} from './control/index.js';

// HTMX
export {
  hx,
  HTMX,
  HxSwap,
  HxSwapStyle,
  HxTrigger,
  HxEncoding,
  HxTarget,
  HxHttpMethod,
  HxSync,
  HxOptions,
  // Selector helpers
  id,
  clss,
  closest,
  find,
  next,
  previous,
} from './htmx.js';

// Common Patterns
export {
  // Layout helpers
  VStack,
  HStack,
  Grid,
  // HTMX patterns
  SearchInput,
  InfiniteScroll,
  // OOB helpers
  OOB,
  withOOB,
  // Response helpers
  hxResponse,
  HxResponse,
  HxResponseResult,
  HxLocationConfig,
  // Form patterns
  FormField,
  // List patterns
  KeyedList,
} from './patterns.js';

// Type-safe IDs
export {
  Id,
  createId,
  defineIds,
  isId,
  extractId,
  extractSelector,
} from './ids.js';

// Fold / Catamorphism
export {
  foldView,
  countAlgebra,
  textAlgebra,
  linksAlgebra,
  renderAlgebra,
  createTransformAlgebra,
  addClassToMatching,
} from './fold/index.js';

export type {
  ViewAlgebra,
  TagAttrs,
  LinkInfo,
} from './fold/index.js';
