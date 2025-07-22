import pako from "pako";
import { Buffer } from "buffer";

function deflate(data: string) {
  const compressed = pako.deflateRaw(data, { level: 9 });
  const u8 = new Uint8Array(compressed);
  return Buffer.from(u8).toString("binary");
}

function inflate(data: string): string {
  const decompressed = pako.inflateRaw(
    new Uint8Array(data.split("").map((c) => c.charCodeAt(0))),
  );
  return new TextDecoder("utf-8").decode(decompressed);
}

function encode6bit(b: number) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b === 0) {
    return "-";
  }
  if (b === 1) {
    return "_";
  }
  return "?";
}

function decode6bit(cc: string) {
  var c = cc.charCodeAt(0);
  if (cc === "_") return 63;
  if (cc === "-") return 62;
  if (c >= 97) return c - 61; // - 97 + 26 + 10
  if (c >= 65) return c - 55; // - 65 + 10
  if (c >= 48) return c - 48;
  throw "invalid char.";
}

function append3bytes(b1: number, b2: number, b3: number) {
  var c1 = b1 >> 2;
  var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  var c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  var c4 = b3 & 0x3f;
  var r = "";
  r += encode6bit(c1 & 0x3f);
  r += encode6bit(c2 & 0x3f);
  r += encode6bit(c3 & 0x3f);
  r += encode6bit(c4 & 0x3f);
  return r;
}

function extract3bytes(data: string) {
  var c1 = decode6bit(data[0]);
  var c2 = decode6bit(data[1]);
  var c3 = decode6bit(data[2]);
  var c4 = decode6bit(data[3]);
  var b1 = (c1 << 2) | ((c2 >> 4) & 0x3f);
  var b2 = ((c2 << 4) & 0xf0) | ((c3 >> 2) & 0xf);
  var b3 = ((c3 << 6) & 0xc0) | (c4 & 0x3f);

  return [b1, b2, b3];
}

function encode64(data: string) {
  var r = "";
  for (var i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
    } else if (i + 1 === data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      r += append3bytes(
        data.charCodeAt(i),
        data.charCodeAt(i + 1),
        data.charCodeAt(i + 2),
      );
    }
  }
  return r;
}

function decode64(data: string) {
  var r = "";
  var i = 0;
  for (i = 0; i < data.length; i += 4) {
    var t = extract3bytes(data.substring(i, i + 4));
    r = r + String.fromCharCode(t[0]);
    r = r + String.fromCharCode(t[1]);
    r = r + String.fromCharCode(t[2]);
  }
  return r;
}

export const PlantUML = {
  encode(data: string) {
    return encode64(deflate(data));
  },
  decode(data: string) {
    return inflate(decode64(data));
  },
  URL(data: string, server: string = "https://www.plantuml.com/plantuml") {
    return `${server}/svg/${PlantUML.encode(data)}`;
  },
} as const;

export const DEFAULT_VALUE = `
@startuml
  Bob -> Alice : hello
@enduml
`.trim();

export const DEFAULT_URL = PlantUML.URL(DEFAULT_VALUE);

export const DEFAULT_SRC = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" contentStyleType="text/css" data-diagram-type="SEQUENCE" height="120px" preserveAspectRatio="none" style="width:110px;height:120px;background:#FFFFFF;" version="1.1" viewBox="0 0 110 120" width="110px" zoomAndPan="magnify">
  <defs/>
  <g>
    <g>
      <title>Bob</title>
      <rect fill="#000000" fill-opacity="0.00000" height="49.1328" width="8" x="21.5283" y="36.2969"/>
      <line style="stroke:#181818;stroke-width:0.5;stroke-dasharray:5,5;" x1="25" x2="25" y1="36.2969" y2="85.4297"/>
    </g>
    <g>
      <title>Alice</title>
      <rect fill="#000000" fill-opacity="0.00000" height="49.1328" width="8" x="76.9429" y="36.2969"/>
      <line style="stroke:#181818;stroke-width:0.5;stroke-dasharray:5,5;" x1="80.1094" x2="80.1094" y1="36.2969" y2="85.4297"/>
    </g>
    <g class="participant participant-head" data-participant="Bob">
      <rect fill="#E2E2F0" height="30.2969" rx="2.5" ry="2.5" style="stroke:#181818;stroke-width:0.5;" width="41.0566" x="5" y="5"/>
      <text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacing" textLength="27.0566" x="12" y="24.9951">Bob</text>
    </g>
    <g class="participant participant-tail" data-participant="Bob">
      <rect fill="#E2E2F0" height="30.2969" rx="2.5" ry="2.5" style="stroke:#181818;stroke-width:0.5;" width="41.0566" x="5" y="84.4297"/>
      <text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacing" textLength="27.0566" x="12" y="104.4248">Bob</text>
    </g>
    <g class="participant participant-head" data-participant="Alice">
      <rect fill="#E2E2F0" height="30.2969" rx="2.5" ry="2.5" style="stroke:#181818;stroke-width:0.5;" width="47.667" x="57.1094" y="5"/>
      <text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacing" textLength="33.667" x="64.1094" y="24.9951">Alice</text>
    </g>
    <g class="participant participant-tail" data-participant="Alice">
      <rect fill="#E2E2F0" height="30.2969" rx="2.5" ry="2.5" style="stroke:#181818;stroke-width:0.5;" width="47.667" x="57.1094" y="84.4297"/>
      <text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacing" textLength="33.667" x="64.1094" y="104.4248">Alice</text>
    </g>
    <g class="message" data-participant-1="Bob" data-participant-2="Alice">
      <polygon fill="#181818" points="68.9429,63.4297,78.9429,67.4297,68.9429,71.4297,72.9429,67.4297" style="stroke:#181818;stroke-width:1;"/>
      <line style="stroke:#181818;stroke-width:1;" x1="25.5283" x2="74.9429" y1="67.4297" y2="67.4297"/>
      <text fill="#000000" font-family="sans-serif" font-size="13" lengthAdjust="spacing" textLength="31.4146" x="32.5283" y="62.3638">hello</text>
    </g>
    <!--SRC=[SyfFKj2rKt3CoKnELR1Io4ZDoSa70000]-->
  </g>
</svg>
`.trim();
