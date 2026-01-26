export { render, Thunk } from './builder.js';

// Core types
export { View, Tag } from './builder.js';

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
} from './builder.js';

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
} from './builder.js';

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
} from './builder.js';

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
} from './builder.js';

// Lists
export {
  Ul,
  Ol,
  Li,
  Dl,
  Dt,
  Dd,
  Menu,
} from './builder.js';

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
} from './builder.js';

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
} from './builder.js';

// Interactive elements
export {
  Details,
  Summary,
  Dialog,
} from './builder.js';

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
} from './builder.js';

// Embedded content
export {
  Iframe,
  ObjectEl,
  Embed,
} from './builder.js';

// Links
export {
  A,
  MapEl,
  Area,
} from './builder.js';

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
} from './builder.js';

// Data / Time elements
export {
  Time,
  Data,
} from './builder.js';

// Progress / Meter
export {
  Progress,
  Meter,
} from './builder.js';

// Web Components
export {
  Slot,
} from './builder.js';

// Utilities
export {
  El,
  Empty,
  Overlay,
  OverlayPosition,
} from './builder.js';

// Control flow
export {
  IfThen,
  IfThenElse,
  SwitchCase,
  ForEach,
  ForEach1,
  ForEach2,
  ForEach3,
  Repeat,
} from './builder.js';

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