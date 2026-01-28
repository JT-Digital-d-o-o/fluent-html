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

// Forms
export {
  Form,
  FormTag,
  Input,
  InputTag,
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
