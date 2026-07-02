// Register every Tag.prototype mixin — element factories import Tag directly
// from core/tag.js, bypassing the core barrel, so without this a Tag from the
// `./elements` subpath would be missing its entire fluent surface.
import "../core/register.js";

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
} from "./structural.js";

// Text content
export {
  P,
  H1, H2, H3, H4, H5, H6,
  Span,
  Blockquote,
  BlockquoteTag,
  Pre,
  Code,
  Hr,
  Br,
  Wbr,
} from "./text.js";

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
  QTag,
  Dfn,
  Kbd,
  Samp,
  Var,
  Bdi,
  Bdo,
  Ruby,
  Rt,
  Rp,
} from "./inline.js";

// Lists
export {
  Ul,
  Ol,
  Li,
  Dl,
  Dt,
  Dd,
  Menu,
} from "./lists.js";

// Tables
export {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  ThTag,
  Td,
  TdTag,
  Caption,
  Colgroup,
  ColgroupTag,
  Col,
  ColTag,
} from "./tables.js";

export type { TableCellScope } from "./tables.js";

// Forms
export {
  Form,
  FormTag,
  Input,
  InputTag,
  NumericInputTag,
  DateTimeInputTag,
  NoMinMaxInputTag,
  Textarea,
  TextareaTag,
  Button,
  ButtonTag,
  Label,
  LabelTag,
  Select,
  SelectTag,
  Option,
  OptionTag,
  Optgroup,
  OptgroupTag,
  Datalist,
  Fieldset,
  FieldsetTag,
  Legend,
  Output,
  OutputTag,
} from "./forms.js";

// Typed form binding (B-01)
export type {
  FormState,
  FormBinding,
  ErrorBag,
  SelectOption,
} from "./forms.js";

// Interactive elements
export {
  Details,
  DetailsTag,
  Summary,
  Dialog,
  DialogTag,
} from "./interactive.js";

// Media elements
export {
  Img,
  ImgTag,
  Picture,
  Source,
  SourceTag,
  Video,
  VideoTag,
  Audio,
  AudioTag,
  Track,
  TrackTag,
  Canvas,
  CanvasTag,
  Svg,
  SvgTag,
} from "./media.js";

// SVG elements
export {
  SvgShapeTag,
  Path,
  PathTag,
  Circle,
  CircleTag,
  Rect,
  RectTag,
  Line,
  LineTag,
  Polygon,
  PolygonTag,
  Polyline,
  PolylineTag,
  Ellipse,
  EllipseTag,
  G,
  Defs,
  Use,
  UseTag,
  Text,
  SvgTextTag,
  Tspan,
  TspanTag,
  LinearGradient,
  LinearGradientTag,
  RadialGradient,
  RadialGradientTag,
  Stop,
  StopTag,
  ClipPath,
  ClipPathTag,
  Mask,
  MaskTag,
  Filter,
  FilterTag,
  FeGaussianBlur,
  FeGaussianBlurTag,
} from "./svg.js";

// Embedded content
export {
  Iframe,
  IframeTag,
  ObjectEl,
  ObjectTag,
  Embed,
  EmbedTag,
} from "./embedded.js";

// Links
export {
  A,
  AnchorTag,
  MapEl,
  MapTag,
  Area,
  AreaTag,
} from "./links.js";

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
  MetaTag,
  Link,
  LinkTag,
  Style,
  StyleTag,
  Script,
  ScriptTag,
  Base,
  BaseTag,
  Noscript,
  Template,
} from "./document.js";

// Data / Time elements
export {
  Time,
  TimeTag,
  Data,
  DataTag,
  Ins,
  InsTag,
  Del,
  DelTag,
} from "./data.js";

// Progress / Meter
export {
  Progress,
  ProgressTag,
  Meter,
  MeterTag,
} from "./data.js";

// Web Components
export {
  Slot,
  SlotTag,
} from "./webcomponents.js";
