import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { toValue } from 'vue';
import { createConsola } from 'consola';
import { createRouterMatcher } from 'vue-router';
import { promises, existsSync, mkdirSync } from 'node:fs';
import { resolve as resolve$2, dirname as dirname$1, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFilter } from 'nuxtseo-shared/utils';
import Database from 'better-sqlite3';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';
import { createHash } from 'node:crypto';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode$2(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$2(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE$1 = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE$1.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withoutLeadingSlash(input = "") {
  return (hasLeadingSlash(input) ? input.slice(1) : input) || "/";
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}
function isEqual$1(a, b, options = {}) {
  if (!options.trailingSlash) {
    a = withTrailingSlash(a);
    b = withTrailingSlash(b);
  }
  if (!options.leadingSlash) {
    a = withLeadingSlash(a);
    b = withLeadingSlash(b);
  }
  if (!options.encoding) {
    a = decode$2(a);
    b = decode$2(b);
  }
  return a === b;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject$1 = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject$1();
  const opt = {};
  const dec = opt.decode || decode$1;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode$1(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode$1(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode$1(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o$1(n){throw new Error(`${n} is not implemented yet!`)}let i$2 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o$1("Readable.asyncIterator")}iterator(e){throw o$1("Readable.iterator")}map(e,t){throw o$1("Readable.map")}filter(e,t){throw o$1("Readable.filter")}forEach(e,t){throw o$1("Readable.forEach")}reduce(e,t,r){throw o$1("Readable.reduce")}find(e,t){throw o$1("Readable.find")}findIndex(e,t){throw o$1("Readable.findIndex")}some(e,t){throw o$1("Readable.some")}toArray(e){throw o$1("Readable.toArray")}every(e,t){throw o$1("Readable.every")}flatMap(e,t){throw o$1("Readable.flatMap")}drop(e,t){throw o$1("Readable.drop")}take(e,t){throw o$1("Readable.take")}asIndexedPairs(e){throw o$1("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$2,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m$1(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$2.prototype),Object.assign(c$1.prototype,l$2.prototype),c$1}function m$1(...n){return function(...e){for(const t of n)t(...e);}}const g=_();let A$1 = class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};class y extends i$2{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p$1(this.headers)}get trailersDistinct(){return p$1(this.trailers)}}function p$1(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E$1=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E$1,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v$1(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$1=new Set([101,204,205,304]);async function b$1(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$1.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b$1(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$1(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$2(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function getMethod(event, defaultMethod = "GET") {
  return (event.node.req.method || defaultMethod).toUpperCase();
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i$1=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i$1;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController: AbortController$1 });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive$1(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive$1(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$2(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage$1 = createStorage({});

storage$1.mount('/assets', assets$1);

storage$1.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage$1, base) : storage$1;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e$1=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r$1="sha256",s="base64url";function digest(t){if(e$1)return e$1(r$1,t,s);const o=createHash(r$1).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(p)).join("") : "";
}
function camelCase(str, opts) {
  return lowerFirst(pascalCase(str || ""));
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}
const titleCaseExceptions = /^(a|an|and|as|at|but|by|for|if|in|is|nor|of|on|or|the|to|with)$/i;
function titleCase(str, opts) {
  return (Array.isArray(str) ? str : splitByCase(str)).filter(Boolean).map(
    (p) => titleCaseExceptions.test(p) ? p.toLowerCase() : upperFirst(p)
  ).join(" ");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "b9f28d70-ead1-42d3-a79b-6626d9a01389",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__nuxt_content/**": {
        "robots": false,
        "cache": false
      },
      "/__nuxt_content/content/sql_dump.txt": {
        "prerender": true
      },
      "/sitemap.xml": {
        "redirect": {
          "to": "/sitemap_index.xml",
          "statusCode": 307
        }
      },
      "/_nuxt": {
        "robots": "noindex",
        "headers": {
          "X-Robots-Tag": "noindex"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable",
          "X-Robots-Tag": "noindex"
        },
        "robots": "noindex"
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "siteUrl": "https://stretch.vn",
    "trackingApiUrl": "http://localhost:3001",
    "emailjsServiceId": "service_3mstlqr",
    "emailjsTemplateId": "template_ebx4wxc",
    "emailjsPublicKey": "bebvoFU9Mo_MGO_xi",
    "nuxt-seo-utils-version": "8.1.11",
    "seo-utils": {
      "canonicalQueryWhitelist": [
        "page",
        "sort",
        "filter",
        "search",
        "q",
        "category",
        "tag"
      ],
      "canonicalLowercase": true,
      "tagPriority": "low",
      "separator": "",
      "titleSeparator": ""
    },
    "mdc": {
      "components": {
        "prose": true,
        "map": {},
        "customElements": []
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      },
      "highlight": {
        "noApiRoute": true,
        "highlighter": "shiki",
        "theme": {
          "default": "github-light",
          "dark": "github-dark"
        },
        "shikiEngine": "oniguruma",
        "langs": [
          "js",
          "jsx",
          "json",
          "ts",
          "tsx",
          "vue",
          "css",
          "html",
          "bash",
          "md",
          "mdc",
          "yaml"
        ]
      }
    },
    "content": {
      "wsUrl": ""
    },
    "i18n": {
      "baseUrl": "",
      "defaultLocale": "en",
      "rootRedirect": "",
      "redirectStatusCode": 302,
      "skipSettingLocaleOnNavigate": false,
      "locales": [
        {
          "code": "en",
          "language": "en-US",
          "name": "English"
        },
        {
          "code": "vi",
          "language": "vi-VN",
          "name": "Tiếng Việt"
        }
      ],
      "detectBrowserLanguage": {
        "alwaysRedirect": false,
        "cookieCrossOrigin": false,
        "cookieDomain": "",
        "cookieKey": "i18n_redirected",
        "cookieSecure": false,
        "fallbackLocale": "",
        "redirectOn": "root",
        "useCookie": true
      },
      "experimental": {
        "localeDetector": "",
        "typedPages": true,
        "typedOptionsAndMessages": false,
        "alternateLinkCanonicalQueries": true,
        "devCache": false,
        "cacheLifetime": "",
        "stripMessagesPayload": false,
        "preload": false,
        "strictSeo": false,
        "nitroContextDetection": true,
        "httpCacheDuration": 10,
        "compactRoutes": false
      },
      "domainLocales": {
        "en": {
          "domain": ""
        },
        "vi": {
          "domain": ""
        }
      }
    },
    "nuxt-robots": {
      "version": "6.0.8",
      "isNuxtContentV2": false,
      "debug": false,
      "credits": true,
      "groups": [
        {
          "userAgent": [
            "*"
          ],
          "allow": [
            "/",
            "/vi/"
          ],
          "disallow": [
            "/api/",
            "/vi/api/"
          ],
          "contentUsage": [],
          "contentSignal": [],
          "_indexable": true,
          "_rules": [
            {
              "pattern": "/api/",
              "allow": false
            },
            {
              "pattern": "/vi/api/",
              "allow": false
            },
            {
              "pattern": "/",
              "allow": true
            },
            {
              "pattern": "/vi/",
              "allow": true
            }
          ],
          "_normalized": true
        },
        {
          "comment": [],
          "disallow": [
            "/api/",
            "/vi/api/"
          ],
          "allow": [
            "/",
            "/vi/"
          ],
          "userAgent": [
            "*"
          ],
          "contentUsage": [],
          "contentSignal": [],
          "_indexable": true,
          "_rules": [
            {
              "pattern": "/api/",
              "allow": false
            },
            {
              "pattern": "/vi/api/",
              "allow": false
            },
            {
              "pattern": "/",
              "allow": true
            },
            {
              "pattern": "/vi/",
              "allow": true
            }
          ],
          "_normalized": true
        }
      ],
      "sitemap": [
        "https://stretch.vn/sitemap.xml",
        "/sitemap_index.xml"
      ],
      "header": true,
      "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      "robotsDisabledValue": "noindex, nofollow",
      "cacheControl": "max-age=14400, must-revalidate",
      "botDetection": true,
      "pageMetaRobots": {}
    }
  },
  "databaseUrl": "",
  "sitemap": {
    "cacheMaxAgeSeconds": 600,
    "debug": false
  },
  "nuxt-schema-org": {
    "reactive": false,
    "minify": true,
    "scriptAttributes": {
      "data-nuxt-schema-org": true
    },
    "identity": {
      "type": "LocalBusiness",
      "name": "Stretch",
      "url": "https://stretch.vn",
      "logo": "/og-default.jpg"
    },
    "version": "6.0.4"
  },
  "content": {
    "databaseVersion": "v3.5.0",
    "version": "3.13.0",
    "database": {
      "type": "sqlite",
      "filename": "./contents.sqlite"
    },
    "localDatabase": {
      "type": "sqlite",
      "filename": "C:/Users/hoangnm/admin-template/site/.data/content/contents.sqlite"
    },
    "integrityCheck": true
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "env": "production"
      },
      {
        "_priority": -3,
        "_context": "nuxt-site-config:config",
        "url": "https://stretch.vn",
        "name": "Stretch",
        "description": "Redefining physical recovery through high-intensity science and modern spiritual clarity. Book your session online.",
        "defaultLocale": "en"
      },
      {
        "_context": "buildEnv",
        "_priority": -1,
        "url": "https://stretch.vn"
      },
      {
        "_context": "@nuxtjs/i18n",
        "defaultLocale": "en-US"
      }
    ],
    "version": "4.0.8",
    "debug": false,
    "multiTenancy": []
  },
  "nuxt-robots": {
    "version": "6.0.8",
    "isNuxtContentV2": false,
    "debug": false,
    "credits": true,
    "groups": [
      {
        "userAgent": [
          "*"
        ],
        "allow": [
          "/",
          "/vi/"
        ],
        "disallow": [
          "/api/",
          "/vi/api/"
        ],
        "contentUsage": [],
        "contentSignal": [],
        "_indexable": true,
        "_rules": [
          {
            "pattern": "/api/",
            "allow": false
          },
          {
            "pattern": "/vi/api/",
            "allow": false
          },
          {
            "pattern": "/",
            "allow": true
          },
          {
            "pattern": "/vi/",
            "allow": true
          }
        ],
        "_normalized": true
      },
      {
        "comment": [],
        "disallow": [
          "/api/",
          "/vi/api/"
        ],
        "allow": [
          "/",
          "/vi/"
        ],
        "userAgent": [
          "*"
        ],
        "contentUsage": [],
        "contentSignal": [],
        "_indexable": true,
        "_rules": [
          {
            "pattern": "/api/",
            "allow": false
          },
          {
            "pattern": "/vi/api/",
            "allow": false
          },
          {
            "pattern": "/",
            "allow": true
          },
          {
            "pattern": "/vi/",
            "allow": true
          }
        ],
        "_normalized": true
      }
    ],
    "sitemap": [
      "https://stretch.vn/sitemap.xml",
      "/sitemap_index.xml"
    ],
    "header": true,
    "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    "robotsDisabledValue": "noindex, nofollow",
    "cacheControl": "max-age=14400, must-revalidate",
    "botDetection": true,
    "pageMetaRobots": {}
  },
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": []
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await import('./error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const _XTi9nLEyfGJlB6ho5CZbhrfDT5ZLeTPqrlsOFzSmSSA = defineNitroPlugin((nitroApp) => {
  return;
});

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = /* @__PURE__ */ new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

const SiteConfigPriority = {
  nitro: -4,
  runtime: 0
};

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2]?.split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length === 0) {
      return () => {
      };
    }
    stack.push(entry);
    return () => {
      const idx = stack.indexOf(entry);
      if (idx !== -1)
        stack.splice(idx, 1);
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

const NUXT_SITE_ENV_RE = /^NUXT_(PUBLIC_)?SITE_/;
function envSiteConfig(env = {}) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(NUXT_SITE_ENV_RE, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0]?.toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

function getSiteConfig(e, _options) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

const _WRgSG0awsyUmoV4CYS9ShHpesmUUDl7Ewf5qWcIaEQ = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    const isIsland = process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith("/__nuxt_island");
    event.path;
    const noSSR = event.context.nuxt?.noSSR || routeOptions.ssr === false && !isIsland || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

const KNOWN_SEARCH_BOTS = [
  {
    pattern: "googlebot",
    name: "googlebot",
    secondaryPatterns: ["google.com/bot.html"]
  },
  {
    pattern: "bingbot",
    name: "bingbot",
    secondaryPatterns: ["msnbot"]
  },
  {
    pattern: "yandexbot",
    name: "yandexbot"
  },
  {
    pattern: "baiduspider",
    name: "baiduspider",
    secondaryPatterns: ["baidu.com"]
  },
  {
    pattern: "duckduckbot",
    name: "duckduckbot",
    secondaryPatterns: ["duckduckgo.com"]
  },
  {
    pattern: "slurp",
    name: "yahoo"
  },
  {
    pattern: "applebot",
    name: "applebot",
    secondaryPatterns: ["apple.com/go/applebot"]
  }
];
const SOCIAL_BOTS = [
  {
    pattern: "twitterbot",
    name: "twitter",
    secondaryPatterns: ["twitter"]
  },
  {
    pattern: "facebookexternalhit",
    name: "facebook",
    secondaryPatterns: ["facebook.com"]
  },
  {
    pattern: "linkedinbot",
    name: "linkedin",
    secondaryPatterns: ["linkedin"]
  },
  {
    pattern: "pinterestbot",
    name: "pinterest",
    secondaryPatterns: ["pinterest"]
  },
  {
    pattern: "discordbot",
    name: "discord",
    secondaryPatterns: ["discordapp"]
  }
];
const SEO_BOTS = [
  {
    pattern: "mj12bot",
    name: "majestic12",
    secondaryPatterns: ["majestic12.co.uk/bot"]
  },
  {
    pattern: "ahrefsbot",
    name: "ahrefs",
    secondaryPatterns: ["ahrefs.com"]
  },
  {
    pattern: "semrushbot",
    name: "semrush",
    secondaryPatterns: ["semrush.com/bot"]
  },
  {
    pattern: "screaming frog",
    name: "screaming-frog",
    secondaryPatterns: ["screamingfrog.co.uk"]
  },
  {
    pattern: "rogerbot",
    name: "moz"
  }
];
const AI_BOTS = [
  {
    pattern: "anthropic",
    name: "anthropic"
  },
  {
    pattern: "claude",
    name: "claude"
  },
  {
    pattern: "gptbot",
    name: "gpt",
    secondaryPatterns: ["openai.com"]
  },
  {
    pattern: "google-extended",
    name: "google-extended"
  },
  {
    pattern: "applebot-extended",
    name: "applebot-extended"
  },
  {
    pattern: "bytespider",
    name: "bytespider"
  },
  {
    pattern: "diffbot",
    name: "diffbot"
  },
  {
    pattern: "googlebot-news",
    name: "google-news"
  },
  {
    pattern: "cohere",
    name: "cohere",
    secondaryPatterns: ["cohere.com"]
  },
  {
    pattern: "ccbot",
    name: "commoncrawl",
    secondaryPatterns: ["commoncrawl.org"]
  },
  {
    pattern: "perplexitybot",
    name: "perplexity",
    secondaryPatterns: ["perplexity.ai"]
  }
];
const HTTP_TOOL_BOTS = [
  {
    pattern: "python-requests",
    name: "requests",
    secondaryPatterns: ["python"]
  },
  {
    pattern: "wget",
    name: "wget"
  },
  {
    pattern: "curl",
    name: "curl",
    secondaryPatterns: ["curl"]
  }
];
const SECURITY_SCANNING_BOTS = [
  {
    pattern: "zgrab",
    name: "zgrab"
  },
  {
    pattern: "masscan",
    name: "masscan"
  },
  {
    pattern: "nmap",
    name: "nmap",
    secondaryPatterns: ["insecure.org"]
  },
  {
    pattern: "nikto",
    name: "nikto"
  },
  {
    pattern: "wpscan",
    name: "wpscan"
  }
];
const SCRAPING_BOTS = [
  {
    pattern: "scrapy",
    name: "scrapy",
    secondaryPatterns: ["scrapy.org"]
  }
];
const AUTOMATION_BOTS = [
  {
    pattern: "phantomjs",
    name: "phantomjs"
  },
  {
    pattern: "headless",
    name: "headless-browser"
  },
  {
    pattern: "playwright",
    name: "playwright"
  },
  {
    pattern: "selenium",
    name: "selenium",
    secondaryPatterns: ["webdriver"]
  },
  {
    pattern: "puppeteer",
    name: "puppeteer",
    secondaryPatterns: ["headless"]
  }
];
const GENERIC_BOTS = [
  {
    pattern: "bot",
    name: "generic-bot"
  },
  {
    pattern: "spider",
    name: "generic-spider"
  },
  {
    pattern: "crawler",
    name: "generic-crawler"
  },
  {
    pattern: "scraper",
    name: "generic-scraper"
  }
];
const BOT_MAP = [
  {
    type: "search-engine",
    bots: KNOWN_SEARCH_BOTS,
    trusted: true
  },
  {
    type: "social",
    bots: SOCIAL_BOTS,
    trusted: true
  },
  {
    type: "seo",
    bots: SEO_BOTS,
    trusted: true
  },
  {
    type: "ai",
    bots: AI_BOTS,
    trusted: true
  },
  {
    type: "generic",
    bots: GENERIC_BOTS,
    trusted: false
  },
  {
    type: "automation",
    bots: AUTOMATION_BOTS,
    trusted: false
  },
  {
    type: "http-tool",
    bots: HTTP_TOOL_BOTS,
    trusted: false
  },
  {
    type: "security-scanner",
    bots: SECURITY_SCANNING_BOTS,
    trusted: false
  },
  {
    type: "scraping",
    bots: SCRAPING_BOTS,
    trusted: false
  }
];

const ROBOT_DIRECTIVE_VALUES = {
  // Standard directives
  enabled: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  disabled: "noindex, nofollow",
  index: "index",
  noindex: "noindex",
  follow: "follow",
  nofollow: "nofollow",
  none: "none",
  all: "all",
  // Non-standard directives (not part of official robots spec)
  noai: "noai",
  noimageai: "noimageai"
};
function formatMaxImagePreview(value) {
  return `max-image-preview:${value}`;
}
function formatMaxSnippet(value) {
  return `max-snippet:${value}`;
}
function formatMaxVideoPreview(value) {
  return `max-video-preview:${value}`;
}
function matches(pattern, path) {
  const pathLength = path.length;
  const patternLength = pattern.length;
  const matchingLengths = Array.from({ length: pathLength + 1 }).fill(0);
  let numMatchingLengths = 1;
  let p = 0;
  while (p < patternLength) {
    if (pattern[p] === "$" && p + 1 === patternLength) {
      return matchingLengths[numMatchingLengths - 1] === pathLength;
    }
    if (pattern[p] === "*") {
      numMatchingLengths = pathLength - matchingLengths[0] + 1;
      for (let i = 1; i < numMatchingLengths; i++) {
        matchingLengths[i] = matchingLengths[i - 1] + 1;
      }
    } else {
      let numMatches = 0;
      for (let i = 0; i < numMatchingLengths; i++) {
        const matchLength = matchingLengths[i];
        if (matchLength < pathLength && path[matchLength] === pattern[p]) {
          matchingLengths[numMatches++] = matchLength + 1;
        }
      }
      if (numMatches === 0) {
        return false;
      }
      numMatchingLengths = numMatches;
    }
    p++;
  }
  return true;
}
function matchPathToRule(path, _rules) {
  let matchedRule = null;
  const rules = _rules.filter(Boolean);
  const rulesLength = rules.length;
  let i = 0;
  while (i < rulesLength) {
    const rule = rules[i];
    if (!rule || !matches(rule.pattern, path)) {
      i++;
      continue;
    }
    if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
      matchedRule = rule;
    } else if (rule.pattern.length === matchedRule.pattern.length && rule.allow && !matchedRule.allow) {
      matchedRule = rule;
    }
    i++;
  }
  return matchedRule;
}
function asArray(v) {
  return typeof v === "undefined" ? [] : Array.isArray(v) ? v : [v];
}
function contentUsageToString(prefs) {
  return Object.entries(prefs).filter(([_, value]) => value !== void 0).map(([key, value]) => `${key}=${value}`).join(", ");
}
function normalizeContentPreferences(value) {
  if (!value)
    return [];
  if (Array.isArray(value))
    return value.filter((rule) => Boolean(rule));
  if (typeof value === "object" && !Array.isArray(value)) {
    const str = contentUsageToString(value);
    return str ? [str] : [];
  }
  if (typeof value === "string")
    return value ? [value] : [];
  return [];
}
function normalizeGroup(group) {
  if (group._normalized) {
    const resolvedGroup = group;
    const disallow2 = asArray(resolvedGroup.disallow);
    resolvedGroup._indexable = !disallow2.includes("/");
    resolvedGroup._rules = [
      ...resolvedGroup.disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...resolvedGroup.allow.map((r) => ({ pattern: r, allow: true }))
    ];
    return resolvedGroup;
  }
  const disallow = asArray(group.disallow);
  const allow = asArray(group.allow).filter((rule) => Boolean(rule));
  const contentUsage = normalizeContentPreferences(group.contentUsage);
  const contentSignal = normalizeContentPreferences(group.contentSignal);
  return {
    ...group,
    userAgent: group.userAgent ? asArray(group.userAgent) : ["*"],
    disallow,
    allow,
    contentUsage,
    contentSignal,
    _indexable: !disallow.includes("/"),
    _rules: [
      ...disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...allow.map((r) => ({ pattern: r, allow: true }))
    ],
    _normalized: true
  };
}
function generateRobotsTxt({ groups, sitemaps }) {
  const lines = [];
  for (const group of groups) {
    for (const comment of group.comment || [])
      lines.push(`# ${comment}`);
    for (const userAgent of group.userAgent || ["*"])
      lines.push(`User-agent: ${userAgent}`);
    for (const allow of group.allow || [])
      lines.push(`Allow: ${allow}`);
    for (const disallow of group.disallow || [])
      lines.push(`Disallow: ${disallow}`);
    for (const cleanParam of group.cleanParam || [])
      lines.push(`Clean-param: ${cleanParam}`);
    for (const contentUsage of group.contentUsage || [])
      lines.push(`Content-Usage: ${contentUsage}`);
    for (const contentSignal of group.contentSignal || [])
      lines.push(`Content-Signal: ${contentSignal}`);
    lines.push("");
  }
  for (const sitemap of sitemaps)
    lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n");
}
function createPatternMap() {
  const patternMap = /* @__PURE__ */ new Map();
  for (const def of BOT_MAP) {
    for (const bot of def.bots) {
      const patterns = [bot.pattern, ...bot.secondaryPatterns || []];
      for (const pattern of patterns) {
        patternMap.set(pattern.toLowerCase(), {
          botName: bot.name,
          botCategory: def.type,
          trusted: def.trusted
        });
      }
    }
  }
  return patternMap;
}
function normaliseRobotsRouteRule(config) {
  if (!config)
    return void 0;
  let allow;
  if (typeof config.robots === "boolean")
    allow = config.robots;
  else if (typeof config.robots === "object" && "indexable" in config.robots && typeof config.robots.indexable !== "undefined")
    allow = config.robots.indexable;
  let rule;
  if (typeof config.robots === "object" && config.robots !== null) {
    if ("rule" in config.robots && typeof config.robots.rule !== "undefined") {
      rule = config.robots.rule;
    } else if (!("indexable" in config.robots)) {
      const directives = [];
      for (const [key, value] of Object.entries(config.robots)) {
        if (value === false || value === null || value === void 0)
          continue;
        if (key in ROBOT_DIRECTIVE_VALUES && typeof value === "boolean" && value) {
          directives.push(ROBOT_DIRECTIVE_VALUES[key]);
        } else if (key === "max-image-preview" && typeof value === "string") {
          directives.push(formatMaxImagePreview(value));
        } else if (key === "max-snippet" && typeof value === "number") {
          directives.push(formatMaxSnippet(value));
        } else if (key === "max-video-preview" && typeof value === "number") {
          directives.push(formatMaxVideoPreview(value));
        }
      }
      if (directives.length > 0) {
        rule = directives.join(", ");
      }
    }
  } else if (typeof config.robots === "string") {
    rule = config.robots;
  }
  if (rule && typeof allow === "undefined") {
    const disallowIndicators = ["none", "noindex", "noai", "noimageai"];
    allow = !disallowIndicators.some(
      (indicator) => rule === indicator || rule.split(",").some((part) => part.trim() === indicator)
    );
  }
  if (typeof allow === "undefined" && typeof rule === "undefined")
    return;
  return {
    allow,
    rule
  };
}

function useRuntimeConfigNuxtRobots(event) {
  return useRuntimeConfig(event)["nuxt-robots"];
}

const logger$1 = createConsola({
  defaults: { tag: "@nuxtjs/robots" }
});

async function resolveRobotsTxtContext(e, nitro = useNitroApp()) {
  const { groups, sitemap: sitemaps } = useRuntimeConfigNuxtRobots(e);
  const generateRobotsTxtCtx = {
    event: e,
    context: e ? "robots.txt" : "init",
    errors: [],
    warnings: [],
    ...JSON.parse(JSON.stringify({ groups, sitemaps }))
  };
  await nitro.hooks.callHook("robots:config", generateRobotsTxtCtx);
  generateRobotsTxtCtx.groups = generateRobotsTxtCtx.groups.map(normalizeGroup);
  nitro._robots.ctx = generateRobotsTxtCtx;
  return generateRobotsTxtCtx;
}

const _QE7dIWPXqZY1lsrioLs4AfK_fknK9P6Rixk8NSyfck = defineNitroPlugin(async (nitroApp) => {
  const { isNuxtContentV2, robotsDisabledValue, botDetection } = useRuntimeConfigNuxtRobots();
  if (botDetection !== false) {
    nitroApp._robotsPatternMap = createPatternMap();
  }
  nitroApp._robots = {};
  await resolveRobotsTxtContext(void 0, nitroApp);
  const nuxtContentUrls = /* @__PURE__ */ new Set();
  if (isNuxtContentV2) {
    let urls;
    try {
      urls = await (await nitroApp.localFetch("/__robots__/nuxt-content.json", {})).json();
    } catch (e) {
      logger$1.error("Failed to read robot rules from content files.", e);
    }
    if (urls && Array.isArray(urls) && urls.length) {
      urls.forEach((url) => nuxtContentUrls.add(withoutTrailingSlash(url)));
    }
  }
  if (nuxtContentUrls.size) {
    nitroApp._robots.nuxtContentUrls = nuxtContentUrls;
  }
});

/*!
  * shared v11.4.2
  * (c) 2026 kazuya kawaguchi
  * Released under the MIT License.
  */
const _create = Object.create;
const create = (obj = null) => _create(obj);
/* eslint-enable */
/**
 * Useful Utilities By Evan you
 * Modified by kazuya kawaguchi
 * MIT License
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/codeframe.ts
 */
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (val) => val !== null && typeof val === 'object';
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);

const isNotObjectOrIsArray = (val) => !isObject(val) || isArray(val);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepCopy(src, des) {
    // src and des should both be objects, and none of them can be a array
    if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
        throw new Error('Invalid value');
    }
    const stack = [{ src, des }];
    while (stack.length) {
        const { src, des } = stack.pop();
        // using `Object.keys` which skips prototype properties
        Object.keys(src).forEach(key => {
            if (key === '__proto__') {
                return;
            }
            // if src[key] is an object/array, set des[key]
            // to empty object/array to prevent setting by reference
            if (isObject(src[key]) && !isObject(des[key])) {
                des[key] = Array.isArray(src[key]) ? [] : create();
            }
            if (isNotObjectOrIsArray(des[key]) || isNotObjectOrIsArray(src[key])) {
                // replace with src[key] when:
                // src[key] or des[key] is not an object, or
                // src[key] or des[key] is an array
                des[key] = src[key];
            }
            else {
                // src[key] and des[key] are both objects, merge them
                stack.push({ src: src[key], des: des[key] });
            }
        });
    }
}

const __nuxtMock = { runWithContext: async (fn) => await fn() };
const merger$1 = createDefu((obj, key, value) => {
  if (key === "messages" || key === "datetimeFormats" || key === "numberFormats") {
    obj[key] ??= create(null);
    deepCopy(value, obj[key]);
    return true;
  }
});
async function loadVueI18nOptions(vueI18nConfigs) {
  const nuxtApp = __nuxtMock;
  let vueI18nOptions = { messages: create(null) };
  for (const configFile of vueI18nConfigs) {
    const resolver = await configFile().then((x) => isModule(x) ? x.default : x);
    const resolved = isFunction(resolver) ? await nuxtApp.runWithContext(() => resolver()) : resolver;
    vueI18nOptions = merger$1(create(null), resolved, vueI18nOptions);
  }
  vueI18nOptions.fallbackLocale ??= false;
  return vueI18nOptions;
}
const isModule = (val) => toTypeString(val) === "[object Module]";
async function getLocaleMessages(locale, loader) {
  const nuxtApp = __nuxtMock;
  try {
    const getter = await nuxtApp.runWithContext(loader.load).then((x) => isModule(x) ? x.default : x);
    return isFunction(getter) ? await nuxtApp.runWithContext(() => getter(locale)) : getter;
  } catch (e) {
    throw new Error(`Failed loading locale (${locale}): ` + e.message);
  }
}
async function getLocaleMessagesMerged(locale, loaders = []) {
  const nuxtApp = __nuxtMock;
  const messages = await Promise.all(
    loaders.map((loader) => nuxtApp.runWithContext(() => getLocaleMessages(locale, loader)))
  );
  const merged = {};
  for (const message of messages) {
    deepCopy(message, merged);
  }
  return merged;
}

var nav$1 = {
	home: "Home",
	programs: "Programs",
	method: "The Method",
	studios: "Studios",
	membership: "Membership",
	individual: "For Individual",
	business: "For Business",
	business_recovery: "Recovery Event Solutions",
	business_training: "Education & Training",
	business_wellness: "Corporate Wellness",
	blog: "Blog",
	about: "About Us",
	freeTrial: "Free Trial",
	bookSession: "Book Session"
};
var hero$1 = {
	eyebrow: "Professional Movement Recovery",
	title1: "Move better.",
	title2: "Recover",
	titleHighlight: "smarter.",
	subtitle: "Personalized recovery & movement support — at our clinic, at home, or at your event.",
	usp1_title: "Non-invasive",
	usp1_sub: "safe & effective",
	usp2_title: "Personalized",
	usp2_sub: "to your body",
	usp3_title: "Measurable",
	usp3_sub: "long-term results",
	bookSession: "Book a Session",
	learnMore: "Explore Services"
};
var products$2 = {
	eyebrow: "Programs",
	title: "Our Programs",
	subtitle: "Discover recovery sessions designed for your goals — from foundational alignment to elite neurological conditioning.",
	viewAll: "View All Programs",
	allPrograms: "ALL",
	allProgramsHighlight: "PROGRAMS",
	allProgramsSubtitle: "Choose the session that matches your goals. From foundational alignment to elite performance conditioning.",
	mostPopular: "Most Popular"
};
var bookingSection$1 = {
	eyebrow: "Book Now",
	title: "Ready to Transform?",
	subtitle: "Three simple steps to your next level of recovery. Our expert practitioners are standing by.",
	step1: "Step 01",
	step1Title: "Choose Program",
	step1Desc: "Select the session type that fits your needs",
	step2: "Step 02",
	step2Title: "Pick Your Time",
	step2Desc: "Choose your practitioner, date, and time",
	step3: "Step 03",
	step3Title: "Confirm",
	step3Desc: "Enter your details and get instant confirmation"
};
var testimonials$1 = {
	eyebrow: "Testimonials",
	title: "What Our Clients Say",
	subtitle: "Your transformation is our greatest achievement.",
	t1_text: "Electric Peak completely transformed my recovery routine. The neurological conditioning is unlike anything I've experienced. Absolute game-changer.",
	t1_role: "CrossFit Athlete",
	t2_text: "After years of desk posture damage, one Zen Flow session made me feel 10 years younger. The practitioners here genuinely understand the body.",
	t2_role: "Software Engineer",
	t3_text: "Soul Recovery is the most restorative experience I've ever had. The parasympathetic reset left me in a state of complete bliss for days.",
	t3_role: "Yoga Instructor"
};
var faq$1 = {
	eyebrow: "FAQ",
	title: "Frequently Asked Questions",
	subtitle: "Quick answers to common questions about our programs and services.",
	cantFind: "Can't find the answer? Contact us!",
	sendQuestion: "Send a question",
	email: "Admin{'@'}stretch.vn",
	q1: "How do I book a session?",
	a1: "You can book online right here on our website by clicking \"Book Session\", selecting your program, practitioner, and time slot. Or call us directly at (028) 1234 5678.",
	q2: "Can I cancel or reschedule?",
	a2: "Yes, you can cancel or reschedule for free up to 24 hours before your session. After that window, a 30% cancellation fee applies. Contact our hotline for assistance.",
	q3: "How long is each session?",
	a3: "Sessions range from 45 minutes to 120 minutes depending on the program. Exact duration is listed in each program description. We recommend arriving 10 minutes early.",
	q4: "Do I need to prepare anything?",
	a4: "No special preparation needed. We provide robes, towels, and all necessary products. Just bring a relaxed mindset! If you have allergies or medical conditions, please let us know in advance.",
	q5: "What payment methods are accepted?",
	a5: "We accept cash, bank transfer, Visa/Mastercard, Apple Pay, Google Pay, and all major digital wallets. Payment is collected after your session is complete."
};
var footer$1 = {
	desc: "Movement recovery & rehabilitation support built around how you move and live.",
	individual: "For Individual",
	business: "For Business",
	company: "Company",
	about: "About Us",
	blog: "Blog",
	contact: "Contact",
	connect: "Connect",
	poweredBy: "POWERED BY",
	rights: "All rights reserved.",
	website: "Website",
	email: "Email",
	copyright: "© {year} Stretch.vn by Monaco Healthcare. {rights}",
	address: "493 Dien Bien Phu, Ban Co Ward, District 3, HCMC",
	view_map: "View on Google Maps",
	opening_hours: "Opening Hours",
	hours_weekday: "Monday – Saturday: 8:00 AM – 5:00 PM",
	hours_last_booking: "Last booking: 5:00 PM",
	hours_sunday: "Sunday: priority for pre-booked appointments"
};
var booking$1 = {
	heroTitle1: "BOOK YOUR",
	heroTitleHighlight: "SESSION",
	stepService: "Service",
	stepPractitioner: "Time",
	stepInfo: "Information",
	selectPractitioner: "Choose Your Specialist",
	anyPractitioner: "Any Specialist",
	backToServices: "Back to services",
	noSlots: "No slots available for this date. Please try another day.",
	"continue": "Continue",
	yourInfo: "Your Information",
	firstName: "First Name",
	lastName: "Last Name",
	email: "Email Address",
	phone: "Phone Number",
	note: "Special instructions or medical considerations...",
	confirmSession: "Confirm Session",
	backToSchedule: "Back to schedule",
	processing: "Processing...",
	errorName: "Please enter your name",
	errorPhone: "Please enter a valid phone number",
	successTitle: "SESSION BOOKED 🎉",
	successDesc: "You're all set. Prepare to ascend.",
	successEmail: "A confirmation email will be sent shortly.",
	home: "Home",
	bookAnother: "Book Another",
	at: "at"
};
var booking_v2$1 = {
	landing: {
		eyebrow: "BOOK ACCORDING TO YOUR NEEDS",
		title: "Proper care. {br} Effective recovery.",
		individual: "Individual",
		individual_desc: "Book for yourself",
		business: "Business",
		business_desc: "Services for teams or events",
		not_sure: "Not sure?",
		not_sure_desc: "Talk to our team for advice",
		start: "Start",
		chat_zalo: "Chat Zalo",
		summary_title: "A therapy session usually includes",
		summary_assess: "Assessment",
		summary_assess_desc: "Understand your issues and needs",
		summary_treat: "Treatment",
		summary_treat_desc: "Appropriate techniques to reduce pain and improve movement",
		summary_guide: "Guidance",
		summary_guide_desc: "Exercises and advice for long-term effectiveness"
	},
	individual: {
		step1_title: "What do you need help with?",
		step1_subtitle: "Choose the issue closest to you.",
		issue_recovery: "Post-workout Recovery",
		issue_recovery_desc: "Recovery support after training or competition",
		issue_pain: "Aches / Injuries",
		issue_pain_desc: "Pain relief, recovery after injury or surgery",
		issue_stiffness: "Prolonged Stiffness",
		issue_stiffness_desc: "Improve stiffness, reduced flexibility",
		issue_not_sure: "Not sure",
		issue_not_sure_desc: "Consult to choose the best solution",
		step2_title: "Where and when do you want therapy?",
		step2_subtitle: "Choose suitable location and time.",
		loc_home: "At Home",
		loc_home_desc: "We will come to you",
		loc_clinic: "At Clinic",
		loc_clinic_desc: "Come to Stretch clinic",
		loc_consult: "More Advice",
		loc_consult_desc: "Not decided yet",
		date_label: "Preferred Date",
		time_label: "Preferred Time",
		step3_title: "Contact Information",
		step3_subtitle: "So we can confirm and prepare the best session for you.",
		full_name: "Full Name",
		phone_zalo: "Phone / Zalo",
		email_optional: "Email (Optional)",
		contact_pref: "Preferred contact method",
		pref_call: "Call",
		pref_zalo: "Zalo",
		pref_email: "Email",
		note_optional: "Additional notes (Optional)",
		note_placeholder: "Share more about your condition, injury or goals...",
		privacy_consent: "I agree to Stretch.vn's Privacy Policy and Terms of Use",
		confirm_booking: "Confirm Booking"
	},
	business: {
		step1_title: "What are you planning?",
		step1_subtitle: "Choose the type of support you need.",
		plan_recovery: "Event Recovery",
		plan_recovery_desc: "Recovery support for a race, tournament, workshop or competition",
		plan_wellness: "Corporate Wellness",
		plan_wellness_desc: "Wellbeing for your team, at the office or offsite",
		plan_education: "Education & Training",
		plan_education_desc: "Practical training or workshop for your team",
		plan_not_sure: "Not sure",
		plan_not_sure_desc: "Talk to our team first",
		step2_title: "Tell us about your project",
		step2_subtitle: "This helps us understand your needs.",
		participants: "Number of participants",
		timeline: "Date / Timeline",
		location: "Location",
		setting: "Setting",
		setting_indoor: "Indoor",
		setting_outdoor: "Outdoor",
		anything_else: "Anything else? (Optional)",
		step3_title: "Your contact information",
		step3_subtitle: "We'll use this to send you a proposal.",
		full_name: "Full name",
		role: "Role / Position",
		email: "Email",
		consent: "I agree to be contacted by Stretch",
		send_request: "Send Request",
		summary_sidebar: "Business Request",
		summary_plan: "Service Plan",
		summary_timeline: "Timeline",
		summary_participants: "Participants",
		summary_people: "people",
		summary_location: "Location",
		summary_empty: "No plan selected — tap a service package above"
	},
	success: {
		thanks: "Thank you!",
		desc: "We have received your request.",
		desc_business: "Our team will contact you shortly to confirm your session and guide you to the right starting point.",
		contact_soon: "Our team will contact you as soon as possible to confirm information and prepare the best therapy session for you.",
		all_set: "You're all set!",
		summary_title: "Information you provided",
		summary_issue: "Issue",
		summary_loc: "Location",
		summary_time: "Time",
		summary_contact: "Contact",
		chat_zalo: "Chat Zalo now",
		call_stretch: "Call Stretch",
		back_home: "Back to Home"
	},
	common: {
		step: "Step",
		next: "Continue",
		back: "Back"
	}
};
var trust_bar$1 = {
	hours_count: "2,400+",
	hours_label: "hours of therapy",
	events_count: "35+",
	events_label: "recovery events",
	partners_count: "20+",
	partners_label: "trusted partners",
	powered_by: "Powered by"
};
var services$1 = {
	title: "Our Services",
	individual_label: "Individual",
	individual_title: "Personal recovery that meets you where you are.",
	individual_desc: "Whether you're recovering from injury, managing recurring tightness, or want to move more effectively — Stretch brings professional support to you.",
	sport_recovery: "Sport Recovery",
	rehabilitation: "Rehabilitation",
	targeted_relief: "Area-Specific Tension Relief",
	explore_individual: "Explore Individual Services",
	business_label: "Business",
	business_title: "Recovery infrastructure for organizations that move.",
	business_desc: "From tournament recovery stations to year-round corporate wellness — we design, staff, and deliver programs built around your people.",
	event_solutions: "Recovery Event Solutions",
	education_training: "Education & Professional Training",
	corporate_wellness: "Corporate Wellness",
	explore_business: "Explore Business Services"
};
var where_we_work$1 = {
	title: "Where We Work",
	home_title: "At Home",
	home_desc: "Convenient, private, and effective care in the comfort of your space.",
	clinic_title: "At Our Clinic",
	clinic_desc: "Fully equipped facilities with expert team and modern rehabilitation tools.",
	event_title: "At Your Event",
	event_desc: "On-site recovery support tailored to your participants and environment.",
	explore_location: "Explore Location"
};
var why_stretch$1 = {
	eyebrow: "Why Stretch",
	titleLine1: "Expertise you can feel.",
	titleLine2: "Structure you can trust.",
	desc: "We're not a spa, not a clinic, not a gym. Stretch is a recovery and movement support system — built around outcomes, delivered by qualified practitioners.",
	powered_by: "Powered by",
	monaco: "Monaco",
	monaco_desc: "The clinical infrastructure behind Stretch comes from Monaco — Vietnam's established movement health platform.",
	not_spa_title: "Not a spa.",
	not_spa_desc: "Every session has a clinical rationale and a movement outcome. No ambience-first thinking. No candles.",
	not_clinic_title: "Not a clinic.",
	not_clinic_desc: "No sterile waiting rooms or paperwork-heavy processes. We work where you are — home, clinic, or your event.",
	not_gym_title: "Not a gym.",
	not_gym_desc: "We're not here to train you. We're here to make sure your body can keep up with everything else you do.",
	system_title: "A structured recovery system.",
	system_desc: "Clinical-grade support with operational clarity. From assessment to outcome — built around how you actually move and live."
};
var cta_bar$1 = {
	title: "Ready to move better and feel lighter?",
	subtitle: "Book a session or reach out — we're here to help.",
	get_advice: "Get Advice"
};
var assurance$1 = {
	secureTitle: "Secure Payment",
	secureDesc: "Full encryption for all transactions",
	expertTitle: "Expert Certified",
	expertDesc: "Licensed neuromuscular therapists",
	rapidTitle: "Rapid Results",
	rapidDesc: "Feel the difference in one session"
};
var about$1 = {
	eyebrow: "Our Philosophy",
	title1: "THE",
	titleHighlight: "METHOD",
	subtitle: "Where high-intensity science meets modern spiritual clarity. We believe every body deserves to ascend.",
	storyEyebrow: "Our Story",
	storyTitle: "8+ Years of Excellence",
	storyP1: "Founded in 2018, Electric Zen began with a simple vision: to bring elite-level neuromuscular recovery to everyone, not just professional athletes.",
	storyP2: "Over 8 years, we've served 2,000+ clients with internationally certified practitioners and cutting-edge technology.",
	val1Title: "Science",
	val1Desc: "Evidence-based neuromuscular techniques and protocols.",
	val2Title: "Spirit",
	val2Desc: "Modern clarity practices for mind-body integration.",
	val3Title: "Intensity",
	val3Desc: "High-performance conditioning for elite results.",
	ctaTitle: "Ready to Ascend?",
	ctaDesc: "Book your first session today and feel the difference."
};
var partners$1 = {
	eyebrow: "PARTNERS & COMMUNITY",
	title: "Trusted by Partners",
	subtitle: "Stretch.vn has delivered recovery, workshops, and community activities with partners in sports, healthcare, and business."
};
var contact_widget$1 = {
	zalo: "Chat on Zalo",
	messenger: "Message us",
	whatsapp: "WhatsApp us",
	phone: "Call Stretch",
	phone_number: "0938 713 498"
};
var individual_page$1 = {
	seo_title: "Individual Recovery Services — Stretch.vn",
	seo_desc: "Personalized recovery & movement support for individuals.",
	hero: {
		heading: "Move better. Recover smarter.",
		subtext: "Support that meets you where you are.",
		cta1: "Book a Session",
		cta2: "Ask for Advice"
	},
	who_is_this_for: {
		title: "This is for you if you:",
		item1: "Train regularly but your body isn’t keeping up",
		item2: "Have recurring tightness or discomfort",
		item3: "Are recovering from injury or surgery",
		item4: "Want to move better without pushing through pain"
	},
	customer_carousel: {
		title: "Who we work with",
		subtitle: "Different people. Different bodies. One goal: move and feel better.",
		card1: "Runners",
		card1_desc: "Training for distance or speed",
		card2: "Racquet sport players",
		card2_desc: "Pickleball, tennis, badminton",
		card3: "Office workers",
		card3_desc: "Long hours sitting, neck & back tension",
		card4: "Active adults",
		card4_desc: "Gym, yoga, or regular workouts",
		card5: "Injury recovery",
		card5_desc: "Post-injury or post-surgery support",
		card6: "Older adults",
		card6_desc: "Maintaining mobility and comfort"
	},
	situation: {
		title: "Find your services",
		card1: "Recover after training",
		desc1: "You've trained hard— now your body needs to reset.",
		card2: "Pain or injury",
		desc2: "Something is limiting how you move.",
		card3: "Ongoing tightness",
		desc3: "Not an injury, but it keeps coming back.",
		card4: "Not sure",
		desc4: "We'll help you figure it out."
	},
	experiencing: {
		title: "You might be experiencing:",
		item1: "Heavy legs after running or matches",
		item2: "Shoulder, back, or knee discomfort",
		item3: "Stiff neck or tight hips",
		item4: "Reduced mobility or range of motion",
		item5: "Fatigue affecting your performance",
		item6: "Recurring pain or tightness"
	},
	how_supports: {
		title: "How Stretch supports you",
		line: "We don’t just treat — we help your body work better.",
		item1: "Understand how you move",
		item2: "Support the right areas",
		item3: "Help you move more efficiently"
	},
	what_to_expect: {
		title: "What to expect",
		line: "A typical session includes:",
		item1: "Movement assessment",
		item2: "Targeted treatment",
		item3: "Simple guidance to take with you",
		duration: "Duration: 45–60 minutes"
	},
	final_cta: {
		title: "Not sure where to start?",
		cta1: "Book a Session",
		cta2: "Ask for Advice"
	},
	floating_cta: {
		text: "Need help choosing the right recovery?",
		cta1: "Book a Session",
		cta2: "Get Advice"
	},
	trust_features: {
		title1: "Experienced team",
		desc1: "Trained professionals",
		title2: "Personalized approach",
		desc2: "Tailored to your needs",
		title3: "Flexible options",
		desc3: "At clinic or at home",
		title4: "Trusted by athletes",
		desc4: "and active individuals"
	}
};
var business_page$1 = {
	hero: {
		label: "FOR BUSINESSES",
		heading: "Better people. Better performance.",
		subtext: "We partner with organizations to improve well-being, support performance, and build stronger teams through movement.",
		cta1: "Talk to Our Team",
		cta2: "See Our Solutions"
	},
	solutions: {
		label: "OUR 3 BUSINESS SOLUTIONS",
		heading: "Flexible solutions for different business needs.",
		card1: {
			title: "Corporate Wellness",
			desc: "Invest in your people. Build a healthier, more productive workplace.",
			item1: "Onsite stretching & recovery sessions",
			item2: "Wellness programs for employees",
			item3: "Workshops & movement education",
			item4: "Long-term wellness partnership",
			cta: "Explore Corporate Wellness"
		},
		card2: {
			title: "Event & Recovery Booth",
			desc: "Support athletes and participants. Enhance performance and experience.",
			item1: "Recovery booth for events",
			item2: "Onsite stretching & mobility",
			item3: "Fast response & injury support",
			item4: "Custom packages for sports events",
			cta: "Explore Event Solutions"
		},
		card3: {
			title: "Education & Training",
			desc: "Train your team with the right knowledge, skills, and hands-on practice.",
			item1: "Assessment & movement basics",
			item2: "Stretching & mobilization courses",
			item3: "Sport recovery & fast response",
			item4: "Custom training programs",
			cta: "Explore Training Programs"
		}
	},
	why: {
		label: "WHY PARTNER WITH STRETCH?",
		heading: "More than a service. A long-term partner.",
		item1: {
			title: "Experienced Team",
			desc: "Professional therapists and trainers with real-world experience."
		},
		item2: {
			title: "Safe & Effective",
			desc: "Evidence-informed approach with safety as our top priority."
		},
		item3: {
			title: "Custom Solutions",
			desc: "Programs tailored to your goals, people, and industry."
		},
		item4: {
			title: "Measurable Impact",
			desc: "Track progress and see the impact on well-being and performance."
		},
		item5: {
			title: "People First",
			desc: "We care about your people as much as you do."
		}
	},
	trust: {
		label: "TRUSTED PARTNERS",
		heading: "Trusted by organizations that value their people."
	},
	cta: {
		label: "TALK TO US",
		heading: "Ready to build a healthier, stronger team?",
		sub: "Let's create the right solution for your business.",
		cta1: "Talk to Our Team",
		cta2: "Request a Proposal",
		bar_text: "Planning a program for your team?",
		bar_sub: "We're here to help you get started."
	}
};
var wellness_page$1 = {
	seo_title: "Corporate Wellness — Stretch.vn",
	seo_desc: "Wellness programs that fit how your team actually works and moves.",
	hero: {
		label: "CORPORATE WELLNESS",
		heading: "Wellness programs people actually use.",
		subtext: "Most teams don't need more wellness ideas. They need something that fits how people actually work and move.",
		cta1: "Request Wellness Plan",
		cta2: "Talk to Team"
	},
	problem: {
		statement: "Most workplace discomfort is predictable — but often ignored.",
		neck: "Neck and shoulder tension",
		back: "Lower back stiffness",
		movement: "Low daily movement",
		fatigue: "Recurring fatigue"
	},
	delivery: {
		title: "What we deliver",
		workshop_title: "Movement workshops",
		workshop_desc: "Guided sessions your team can apply immediately.",
		assessment_title: "Mini assessment station",
		assessment_desc: "Quick checks to help employees understand their body.",
		recovery_title: "Recovery day activation",
		recovery_desc: "A structured session combining assessment, treatment, and guidance."
	},
	why: {
		title: "Why it works",
		statement: "Wellness only works if people actually use it.",
		real: "Built around real workplace tension",
		designed: "Designed for real office environments",
		simple: "Simple, repeatable, and easy to follow",
		followup: "Clear follow-up and recommendations"
	},
	cta: {
		title: "See what this could look like for your team",
		cta1: "Request Wellness Plan",
		cta2: "Talk to Team",
		sub: "We'll help you design the right approach."
	},
	floating: {
		text: "Planning wellness for your team?",
		cta1: "Talk to Team",
		cta2: "Request Plan"
	}
};
var event_page$1 = {
	seo_title: "Recovery Event Solutions — Stretch.vn",
	seo_desc: "Recovery infrastructure for events that move.",
	hero: {
		label: "RECOVERY EVENT SOLUTIONS",
		heading: "Recovery infrastructure for events that move.",
		subtext: "We design and run recovery support that keeps athletes moving, reduces friction, and elevates your event experience.",
		cta1: "Request Proposal",
		cta2: "Talk to Team"
	},
	stats: {
		sessions: "2,400+",
		sessions_label: "sessions delivered",
		events: "35+",
		events_label: "events supported",
		partners: "20+",
		partners_label: "partners & organizers"
	},
	who_is_for: {
		label: "WHO THIS IS FOR",
		heading: "Recovery infrastructure for all types of events.",
		item1: {
			title: "Tournament organizers",
			desc: "Deliver a better athlete experience at every event."
		},
		item2: {
			title: "Sport events & races",
			desc: "Support participants across all performance levels."
		},
		item3: {
			title: "Brand activations",
			desc: "Elevate engagement with a meaningful recovery experience."
		},
		item4: {
			title: "Corporate sport days",
			desc: "Care for your people and strengthen team wellness."
		}
	},
	differences: {
		label: "THE DIFFERENCE",
		heading: "What makes our event support different",
		subtext: "A recovery zone should do more than help people feel better — it should support flow, reduce friction, and reflect how well your event is run.",
		card1: {
			title: "Professional Stretch Zone",
			desc: "Clean, branded setup that looks event-ready and represents your brand well."
		},
		card2: {
			title: "Smart Station Flow",
			desc: "Smart station flow even in minimal spaces to reduce wait time and keep athletes moving smoothly."
		},
		card3: {
			title: "Fast Response Support",
			desc: "Ambulance & fast response team on standby to prevent injuries or handle cramps and urgent on-site needs."
		},
		card4: {
			title: "Warm-up Icebreaker",
			desc: "Guided warm-up activities to increase participation, energy, and overall event satisfaction."
		},
		learn_more: "Learn more"
	},
	where_works: {
		label: "WHERE THIS WORKS",
		heading: "Designed for events that move",
		subtext: "We support all kinds of sport and community events.",
		item1: "Pickleball tournaments",
		item2: "Running events",
		item3: "Tennis competitions",
		item4: "Corporate sport days"
	},
	how_works: {
		label: "HOW IT WORKS",
		heading: "Simple steps. Smooth execution.",
		subtext: "From planning to onsite delivery, we handle the details so you don't have to.",
		step1: {
			title: "1. Plan",
			desc: "We understand your event goals, space, athlete profile, and flow."
		},
		step2: {
			title: "2. Deliver",
			desc: "We set up the recovery zone and run the service seamlessly throughout the event."
		}
	},
	trust: {
		label: "TRUSTED PARTNERS",
		heading: "Trusted by organizers and brands"
	}
};
var education_page$1 = {
	seo_title: "Education & Training — Stretch.vn",
	seo_desc: "Structured training for teams who want consistency, safer hands-on skills, and better recovery outcomes.",
	hero: {
		label: "EDUCATION & TRAINING",
		heading: "Train teams to think beyond technique.",
		subtext: "Structured training for teams who want consistency, safer hands-on skills, and better recovery outcomes.",
		cta1: "Discuss Training Program",
		cta2: "Talk to Team"
	},
	problem: {
		statement: "Most teams know techniques. Few understand when and why to use them.",
		bullet1: "Over-reliance on fixed protocols",
		bullet2: "Limited assessment thinking",
		bullet3: "Inconsistent hands-on execution",
		bullet4: "Lack of communication with clients"
	},
	system: {
		title: "A structured training system",
		level0: "LEVEL 0\nFOUNDATION",
		level0_title: "Assessment & Movement Basics",
		level0_desc: "Understand how to observe and assess movement.",
		level0_item1: "ROM",
		level0_item2: "Posture",
		level0_item3: "Movement screening",
		level0_item4: "Pain scale",
		level0_output: "Output: Identify basic movement issues",
		level1: "LEVEL 1\nSKILL TRACK",
		level1_title: "Lower Body Stretching & Mobilization",
		level1_desc: "Improve mobility and control in lower body.",
		level1_item1: "Hip mobility",
		level1_item2: "Hamstring",
		level1_item3: "Quadriceps",
		level1_item4: "Ankle mobility",
		level1_output: "Output: Apply lower body protocols safely",
		level2: "LEVEL 2\nSKILL TRACK",
		level2_title: "Upper Body Stretching & Mobilization",
		level2_desc: "Handle neck, shoulder, and upper back issues.",
		level2_item1: "Neck & shoulder",
		level2_item2: "Thoracic mobility",
		level2_item3: "Pec & lat mobility",
		level2_item4: "Shoulder ROM",
		level2_output: "Output: Consistent hands-on execution",
		level3: "LEVEL 3\nPERFORMANCE TRACK",
		level3_title: "Sport Stretching (Stretch to Perform)",
		level3_desc: "Apply stretching based on sport needs.",
		level3_item1: "Warm-up",
		level3_item2: "Recovery",
		level3_item3: "Sport-specific mobility",
		level3_item4: "Performance prep",
		level3_output: "Output: Use stretching to improve performance",
		level4: "LEVEL 4\nEVENT TRACK",
		level4_title: "Fast Response in Sports",
		level4_desc: "Handle real-time issues in sport environments.",
		level4_item1: "Cramp response",
		level4_item2: "Quick assessment",
		level4_item3: "Referral flow",
		level4_item4: "On-site decision making",
		level4_output: "Output: Confident on-site action"
	},
	why: {
		title: "Why this system works",
		statement: "Better outcomes come from better thinking, not more techniques.",
		item1: "Built from real scenarios",
		item2: "Hands-on first, theory second",
		item3: "Clear and structured progression",
		item4: "Designed for immediate application"
	},
	quality: {
		title: "Training with standards, not just techniques.",
		statement: "Every program includes evaluation, structured materials, and follow-up to ensure real application.",
		item1_title: "Pre & post assessment",
		item1_desc: "Evaluate knowledge and skills before and after training.",
		item2_title: "Practical evaluation",
		item2_desc: "Hands-on assessment using a clear scoring rubric.",
		item3_title: "Clear training materials",
		item3_desc: "Receive structured slides, protocols and checklists.",
		item4_title: "Follow-up session",
		item4_desc: "Q&A or review session to support real-world application."
	},
	deliverables: {
		title: "What your organization receives",
		item1: "Curriculum structure",
		item2: "Practical checklist",
		item3: "Assessment rubric",
		item4: "Attendance record",
		item5: "Completion certificate",
		item6: "Post-training report",
		item7: "Follow-up support",
		item8: "Co-branded certificate (optional)"
	},
	assessment_certification: {
		title: "Assessment & Certification",
		item1: "Formative & Summative assessment",
		item2: "Practical hands-on evaluation",
		item3: "Digital & Physical certificate",
		item4: "Ongoing support community",
		view_certificate: "Click to view full certificate"
	},
	gallery_caption: "Road2Rehab Hands-on Coaching & Practice Workshop",
	cta: {
		title: "Build a stronger, more consistent team.",
		cta1: "Discuss Training Plan",
		cta2: "Talk to Team",
		sub: "We'll help you design the right training structure."
	},
	floating: {
		text: "Planning training for your team?",
		cta1: "Talk to Team",
		cta2: "Request Program"
	}
};
var business_cta_bar$1 = {
	title: "Planning a program for your team?",
	subtitle: "We're here to help you get started.",
	talk: "Talk to Our Team",
	proposal: "Request a Proposal"
};
var sharing_hub$1 = {
	nav: "Sharing Hub",
	hero_title: "What we're learning, building, and sharing",
	hero_subtitle: "Movement insights, recovery education, team stories, company updates, and event highlights — all in one place.",
	featured: "Featured",
	latest_posts: "Latest Knowledge",
	search_placeholder: "Search by keyword...",
	categories: {
		all: "All",
		articles: "Knowledge",
		company_updates: "Company Updates",
		team_stories: "Team Stories",
		events: "Events & Highlights"
	},
	read_more: "Read More",
	featured_posts: {
		f1_category: "KNOWLEDGE",
		f1_title: "What Is Sport Recovery and Why It Matters for Everyone Who Moves",
		f1_desc: "Sport recovery is more than rest. It's a structured process that helps your body adapt, reduce pain, and perform better.",
		f2_category: "COMPANY UPDATES",
		f2_title: "A New Chapter for Stretch.vn",
		f2_desc: "Exciting updates on our recent developments and what's ahead.",
		f3_category: "TEAM STORIES",
		f3_title: "Meet Huy: Driven by Curiosity, Guided by Purpose",
		f3_desc: "Get to know the people behind your progress.",
		f4_category: "EVENTS & HIGHLIGHTS",
		f4_title: "Recovery Day with VN Runners Club",
		f4_desc: "A day of movement, recovery, and community in action."
	},
	posts: {
		p1_category: "KNOWLEDGE",
		p1_title: "Foam Rolling 101: Simple Habits for Better Recovery",
		p1_desc: "How this accessible tool can reduce tension and support your daily performance.",
		p2_category: "COMPANY UPDATES",
		p2_title: "Our New Space in Thao Dien is Now Open",
		p2_desc: "A space designed for focused care, better movement, and meaningful connections.",
		p3_category: "TEAM STORIES",
		p3_title: "Behind the Session: The Power of Listening",
		p3_desc: "Why understanding your story is the key to effective treatment and training.",
		p4_category: "EVENTS & HIGHLIGHTS",
		p4_title: "Movement Workshop at RMIT Vietnam",
		p4_desc: "Great energy and thoughtful questions from an engaged community.",
		p5_category: "KNOWLEDGE",
		p5_title: "Hip Mobility: The Key to Stronger, Pain-Free Movement",
		p5_desc: "Simple assessments and exercises to improve how you move.",
		p6_category: "COMPANY UPDATES",
		p6_title: "Growing the Team, Elevating Care",
		p6_desc: "Welcoming new therapists and coaches to the Stretch.vn family.",
		p7_category: "TEAM STORIES",
		p7_title: "From Setbacks to Strength: Kevin's Journey",
		p7_desc: "How consistency, support, and the right plan made the difference.",
		p8_category: "EVENTS & HIGHLIGHTS",
		p8_title: "Sunrise Stretch & Recover at Sala Park",
		p8_desc: "A refreshing morning of movement and connection."
	},
	why_title: "Why we share",
	why_desc: "We believe better movement comes from better information and real experiences. Our goal is to build trust through transparency, share practical insights you can use, and grow a community that moves, recovers, and lives better — together.",
	why_f1_title: "Evidence-informed insights",
	why_f1_desc: "Knowledge you can trust and apply.",
	why_f2_title: "Real stories from real people",
	why_f2_desc: "Experiences that inspire and connect.",
	why_f3_title: "Practical takeaways for everyday life",
	why_f3_desc: "Simple steps for lasting impact.",
	cta_title: "Explore more. Move better. Live better.",
	cta_subtitle: "Discover our services, book a session, or follow us for the latest updates.",
	cta_explore: "Explore Our Services",
	cta_book: "Book a Session",
	cta_follow: "Follow Updates",
	detail: {
		back_to_hub: "Back to Sharing Hub",
		on_this_page: "On this page",
		categories: "Categories",
		tags: "Tags",
		related_posts: "You may also want to read",
		view_all_articles: "View all articles",
		by: "By",
		min_read: "min read",
		sidebar_cta_title: "Looking for support with your recovery or performance?",
		sidebar_cta_desc: "Our team is here to help you move better and feel your best.",
		sidebar_cta_btn: "Book a Session",
		sidebar_business_title: "Business Solution for Your Organization",
		sidebar_business_desc: "Professional recovery solutions for teams, events & workplaces.",
		sidebar_business_btn: "Explore for Business",
		what_is_sport_recovery: {
			title: "What Is Sport Recovery and Why It Matters for Everyone Who Moves",
			excerpt: "Sport recovery is more than rest. It's a structured process that helps your body adapt, reduce pain, and perform better. Here's what you need to know.",
			intro: {
				title: "What is sport recovery?",
				text: "Sport recovery is the intentional process of helping your body return to balance after physical stress. It supports muscle tissue repair, reduces soreness, and prepares you for your next training or competition.",
				quote: "Recovery is where progress happens. Without it, performance doesn't last."
			},
			why: {
				title: "Why it matters",
				text: "Good recovery helps you:",
				b1: "Reduce muscle soreness and fatigue",
				b2: "Lower risk of injury",
				b3: "Improve mobility and movement quality",
				b4: "Perform at your best, more consistently"
			},
			components: {
				title: "The key components of sport recovery",
				c1: {
					title: "Movement Restoration",
					desc: "Improve mobility and restore range of motion"
				},
				c2: {
					title: "Soft Tissue Work",
					desc: "Release tension and reduce muscle tightness"
				},
				c3: {
					title: "Recovery Modalities",
					desc: "Use the right tools to speed up recovery"
				},
				c4: {
					title: "Hydration & Nutrition",
					desc: "Fuel your body to repair and perform"
				},
				c5: {
					title: "Sleep & Rest",
					desc: "Quality rest is where your body adapts and grows"
				}
			},
			who: {
				title: "Who can benefit?",
				text: "Anyone who moves. From athletes to weekend warriors to people with desk jobs, sport recovery can help you move better, feel better, and stay consistent."
			},
			start: {
				title: "How to get started",
				text: "Start with understanding your body. Listen to the signs. Then, build a simple recovery routine that works for you. Need help? Our team is here to support you."
			},
			takeaways: {
				title: "Key takeaways",
				text: "Recovery is a journey, not a destination. Listen to your body, stay consistent, and don't hesitate to seek professional guidance when needed."
			}
		}
	}
};
const locale_en_46json_250de9dd = {
	nav: nav$1,
	hero: hero$1,
	products: products$2,
	bookingSection: bookingSection$1,
	testimonials: testimonials$1,
	faq: faq$1,
	footer: footer$1,
	booking: booking$1,
	booking_v2: booking_v2$1,
	trust_bar: trust_bar$1,
	services: services$1,
	where_we_work: where_we_work$1,
	why_stretch: why_stretch$1,
	cta_bar: cta_bar$1,
	assurance: assurance$1,
	about: about$1,
	partners: partners$1,
	contact_widget: contact_widget$1,
	individual_page: individual_page$1,
	business_page: business_page$1,
	wellness_page: wellness_page$1,
	event_page: event_page$1,
	education_page: education_page$1,
	business_cta_bar: business_cta_bar$1,
	sharing_hub: sharing_hub$1
};

var nav = {
	home: "Trang chủ",
	programs: "Chương trình",
	method: "Phương pháp",
	studios: "Chi nhánh",
	membership: "Thẻ thành viên",
	individual: "Cá nhân",
	business: "Doanh nghiệp",
	business_recovery: "Giải pháp phục hồi Sức khỏe",
	business_training: "Chương trình đào tạo",
	business_wellness: "Giải pháp sức khỏe DN",
	blog: "Blog",
	about: "Về chúng tôi",
	freeTrial: "Dùng thử miễn phí",
	bookSession: "Đặt lịch"
};
var hero = {
	eyebrow: "Phục hồi vận động chuyên nghiệp",
	title1: "Vận động tốt hơn.",
	title2: "Phục hồi",
	titleHighlight: "thông minh hơn.",
	subtitle: "Hỗ trợ phục hồi & vận động cá nhân hóa — tại cơ sở của chúng tôi, tại nhà, hoặc tại sự kiện của bạn.",
	usp1_title: "Không xâm lấn",
	usp1_sub: "an toàn & hiệu quả",
	usp2_title: "Cá nhân hóa",
	usp2_sub: "cho cơ thể bạn",
	usp3_title: "Có thể đo lường",
	usp3_sub: "kết quả lâu dài",
	bookSession: "Đặt lịch ngay",
	learnMore: "Khám phá dịch vụ"
};
var products$1 = {
	eyebrow: "Chương trình",
	title: "Chương Trình Của Chúng Tôi",
	subtitle: "Khám phá các buổi phục hồi được thiết kế cho mục tiêu của bạn — từ căn chỉnh nền tảng đến rèn luyện hệ thần kinh tinh hoa.",
	viewAll: "Xem tất cả chương trình",
	allPrograms: "TẤT CẢ",
	allProgramsHighlight: "CHƯƠNG TRÌNH",
	allProgramsSubtitle: "Chọn buổi trị liệu phù hợp với mục tiêu của bạn. Từ cân bằng nền tảng đến rèn luyện hiệu suất cao.",
	mostPopular: "Phổ biến nhất"
};
var bookingSection = {
	eyebrow: "Đặt Lịch Ngay",
	title: "Sẵn Sàng Thay Đổi?",
	subtitle: "Ba bước đơn giản để đạt cấp độ phục hồi tiếp theo. Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng.",
	step1: "Bước 01",
	step1Title: "Chọn Chương Trình",
	step1Desc: "Lựa chọn loại dịch vụ phù hợp với nhu cầu",
	step2: "Bước 02",
	step2Title: "Chọn Thời Gian",
	step2Desc: "Chọn chuyên gia, ngày và giờ",
	step3: "Bước 03",
	step3Title: "Xác Nhận",
	step3Desc: "Nhập thông tin và nhận xác nhận ngay lập tức"
};
var testimonials = {
	eyebrow: "Nhận xét",
	title: "Khách Hàng Nói Gì",
	subtitle: "Sự thay đổi của bạn là thành tựu lớn nhất của chúng tôi.",
	t1_text: "Electric Peak đã hoàn toàn thay đổi thói quen phục hồi của tôi. Việc rèn luyện hệ thần kinh không giống với bất kỳ điều gì tôi từng trải qua. Thực sự là một bước ngoặt.",
	t1_role: "Vận động viên CrossFit",
	t2_text: "Sau nhiều năm bị ảnh hưởng bởi tư thế ngồi làm việc, một buổi trị liệu Zen Flow đã khiến tôi cảm thấy trẻ lại 10 tuổi. Các chuyên gia ở đây thực sự hiểu về cơ thể.",
	t2_role: "Kỹ sư phần mềm",
	t3_text: "Soul Recovery là trải nghiệm phục hồi tốt nhất mà tôi từng có. Sự tái lập hệ thần kinh đối giao cảm khiến tôi ở trạng thái hạnh phúc trọn vẹn trong nhiều ngày.",
	t3_role: "Hướng dẫn viên Yoga"
};
var faq = {
	eyebrow: "Hỏi Đáp",
	title: "Câu Hỏi Thường Gặp",
	subtitle: "Giải đáp nhanh cho các câu hỏi phổ biến về chương trình và dịch vụ của chúng tôi.",
	cantFind: "Không tìm thấy câu trả lời? Hãy liên hệ với chúng tôi!",
	sendQuestion: "Gửi câu hỏi",
	email: "Admin{'@'}stretch.vn",
	q1: "Làm thế nào để tôi đặt lịch?",
	a1: "Bạn có thể đặt trực tuyến ngay trên trang web bằng cách nhấp vào \"Đặt Lịch\", chọn chương trình, chuyên gia và thời gian. Hoặc gọi trực tiếp cho chúng tôi qua (028) 1234 5678.",
	q2: "Tôi có thể hủy hoặc dời lịch không?",
	a2: "Có, bạn có thể hủy hoặc dời lịch miễn phí tối đa 24 giờ trước buổi hẹn. Sau thời gian đó, phí hủy 30% sẽ được áp dụng. Vui lòng liên hệ hotline để được hỗ trợ.",
	q3: "Mỗi buổi trị liệu kéo dài bao lâu?",
	a3: "Các buổi kéo dài từ 45 đến 120 phút tùy thuộc vào chương trình. Thời lượng chính xác được liệt kê trong mô tả từng chương trình. Chúng tôi khuyên bạn nên đến sớm 10 phút.",
	q4: "Tôi có cần chuẩn bị gì không?",
	a4: "Không cần chuẩn bị đặc biệt. Chúng tôi cung cấp áo choàng, khăn tắm và tất cả sản phẩm cần thiết. Chỉ cần mang theo một tinh thần thư giãn! Nếu bạn có dị ứng hoặc tình trạng y tế, vui lòng báo trước.",
	q5: "Chấp nhận các phương thức thanh toán nào?",
	a5: "Chúng tôi chấp nhận tiền mặt, chuyển khoản ngân hàng, Visa/Mastercard, Apple Pay, Google Pay và các ví điện tử chính. Thanh toán được thu sau khi buổi trị liệu kết thúc."
};
var footer = {
	desc: "Hỗ trợ phục hồi vận động & phục hồi chức năng được xây dựng dựa trên cách bạn vận động và sống.",
	individual: "Cho Cá Nhân",
	business: "Cho Doanh Nghiệp",
	company: "Công ty",
	about: "Về chúng tôi",
	blog: "Blog",
	contact: "Liên hệ",
	connect: "Kết nối",
	poweredBy: "CUNG CẤP BỞI",
	rights: "Bản quyền đã được bảo lưu.",
	website: "Website",
	email: "Email",
	copyright: "© {year} Stretch.vn bởi Monaco Healthcare. {rights}",
	address: "493 Điện Biên Phủ, Phường Bàn Cờ, TP.HCM",
	view_map: "Xem trên Google Maps",
	opening_hours: "Thời gian mở cửa",
	hours_weekday: "Thứ 2 – Thứ 7: 8:00 – 18:00",
	hours_last_booking: "Last booking: 17:00",
	hours_sunday: "Chủ Nhật: ưu tiên khách đã đặt lịch hẹn trước"
};
var booking = {
	heroTitle1: "ĐẶT LỊCH",
	heroTitleHighlight: "CỦA BẠN",
	stepService: "Dịch vụ",
	stepPractitioner: "Thời gian",
	stepInfo: "Thông tin",
	selectPractitioner: "Lựa chọn Chuyên Gia",
	anyPractitioner: "Chuyên gia bất kỳ",
	backToServices: "Quay lại chọn dịch vụ",
	noSlots: "Không có khung giờ trống trong ngày này. Vui lòng thử ngày khác.",
	"continue": "Tiếp tục",
	yourInfo: "Thông tin của bạn",
	firstName: "Tên",
	lastName: "Họ",
	email: "Địa chỉ Email",
	phone: "Số điện thoại",
	note: "Yêu cầu đặc biệt hoặc lưu ý y tế...",
	confirmSession: "Xác nhận đặt lịch",
	backToSchedule: "Quay lại chọn giờ",
	processing: "Đang xử lý...",
	errorName: "Vui lòng nhập tên của bạn",
	errorPhone: "Vui lòng nhập số điện thoại hợp lệ",
	successTitle: "ĐẶT LỊCH THÀNH CÔNG 🎉",
	successDesc: "Mọi thứ đã sẵn sàng. Chuẩn bị để thăng hoa.",
	successEmail: "Email xác nhận sẽ được gửi trong giây lát.",
	home: "Trang Chủ",
	bookAnother: "Đặt Thêm Lịch",
	at: "lúc"
};
var booking_v2 = {
	landing: {
		eyebrow: "ĐẶT LỊCH PHÙ HỢP VỚI NHU CẦU CỦA BẠN",
		title: "Chăm sóc đúng cách. {br} Cơ thể phục hồi hiệu quả.",
		individual: "Cá nhân",
		individual_desc: "Đặt lịch cho bản thân",
		business: "Doanh nghiệp",
		business_desc: "Dịch vụ cho đội nhóm hoặc sự kiện",
		not_sure: "Không chắc chắn?",
		not_sure_desc: "Trao đổi với đội ngũ để được tư vấn",
		start: "Bắt đầu",
		chat_zalo: "Nhắn Zalo",
		summary_title: "Một buổi trị liệu thường bao gồm",
		summary_assess: "Đánh giá",
		summary_assess_desc: "Hiểu vấn đề và nhu cầu của bạn",
		summary_treat: "Trị liệu",
		summary_treat_desc: "Kỹ thuật phù hợp giúp giảm đau và cải thiện vận động",
		summary_guide: "Hướng dẫn",
		summary_guide_desc: "Bài tập và lời khuyên để duy trì hiệu quả lâu dài"
	},
	individual: {
		step1_title: "Bạn cần hỗ trợ điều gì?",
		step1_subtitle: "Chọn vấn đề gần nhất với bạn.",
		issue_recovery: "Phục hồi sau vận động",
		issue_recovery_desc: "Hỗ trợ phục hồi sau tập luyện hoặc thi đấu",
		issue_pain: "Đau nhức / chấn thương",
		issue_pain_desc: "Giảm đau, phục hồi sau chấn thương hoặc phẫu thuật",
		issue_stiffness: "Căng cứng kéo dài",
		issue_stiffness_desc: "Cải thiện tình trạng căng cứng, giảm linh hoạt",
		issue_not_sure: "Không chắc chắn",
		issue_not_sure_desc: "Tư vấn để chọn giải pháp phù hợp nhất",
		step2_title: "Bạn muốn trị liệu ở đâu và khi nào?",
		step2_subtitle: "Chọn địa điểm và thời gian phù hợp.",
		loc_home: "Tại nhà riêng",
		loc_home_desc: "Chúng tôi sẽ đến tận nơi",
		loc_clinic: "Tại cơ sở của chúng tôi",
		loc_clinic_desc: "Đến phòng trị liệu của Stretch",
		loc_consult: "Tư vấn thêm",
		loc_consult_desc: "Chưa quyết định",
		date_label: "Ngày mong muốn",
		time_label: "Giờ mong muốn",
		step3_title: "Thông tin liên hệ",
		step3_subtitle: "Để chúng tôi xác nhận và chuẩn bị buổi trị liệu tốt nhất cho bạn.",
		full_name: "Họ và tên",
		phone_zalo: "Số điện thoại / Zalo",
		email_optional: "Email (tùy chọn)",
		contact_pref: "Cách liên hệ ưu tiên",
		pref_call: "Gọi điện",
		pref_zalo: "Zalo",
		pref_email: "Email",
		note_optional: "Ghi chú thêm (tùy chọn)",
		note_placeholder: "Chia sẻ thêm về tình trạng, chấn thương hoặc điều bạn muốn cải thiện...",
		privacy_consent: "Tôi đồng ý với Chính sách bảo mật và Điều khoản sử dụng của Stretch.vn",
		confirm_booking: "Xác nhận đặt lịch"
	},
	business: {
		step1_title: "Bạn đang lên kế hoạch gì?",
		step1_subtitle: "Chọn loại hình hỗ trợ bạn cần.",
		plan_recovery: "Phục hồi sự kiện",
		plan_recovery_desc: "Hỗ trợ phục hồi cho giải chạy, giải đấu, workshop hoặc thi đấu",
		plan_wellness: "Sức khỏe doanh nghiệp",
		plan_wellness_desc: "Chăm sóc sức khỏe cho đội ngũ của bạn, tại văn phòng hoặc bên ngoài",
		plan_education: "Giáo dục & Đào tạo",
		plan_education_desc: "Đào tạo thực hành hoặc workshop cho đội ngũ của bạn",
		plan_not_sure: "Chưa chắc chắn",
		plan_not_sure_desc: "Trao đổi với đội ngũ của chúng tôi trước",
		step2_title: "Chia sẻ về dự án của bạn",
		step2_subtitle: "Điều này giúp chúng tôi hiểu rõ nhu cầu của bạn.",
		participants: "Số lượng người tham gia",
		timeline: "Ngày / Thời gian dự kiến",
		location: "Địa điểm",
		setting: "Môi trường",
		setting_indoor: "Trong nhà",
		setting_outdoor: "Ngoài trời",
		anything_else: "Ghi chú thêm (Tùy chọn)",
		step3_title: "Thông tin liên hệ của bạn",
		step3_subtitle: "Chúng tôi sẽ sử dụng thông tin này để gửi đề xuất cho bạn.",
		full_name: "Họ và tên",
		role: "Chức vụ / Vị trí",
		phone_zalo: "Số điện thoại / Zalo",
		email: "Email",
		consent: "Tôi đồng ý để Stretch liên hệ tư vấn",
		send_request: "Gửi yêu cầu",
		summary_sidebar: "Yêu cầu doanh nghiệp",
		summary_plan: "Gói dịch vụ",
		summary_timeline: "Dự kiến",
		summary_participants: "Số lượng khách",
		summary_people: "người",
		summary_location: "Địa điểm",
		summary_empty: "Chưa chọn gói — hãy bấm vào gói dịch vụ bên trên"
	},
	success: {
		thanks: "Cảm ơn bạn!",
		desc: "Chúng tôi đã nhận được yêu cầu của bạn.",
		desc_business: "Đội ngũ của chúng tôi sẽ liên hệ sớm nhất để xác nhận yêu cầu và tư vấn giải pháp phù hợp nhất cho bạn.",
		contact_soon: "Đội ngũ sẽ liên hệ sớm nhất để xác nhận thông tin và chuẩn bị buổi trị liệu phù hợp nhất dành cho bạn.",
		all_set: "Mọi thứ đã sẵn sàng!",
		summary_title: "Thông tin bạn đã cung cấp",
		summary_issue: "Vấn đề",
		summary_loc: "Địa điểm",
		summary_time: "Thời gian",
		summary_contact: "Liên hệ",
		chat_zalo: "Nhắn Zalo ngay",
		call_stretch: "Gọi Stretch",
		back_home: "Về trang chủ"
	},
	common: {
		step: "Bước",
		next: "Tiếp tục",
		back: "Quay lại"
	}
};
var trust_bar = {
	hours_count: "2,400+",
	hours_label: "giờ trị liệu",
	events_count: "35+",
	events_label: "sự kiện phục hồi",
	partners_count: "20+",
	partners_label: "đối tác tin tưởng",
	powered_by: "Powered by"
};
var services = {
	title: "Dịch Vụ Của Chúng Tôi",
	individual_label: "Cá Nhân",
	individual_title: "Phục hồi cá nhân đáp ứng mọi nhu cầu của bạn.",
	individual_desc: "Cho dù bạn đang phục hồi sau chấn thương, quản lý tình trạng căng cơ định kỳ hay muốn vận động hiệu quả hơn — Stretch mang đến sự hỗ trợ chuyên nghiệp cho bạn.",
	sport_recovery: "Phục hồi Thể thao",
	rehabilitation: "Phục hồi Chức năng",
	targeted_relief: "Hỗ trợ giảm căng mỏi theo vùng",
	explore_individual: "Khám phá Dịch vụ Cá nhân",
	business_label: "Doanh nghiệp",
	business_title: "Hạ tầng phục hồi cho các tổ chức luôn vận động.",
	business_desc: "Từ các trạm phục hồi tại giải đấu đến chương trình chăm sóc sức khỏe doanh nghiệp quanh năm — chúng tôi thiết kế, cung cấp nhân sự và triển khai các chương trình xoay quanh con người của bạn.",
	event_solutions: "Giải pháp phục hồi SK",
	education_training: "Chương trình đào tạo",
	corporate_wellness: "Giải pháp sức khỏe DN",
	explore_business: "Khám phá Dịch vụ Doanh nghiệp"
};
var where_we_work = {
	title: "Where We Work",
	home_title: "Tại Nhà",
	home_desc: "Chăm sóc tiện lợi, riêng tư và hiệu quả ngay tại không gian của bạn.",
	clinic_title: "Tại cơ sở của chúng tôi",
	clinic_desc: "Cơ sở vật chất đạt tiêu chuẩn chức năng kết hợp với đội ngũ chuyên gia tận tâm.",
	event_title: "Tại Sự Kiện",
	event_desc: "Sẵn sàng cung cấp giải pháp phục hồi cho mọi quy mô hoạt động và sự kiện.",
	explore_location: "Khám phá địa điểm"
};
var why_stretch = {
	eyebrow: "Tại sao chọn Stretch",
	titleLine1: "Chuyên môn bạn có thể cảm nhận.",
	titleLine2: "Cấu trúc bạn có thể tin tưởng.",
	desc: "Chúng tôi không phải là spa, không phải phòng khám, không phải phòng gym. Stretch là một hệ thống hỗ trợ vận động và phục hồi — được xây dựng dựa trên kết quả, được thực hiện bởi các chuyên gia có trình độ.",
	powered_by: "Powered by",
	monaco: "Monaco",
	monaco_desc: "Hạ tầng lâm sàng đứng sau Stretch đến từ Monaco — nền tảng sức khỏe vận động đã được khẳng định tại Việt Nam.",
	not_spa_title: "Không phải spa.",
	not_spa_desc: "Mỗi buổi trị liệu đều có cơ sở lâm sàng và kết quả vận động. Không đặt nặng yếu tố không gian. Không nến thơm.",
	not_clinic_title: "Không phải phòng khám.",
	not_clinic_desc: "Không phòng chờ vô trùng hay quy trình giấy tờ nặng nề. Chúng tôi làm việc tại nơi bạn cần — nhà, phòng khám, hoặc sự kiện của bạn.",
	not_gym_title: "Không phải phòng gym.",
	not_gym_desc: "Chúng tôi không ở đây để huấn luyện bạn. Chúng tôi ở đây để đảm bảo cơ thể bạn có thể bắt kịp với mọi hoạt động khác mà bạn làm.",
	system_title: "Hệ thống phục hồi có cấu trúc.",
	system_desc: "Hỗ trợ cấp độ lâm sàng với sự rõ ràng trong vận hành. Từ đánh giá đến kết quả — được xây dựng dựa trên cách bạn thực sự vận động và sống."
};
var cta_bar = {
	title: "Sẵn sàng vận động tốt hơn và cảm thấy nhẹ hơn?",
	subtitle: "Đặt một buổi trị liệu hoặc liên hệ — chúng tôi luôn sẵn sàng hỗ trợ bạn.",
	get_advice: "Nhận tư vấn"
};
var assurance = {
	secureTitle: "Thanh Toán An Toàn",
	secureDesc: "Mã hóa toàn diện mọi giao dịch",
	expertTitle: "Chuyên Gia Đạt Chuẩn",
	expertDesc: "Nhà trị liệu thần kinh cơ được cấp phép",
	rapidTitle: "Hiệu Quả Nhanh Chóng",
	rapidDesc: "Cảm nhận sự khác biệt chỉ trong một buổi"
};
var about = {
	eyebrow: "Triết lý của chúng tôi",
	title1: "PHƯƠNG PHÁP",
	titleHighlight: "LUẬN",
	subtitle: "Nơi khoa học cường độ cao gặp gỡ sự minh mẫn tinh thần. Chúng tôi tin rằng mọi cơ thể đều xứng đáng được thăng hoa.",
	storyEyebrow: "Câu Chuyện Của Chúng Tôi",
	storyTitle: "Hơn 8 Năm Xuất Sắc",
	storyP1: "Thành lập năm 2018, Electric Zen bắt đầu với một tầm nhìn đơn giản: mang dịch vụ phục hồi thần kinh cơ ưu tú đến với mọi người, không chỉ riêng vận động viên chuyên nghiệp.",
	storyP2: "Trong hơn 8 năm, chúng tôi đã phục vụ hơn 2,000 khách hàng với đội ngũ chuyên gia được cấp chứng chỉ quốc tế và công nghệ tiên tiến.",
	val1Title: "Khoa học",
	val1Desc: "Kỹ thuật và giao thức thần kinh cơ dựa trên bằng chứng khoa học.",
	val2Title: "Tinh thần",
	val2Desc: "Các phương pháp tập trung minh mẫn, tích hợp thân - tâm.",
	val3Title: "Cường độ",
	val3Desc: "Điều hòa hiệu suất cao mang lại kết quả tinh hoa.",
	ctaTitle: "Sẵn Sàng Thăng Hoa?",
	ctaDesc: "Đặt lịch buổi đầu tiên ngay hôm nay và cảm nhận sự khác biệt."
};
var partners = {
	eyebrow: "ĐỐI TÁC & CỘNG ĐỒNG",
	title: "Đối tác & cộng đồng đã đồng hành",
	subtitle: "Stretch.vn đã triển khai phục hồi, workshop và hoạt động cộng đồng cùng các đối tác trong lĩnh vực thể thao, chăm sóc sức khỏe và doanh nghiệp."
};
var contact_widget = {
	zalo: "Nhắn Zalo",
	messenger: "Nhắn Messenger",
	whatsapp: "Nhắn WhatsApp",
	phone: "Gọi Stretch",
	phone_number: "0938 713 498"
};
var individual_page = {
	seo_title: "Dịch Vụ Cá Nhân — Stretch.vn",
	seo_desc: "Hỗ trợ phục hồi & vận động cá nhân hóa cho bạn.",
	hero: {
		heading: "Di chuyển tốt hơn. Phục hồi thông minh hơn.",
		subtext: "Hỗ trợ phù hợp với chính cơ thể bạn.",
		cta1: "Đặt lịch ngay",
		cta2: "Nhắn để được tư vấn"
	},
	who_is_this_for: {
		title: "Phù hợp nếu bạn:",
		item1: "Tập luyện thường xuyên nhưng cơ thể không theo kịp",
		item2: "Hay bị căng cứng, khó chịu lặp lại",
		item3: "Đang phục hồi sau chấn thương",
		item4: "Muốn vận động tốt hơn mà không cần chịu đau"
	},
	customer_carousel: {
		title: "Chúng tôi đồng hành cùng",
		subtitle: "Mỗi người khác nhau. Mỗi cơ thể khác nhau. Cùng một mục tiêu: vận động và cảm thấy tốt hơn.",
		card1: "Người chạy bộ",
		card1_desc: "Tập luyện cự ly hoặc tốc độ",
		card2: "Người chơi thể thao vợt",
		card2_desc: "Pickleball, tennis, cầu lông",
		card3: "Nhân viên văn phòng",
		card3_desc: "Ngồi lâu, căng thẳng cổ & lưng",
		card4: "Người năng động",
		card4_desc: "Gym, yoga, hoặc tập luyện đều đặn",
		card5: "Phục hồi chấn thương",
		card5_desc: "Hỗ trợ sau chấn thương hoặc phẫu thuật",
		card6: "Người lớn tuổi",
		card6_desc: "Duy trì sự linh hoạt và thoải mái"
	},
	situation: {
		title: "Tìm dịch vụ cho riêng bạn",
		card1: "Phục hồi sau vận động",
		desc1: "Bạn đã tập nặng — giờ là lúc cơ thể cần phục hồi.",
		card2: "Đau hoặc chấn thương",
		desc2: "Có điều gì đó đang hạn chế vận động của bạn.",
		card3: "Căng cứng kéo dài",
		desc3: "Không phải chấn thương, nhưng cứ lặp lại.",
		card4: "Chưa chắc chắn",
		desc4: "Chúng tôi sẽ giúp bạn tìm ra giải pháp."
	},
	experiencing: {
		title: "Bạn có thể đang gặp:",
		item1: "Mỏi chân sau khi chạy hoặc thi đấu",
		item2: "Đau vai, lưng, hoặc đầu gối",
		item3: "Cứng cổ hoặc căng hông",
		item4: "Giảm khả năng vận động hoặc biên độ",
		item5: "Mệt mỏi ảnh hưởng đến hiệu suất",
		item6: "Đau hoặc căng cứng lặp lại"
	},
	how_supports: {
		title: "Stretch hỗ trợ bạn như thế nào",
		line: "Không chỉ trị liệu — giúp cơ thể vận động tốt hơn.",
		item1: "Hiểu cách bạn vận động",
		item2: "Hỗ trợ đúng vùng cần thiết",
		item3: "Giúp vận động hiệu quả hơn"
	},
	what_to_expect: {
		title: "Những gì chờ đón bạn",
		line: "Một buổi trị liệu điển hình bao gồm:",
		item1: "Đánh giá vận động",
		item2: "Trị liệu tập trung",
		item3: "Hướng dẫn đơn giản mang theo",
		duration: "Thời lượng: 45–60 phút"
	},
	final_cta: {
		title: "Chưa biết bắt đầu từ đâu?",
		cta1: "Đặt lịch",
		cta2: "Nhắn tư vấn"
	},
	floating_cta: {
		text: "Cần hỗ trợ chọn giải pháp?",
		cta1: "Đặt lịch",
		cta2: "Nhắn tư vấn"
	},
	trust_features: {
		title1: "Đội ngũ chuyên môn",
		desc1: "Chuyên viên đào tạo bài bản",
		title2: "Thiết kế cá nhân hóa",
		desc2: "Phù hợp riêng với nhu cầu",
		title3: "Lựa chọn linh hoạt",
		desc3: "Tại phòng khám hoặc tại nhà",
		title4: "Vận động viên tin tưởng",
		desc4: "và người năng động lựa chọn"
	}
};
var business_page = {
	hero: {
		label: "DÀNH CHO DOANH NGHIỆP",
		heading: "Con người tốt hơn. Hiệu suất tốt hơn.",
		subtext: "Chúng tôi đồng hành cùng doanh nghiệp để cải thiện sức khỏe, hỗ trợ hiệu suất và xây dựng đội ngũ mạnh hơn thông qua vận động.",
		cta1: "Trao đổi với đội ngũ",
		cta2: "Xem giải pháp"
	},
	solutions: {
		label: "3 GIẢI PHÁP CHÍNH",
		heading: "Giải pháp linh hoạt cho từng nhu cầu doanh nghiệp.",
		card1: {
			title: "Chăm sóc doanh nghiệp",
			desc: "Đầu tư vào con người. Xây dựng môi trường làm việc khỏe mạnh và hiệu quả hơn.",
			item1: "Buổi giãn cơ & phục hồi tại chỗ",
			item2: "Chương trình wellness cho nhân sự",
			item3: "Workshop & giáo dục vận động",
			item4: "Hợp tác dài hạn",
			cta: "Khám phá Corporate Wellness"
		},
		card2: {
			title: "Sự kiện & khu phục hồi",
			desc: "Hỗ trợ vận động viên và người tham gia. Tăng hiệu suất và trải nghiệm.",
			item1: "Khu phục hồi tại sự kiện",
			item2: "Giãn cơ và vận động tại chỗ",
			item3: "Hỗ trợ nhanh & xử lý chấn thương",
			item4: "Giải pháp tùy chỉnh cho sự kiện thể thao",
			cta: "Khám phá giải pháp sự kiện"
		},
		card3: {
			title: "Đào tạo & huấn luyện",
			desc: "Đào tạo đội ngũ với kiến thức, kỹ năng và thực hành đúng.",
			item1: "Lượng giá & vận động cơ bản",
			item2: "Các khóa giãn cơ & linh hoạt",
			item3: "Phục hồi thể thao & phản ứng nhanh",
			item4: "Chương trình đào tạo tùy chỉnh",
			cta: "Khám phá chương trình đào tạo"
		}
	},
	why: {
		label: "TẠI SAO HỢP TÁC VỚI STRETCH?",
		heading: "Hơn cả dịch vụ. Là đối tác lâu dài.",
		item1: {
			title: "Đội ngũ giàu kinh nghiệm",
			desc: "Trị liệu viên và huấn luyện viên chuyên nghiệp với kinh nghiệm thực tế."
		},
		item2: {
			title: "An toàn & Hiệu quả",
			desc: "Phương pháp tiếp cận dựa trên thực chứng với an toàn là ưu tiên hàng đầu của chúng tôi."
		},
		item3: {
			title: "Giải pháp tùy chỉnh",
			desc: "Chương trình được thiết kế riêng theo mục tiêu, nhân sự và đặc thù ngành."
		},
		item4: {
			title: "Hiệu quả đo lường",
			desc: "Theo dõi tiến độ và thấy rõ tác động đến sức khỏe toàn diện và hiệu suất."
		},
		item5: {
			title: "Đặt con người làm đầu",
			desc: "Chúng tôi chăm sóc con người của bạn tận tâm như chính bạn."
		}
	},
	trust: {
		label: "ĐỐI TÁC TIN CẬY",
		heading: "Được tin tưởng bởi các tổ chức coi trọng con người."
	},
	cta: {
		label: "TRAO ĐỔI VỚI CHÚNG TÔI",
		heading: "Sẵn sàng xây dựng đội ngũ khỏe mạnh và mạnh mẽ hơn?",
		sub: "Hãy cùng xây dựng giải pháp phù hợp cho doanh nghiệp của bạn.",
		cta1: "Trao đổi với team",
		cta2: "Yêu cầu đề xuất",
		bar_text: "Đang lập kế hoạch cho đội ngũ của bạn?",
		bar_sub: "Chúng tôi ở đây để giúp bạn bắt đầu."
	}
};
var wellness_page = {
	seo_title: "Chăm Sóc Doanh Nghiệp — Stretch.vn",
	seo_desc: "Chương trình wellness phù hợp với cách nhân sự thật sự làm việc và vận động.",
	hero: {
		label: "CHĂM SÓC DOANH NGHIỆP",
		heading: "Chương trình wellness mà nhân sự thật sự sử dụng.",
		subtext: "Đa số doanh nghiệp không thiếu chương trình wellness. Họ thiếu giải pháp phù hợp với cách nhân sự thật sự làm việc và vận động.",
		cta1: "Yêu cầu kế hoạch",
		cta2: "Trao đổi với team"
	},
	problem: {
		statement: "Phần lớn các vấn đề cơ thể tại nơi làm việc đều có thể dự đoán — nhưng thường bị bỏ qua.",
		neck: "Căng cổ vai gáy",
		back: "Cứng lưng dưới",
		movement: "Ít vận động trong ngày",
		fatigue: "Mệt mỏi lặp lại"
	},
	delivery: {
		title: "Chúng tôi triển khai",
		workshop_title: "Workshop vận động",
		workshop_desc: "Hướng dẫn vận động có thể áp dụng ngay trong công việc.",
		assessment_title: "Trạm đánh giá nhanh",
		assessment_desc: "Đánh giá nhanh giúp nhân sự hiểu cơ thể và vấn đề của mình.",
		recovery_title: "Ngày phục hồi tại doanh nghiệp",
		recovery_desc: "Trải nghiệm kết hợp đánh giá, trị liệu và hướng dẫn."
	},
	why: {
		title: "Tại sao hiệu quả",
		statement: "Wellness chỉ hiệu quả khi nhân sự thật sự sử dụng.",
		real: "Dựa trên căng mỏi thực tế",
		designed: "Triển khai trong môi trường thật",
		simple: "Đơn giản, dễ lặp lại",
		followup: "Có hướng dẫn và theo dõi"
	},
	cta: {
		title: "Xem chương trình này sẽ áp dụng cho đội ngũ bạn như thế nào",
		cta1: "Yêu cầu kế hoạch",
		cta2: "Trao đổi với team",
		sub: "Chúng tôi sẽ giúp bạn thiết kế giải pháp phù hợp."
	},
	floating: {
		text: "Đang lên kế hoạch wellness cho đội ngũ?",
		cta1: "Trao đổi",
		cta2: "Yêu cầu kế hoạch"
	}
};
var event_page = {
	seo_title: "Giải Pháp Phục Hồi Sự Kiện — Stretch.vn",
	seo_desc: "Hạ tầng phục hồi cho các sự kiện luôn vận động.",
	hero: {
		label: "GIẢI PHÁP PHỤC HỒI SỰ KIỆN",
		heading: "Hạ tầng phục hồi cho các sự kiện luôn vận động.",
		subtext: "Chúng tôi thiết kế và vận hành hỗ trợ phục hồi giúp các vận động viên liên tục di chuyển, giảm chấn thương và nâng tầm trải nghiệm sự kiện của bạn.",
		cta1: "Yêu cầu Đề xuất",
		cta2: "Trao đổi với Đội ngũ"
	},
	stats: {
		sessions: "2,400+",
		sessions_label: "buổi trị liệu",
		events: "35+",
		events_label: "sự kiện hỗ trợ",
		partners: "20+",
		partners_label: "đối tác & nhà tổ chức"
	},
	who_is_for: {
		label: "DÀNH CHO AI",
		heading: "Hỗ trợ phục hồi cho mọi loại hình sự kiện.",
		item1: {
			title: "Ban tổ chức giải đấu",
			desc: "Mang đến trải nghiệm tốt hơn cho vận động viên tại mỗi sự kiện."
		},
		item2: {
			title: "Sự kiện & giải chạy",
			desc: "Hỗ trợ người tham gia ở mọi cấp độ hiệu suất."
		},
		item3: {
			title: "Hoạt động thương hiệu",
			desc: "Nâng cao sự gắn kết với trải nghiệm phục hồi đầy ý nghĩa."
		},
		item4: {
			title: "Ngày hội thể thao doanh nghiệp",
			desc: "Chăm sóc nhân viên và củng cố sức khỏe đội ngũ."
		}
	},
	differences: {
		label: "ĐIỀU KHÁC BIỆT",
		heading: "Điều làm nên sự khác biệt trong hỗ trợ sự kiện",
		subtext: "Một khu vực phục hồi không chỉ giúp mọi người cảm thấy tốt hơn — mà còn phải duy trì sự mượt mà, giảm ùn tắc và thể hiện sự chuyên nghiệp của sự kiện.",
		card1: {
			title: "Khu Vực Phục Hồi Chuyên Nghiệp",
			desc: "Thiết lập sạch sẽ, mang đậm dấu ấn thương hiệu, sẵn sàng cho sự kiện và đại diện tốt cho hình ảnh của bạn."
		},
		card2: {
			title: "Luồng Di Chuyển Thông Minh",
			desc: "Quản lý luồng thông minh ngay cả trong không gian hẹp để giảm thời gian chờ và giữ vận động viên luôn di chuyển mượt mà."
		},
		card3: {
			title: "Hỗ Trợ Phản Ứng Nhanh",
			desc: "Đội ngũ phản ứng nhanh và cứu thương luôn túc trực để ngăn ngừa chấn thương hoặc xử lý chuột rút và nhu cầu khẩn cấp tại chỗ."
		},
		card4: {
			title: "Khởi Động Làm Nóng",
			desc: "Các hoạt động khởi động có hướng dẫn giúp tăng sự tham gia, năng lượng và sự hài lòng chung của sự kiện."
		},
		learn_more: "Tìm hiểu thêm"
	},
	where_works: {
		label: "SỰ KIỆN ÁP DỤNG",
		heading: "Nơi giải pháp này hiệu quả",
		subtext: "Chúng tôi hỗ trợ tất cả các loại hình sự kiện thể thao và cộng đồng.",
		item1: "Giải đấu Pickleball",
		item2: "Sự kiện chạy bộ",
		item3: "Giải đấu Tennis",
		item4: "Thể thao doanh nghiệp"
	},
	how_works: {
		label: "CÁCH THỨC HOẠT ĐỘNG",
		heading: "Quy trình triển khai mượt mà",
		subtext: "Các bước đơn giản. Thực thi mượt mà.",
		step1: {
			title: "1. Lên Kế Hoạch",
			desc: "Chúng tôi tìm hiểu mục tiêu sự kiện, không gian, đối tượng vận động viên và luồng di chuyển."
		},
		step2: {
			title: "2. Triển Khai",
			desc: "Chúng tôi thiết lập khu vực phục hồi và vận hành dịch vụ một cách trơn tru suốt sự kiện."
		}
	},
	trust: {
		label: "ĐỐI TÁC TIN CẬY",
		heading: "Được tin tưởng bởi các nhà tổ chức và thương hiệu"
	}
};
var education_page = {
	seo_title: "Đào Tạo & Huấn Luyện — Stretch.vn",
	seo_desc: "Đào tạo có cấu trúc dành cho đội ngũ muốn đạt sự đồng nhất, kỹ năng hands-on an toàn hơn và kết quả phục hồi tốt hơn.",
	hero: {
		label: "ĐÀO TẠO & HUẤN LUYỆN",
		heading: "Đào tạo đội ngũ không chỉ làm kỹ thuật mà còn hiểu vì sao.",
		subtext: "Đào tạo có cấu trúc dành cho đội ngũ muốn đạt sự đồng nhất, kỹ năng hands-on an toàn hơn và kết quả phục hồi tốt hơn.",
		cta1: "Trao đổi chương trình",
		cta2: "Trao đổi với team"
	},
	problem: {
		statement: "Nhiều đội ngũ biết kỹ thuật. Ít người hiểu khi nào và vì sao nên dùng.",
		bullet1: "Lệ thuộc vào protocol cố định",
		bullet2: "Thiếu tư duy đánh giá",
		bullet3: "Thực hành không đồng nhất",
		bullet4: "Thiếu kỹ năng giao tiếp với khách"
	},
	system: {
		title: "Hệ thống đào tạo có cấu trúc",
		level0: "LEVEL 0\nNỀN TẢNG",
		level0_title: "Lượng giá & Vận động cơ bản",
		level0_desc: "Hiểu cách quan sát và đánh giá chuyển động.",
		level0_item1: "Biên độ (ROM)",
		level0_item2: "Tư thế",
		level0_item3: "Sàng lọc vận động",
		level0_item4: "Thang điểm đau",
		level0_output: "Kết quả: Xác định các vấn đề vận động cơ bản",
		level1: "LEVEL 1\nKỸ NĂNG",
		level1_title: "Giãn cơ & Linh hoạt thân dưới",
		level1_desc: "Cải thiện linh hoạt và kiểm soát thân dưới.",
		level1_item1: "Linh hoạt hông",
		level1_item2: "Gân kheo",
		level1_item3: "Cơ tứ đầu",
		level1_item4: "Linh hoạt cổ chân",
		level1_output: "Kết quả: Áp dụng kỹ thuật thân dưới an toàn",
		level2: "LEVEL 2\nKỸ NĂNG",
		level2_title: "Giãn cơ & Linh hoạt thân trên",
		level2_desc: "Xử lý các vấn đề cổ, vai và lưng trên.",
		level2_item1: "Cổ & vai",
		level2_item2: "Linh hoạt ngực",
		level2_item3: "Cơ ngực & xô",
		level2_item4: "Biên độ vai",
		level2_output: "Kết quả: Thực hành hands-on đồng nhất",
		level3: "LEVEL 3\nHIỆU SUẤT",
		level3_title: "Giãn cơ Thể thao",
		level3_desc: "Áp dụng giãn cơ theo nhu cầu môn thể thao.",
		level3_item1: "Khởi động",
		level3_item2: "Phục hồi",
		level3_item3: "Linh hoạt chuyên sâu",
		level3_item4: "Chuẩn bị thi đấu",
		level3_output: "Kết quả: Dùng giãn cơ để tăng hiệu suất",
		level4: "LEVEL 4\nSỰ KIỆN",
		level4_title: "Phản ứng nhanh Thể thao",
		level4_desc: "Xử lý các vấn đề thực tế trong môi trường sự kiện.",
		level4_item1: "Xử lý chuột rút",
		level4_item2: "Đánh giá nhanh",
		level4_item3: "Quy trình chuyển viện",
		level4_item4: "Ra quyết định tại chỗ",
		level4_output: "Kết quả: Tự tin thao tác tại sự kiện"
	},
	why: {
		title: "Tại sao hệ thống này hiệu quả",
		statement: "Kết quả tốt hơn đến từ tư duy tốt hơn, không phải nhiều kỹ thuật hơn.",
		item1: "Dựa trên tình huống thực tế",
		item2: "Thực hành trước, lý thuyết sau",
		item3: "Cấu trúc rõ ràng, dễ theo",
		item4: "Áp dụng ngay sau đào tạo"
	},
	quality: {
		title: "Đào tạo có tiêu chuẩn, không chỉ dạy kỹ thuật",
		statement: "Mỗi chương trình đều có đánh giá, tài liệu rõ ràng và follow-up để đảm bảo khả năng áp dụng thực tế.",
		item1_title: "Đánh giá trước và sau",
		item1_desc: "Đánh giá kiến thức và kỹ năng trước và sau khóa học.",
		item2_title: "Đánh giá thực hành",
		item2_desc: "Đánh giá thực hành hands-on bằng rubric điểm số rõ ràng.",
		item3_title: "Tài liệu đào tạo rõ ràng",
		item3_desc: "Nhận tài liệu, giáo trình, protocol và checklist.",
		item4_title: "Hỗ trợ sau khóa",
		item4_desc: "Buổi Q&A hoặc ôn tập để hỗ trợ áp dụng thực tế."
	},
	deliverables: {
		title: "Doanh nghiệp nhận được gì",
		item1: "Giáo trình đào tạo",
		item2: "Checklist thực hành",
		item3: "Rubric đánh giá",
		item4: "Danh sách tham dự",
		item5: "Chứng nhận hoàn thành",
		item6: "Báo cáo sau đào tạo",
		item7: "Hỗ trợ sau khóa",
		item8: "Chứng nhận đồng thương hiệu (tùy chọn)"
	},
	assessment_certification: {
		title: "Lượng giá & Chứng nhận",
		item1: "Lượng giá quá trình & tổng kết",
		item2: "Đánh giá thực hành trực tiếp",
		item3: "Chứng nhận kỹ thuật số & bản cứng",
		item4: "Cộng đồng hỗ trợ liên tục",
		view_certificate: "Nhấp để xem chứng chỉ đầy đủ"
	},
	gallery_caption: "Buổi Đào tạo & Thực hành kỹ thuật trực tiếp Road2Rehab",
	cta: {
		title: "Xây dựng đội ngũ mạnh mẽ và đồng đều hơn.",
		cta1: "Trao đổi lộ trình",
		cta2: "Trao đổi với team",
		sub: "Chúng tôi sẽ giúp bạn thiết kế lộ trình đào tạo phù hợp."
	},
	floating: {
		text: "Đang lên kế hoạch đào tạo cho đội ngũ?",
		cta1: "Trao đổi",
		cta2: "Yêu cầu chương trình"
	}
};
var business_cta_bar = {
	title: "Đang lên kế hoạch cho đội ngũ của bạn?",
	subtitle: "Chúng tôi luôn sẵn sàng hỗ trợ bạn bắt đầu.",
	talk: "Trò chuyện với chúng tôi",
	proposal: "Yêu cầu bản đề xuất"
};
var sharing_hub = {
	nav: "Góc Chia Sẻ",
	hero_title: "Những gì chúng tôi đang học, xây dựng và chia sẻ",
	hero_subtitle: "Kiến thức vận động, giáo dục phục hồi, câu chuyện đội ngũ, cập nhật công ty và điểm nhấn sự kiện — tất cả ở một nơi.",
	featured: "Nổi bật",
	latest_posts: "Kiến thức mới nhất",
	search_placeholder: "Tìm kiếm theo từ khóa...",
	categories: {
		all: "Tất cả",
		articles: "Kiến thức",
		company_updates: "Cập nhật công ty",
		team_stories: "Câu chuyện đội ngũ",
		events: "Sự kiện & Điểm nhấn"
	},
	read_more: "Đọc thêm",
	featured_posts: {
		f1_category: "KIẾN THỨC",
		f1_title: "Phục hồi Thể thao: Tại sao nó Quan trọng với Tất cả Những ai Vận động",
		f1_desc: "Phục hồi thể thao không chỉ đơn thuần là nghỉ ngơi. Đó là một quy trình có cấu trúc giúp cơ thể thích nghi, giảm đau và vận động tốt hơn.",
		f2_category: "CẬP NHẬT CÔNG TY",
		f2_title: "Một Chương Mới cho Stretch.vn",
		f2_desc: "Cập nhật thú vị về những phát triển gần đây và những gì sắp tới.",
		f3_category: "CÂU CHUYỆN ĐỘI NGŨ",
		f3_title: "Gặp gỡ Huy: Dẫn dắt bởi Tò mò, Hướng dẫn bởi Mục đích",
		f3_desc: "Tìm hiểu những con người đứng sau tiến trình phục hồi của bạn.",
		f4_category: "SỰ KIỆN & ĐIỂM NHẤN",
		f4_title: "Ngày Phục Hồi cùng VN Runners Club",
		f4_desc: "Một ngày vận động, phục hồi và cộng đồng trong hành động."
	},
	posts: {
		p1_category: "KIẾN THỨC",
		p1_title: "Foam Rolling 101: Thói quen Đơn giản cho Phục hồi Tốt hơn",
		p1_desc: "Công cụ dễ tiếp cận này có thể giảm căng cơ và hỗ trợ hiệu suất hàng ngày của bạn.",
		p2_category: "CẬP NHẬT CÔNG TY",
		p2_title: "Không gian mới tại Thảo Điền đã mở cửa",
		p2_desc: "Không gian được thiết kế cho chăm sóc tập trung, vận động tốt hơn và kết nối ý nghĩa.",
		p3_category: "CÂU CHUYỆN ĐỘI NGŨ",
		p3_title: "Phía sau Buổi Trị liệu: Sức mạnh của Lắng nghe",
		p3_desc: "Vì sao hiểu câu chuyện của bạn là chìa khóa cho điều trị và huấn luyện hiệu quả.",
		p4_category: "SỰ KIỆN & ĐIỂM NHẤN",
		p4_title: "Workshop Vận động tại RMIT Việt Nam",
		p4_desc: "Năng lượng tuyệt vời và những câu hỏi sâu sắc từ cộng đồng tham gia.",
		p5_category: "KIẾN THỨC",
		p5_title: "Linh hoạt Hông: Chìa khóa cho Vận động Mạnh mẽ, Không Đau",
		p5_desc: "Đánh giá và bài tập đơn giản để cải thiện cách bạn di chuyển.",
		p6_category: "CẬP NHẬT CÔNG TY",
		p6_title: "Phát triển Đội ngũ, Nâng cao Chất lượng",
		p6_desc: "Chào đón các chuyên viên trị liệu và huấn luyện viên mới gia nhập gia đình Stretch.vn.",
		p7_category: "CÂU CHUYỆN ĐỘI NGŨ",
		p7_title: "Từ Thất bại đến Sức mạnh: Hành trình của Kevin",
		p7_desc: "Sự kiên trì, hỗ trợ và kế hoạch đúng đắn đã tạo nên sự khác biệt.",
		p8_category: "SỰ KIỆN & ĐIỂM NHẤN",
		p8_title: "Stretch & Phục hồi Bình minh tại Công viên Sala",
		p8_desc: "Một buổi sáng tươi mới của vận động và kết nối."
	},
	why_title: "Vì sao chúng tôi chia sẻ",
	why_desc: "Chúng tôi tin rằng vận động tốt hơn đến từ thông tin chất lượng và trải nghiệm thực tế. Mục tiêu của chúng tôi là xây dựng niềm tin qua sự minh bạch, chia sẻ kiến thức thực tiễn bạn có thể áp dụng, và phát triển cộng đồng cùng vận động, phục hồi và sống tốt hơn — cùng nhau.",
	why_f1_title: "Kiến thức dựa trên bằng chứng",
	why_f1_desc: "Kiến thức bạn có thể tin tưởng và áp dụng.",
	why_f2_title: "Câu chuyện thực từ người thực",
	why_f2_desc: "Trải nghiệm truyền cảm hứng và kết nối.",
	why_f3_title: "Bài học thực tiễn cho cuộc sống hàng ngày",
	why_f3_desc: "Những bước đơn giản tạo tác động lâu dài.",
	cta_title: "Khám phá thêm. Vận động tốt hơn. Sống tốt hơn.",
	cta_subtitle: "Khám phá dịch vụ, đặt lịch hẹn, hoặc theo dõi chúng tôi để nhận cập nhật mới nhất.",
	cta_explore: "Khám phá Dịch vụ",
	cta_book: "Đặt lịch",
	cta_follow: "Theo dõi Cập nhật",
	detail: {
		back_to_hub: "Quay lại Góc Chia Sẻ",
		on_this_page: "Mục lục kiến thức",
		categories: "Danh mục kiến thức",
		tags: "Từ khóa",
		related_posts: "Có thể bạn muốn đọc thêm",
		view_all_articles: "Xem tất cả kiến thức",
		by: "Bởi",
		min_read: "phút đọc",
		sidebar_cta_title: "Tìm kiếm sự hỗ trợ cho phục hồi hoặc hiệu suất?",
		sidebar_cta_desc: "Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn vận động tốt hơn và cảm thấy khỏe khoắn nhất.",
		sidebar_cta_btn: "Đặt lịch ngay",
		sidebar_business_title: "Giải pháp Doanh nghiệp cho Tổ chức",
		sidebar_business_desc: "Giải pháp phục hồi chuyên nghiệp cho đội nhóm, sự kiện & nơi làm việc.",
		sidebar_business_btn: "Khám phá cho Doanh nghiệp",
		what_is_sport_recovery: {
			title: "Phục hồi Thể thao: Tại sao nó Quan trọng với Tất cả Những ai Vận động",
			excerpt: "Phục hồi thể thao không chỉ đơn thuần là nghỉ ngơi. Đó là một quy trình có cấu trúc giúp cơ thể thích nghi, giảm đau và vận động tốt hơn. Dưới đây là những điều bạn cần biết.",
			intro: {
				title: "Phục hồi thể thao là gì?",
				text: "Phục hồi thể thao là quá trình có chủ ý nhằm giúp cơ thể bạn trở lại trạng thái cân bằng sau những căng thẳng về thể chất. Nó hỗ trợ sửa chữa mô cơ, giảm đau nhức và chuẩn bị cho bạn cho buổi tập luyện hoặc thi đấu tiếp theo.",
				quote: "Phục hồi là nơi sự tiến bộ diễn ra. Không có nó, hiệu suất sẽ không kéo dài."
			},
			why: {
				title: "Tại sao nó quan trọng",
				text: "Phục hồi tốt giúp bạn:",
				b1: "Giảm đau nhức và mỏi cơ",
				b2: "Giảm nguy cơ chấn thương",
				b3: "Cải thiện tính linh hoạt và chất lượng vận động",
				b4: "Đạt hiệu suất tốt nhất, ổn định hơn"
			},
			components: {
				title: "Các thành phần chính của phục hồi thể thao",
				c1: {
					title: "Khôi phục Vận động",
					desc: "Cải thiện tính linh hoạt và khôi phục biên độ vận động"
				},
				c2: {
					title: "Trị liệu Mô mềm",
					desc: "Giải phóng căng thẳng và giảm căng cứng cơ"
				},
				c3: {
					title: "Phương pháp Phục hồi",
					desc: "Sử dụng các công cụ phù hợp để tăng tốc độ phục hồi"
				},
				c4: {
					title: "Dinh dưỡng & Nước",
					desc: "Cung cấp năng lượng cho cơ thể để sửa chữa và hoạt động"
				},
				c5: {
					title: "Giấc ngủ & Nghỉ ngơi",
					desc: "Nghỉ ngơi chất lượng là nơi cơ thể thích nghi và phát triển"
				}
			},
			who: {
				title: "Ai có thể hưởng lợi?",
				text: "Bất kỳ ai vận động. Từ vận động viên chuyên nghiệp, người chơi thể thao phong trào đến những người làm việc văn phòng, phục hồi thể thao đều giúp bạn vận động tốt hơn, cảm thấy khỏe hơn và duy trì sự ổn định."
			},
			start: {
				title: "Làm thế nào để bắt đầu",
				text: "Hãy bắt đầu bằng việc thấu hiểu cơ thể bạn. Lắng nghe các tín hiệu. Sau đó, xây dựng một thói quen phục hồi đơn giản phù hợp với bạn. Cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng đồng hành cùng bạn."
			},
			takeaways: {
				title: "Điểm mấu chốt cần nhớ",
				text: "Phục hồi là một hành trình dài hạn, không phải là đích đến nhất thời. Hãy lắng nghe cơ thể bạn, duy trì tính nhất quán và đừng ngần ngại tìm kiếm sự hướng dẫn chuyên nghiệp khi cần thiết."
			}
		}
	}
};
const locale_vi_46json_3b88fef4 = {
	nav: nav,
	hero: hero,
	products: products$1,
	bookingSection: bookingSection,
	testimonials: testimonials,
	faq: faq,
	footer: footer,
	booking: booking,
	booking_v2: booking_v2,
	trust_bar: trust_bar,
	services: services,
	where_we_work: where_we_work,
	why_stretch: why_stretch,
	cta_bar: cta_bar,
	assurance: assurance,
	about: about,
	partners: partners,
	contact_widget: contact_widget,
	individual_page: individual_page,
	business_page: business_page,
	wellness_page: wellness_page,
	event_page: event_page,
	education_page: education_page,
	business_cta_bar: business_cta_bar,
	sharing_hub: sharing_hub
};

const config_i18n_46config_46ts_2c1cdce2 = () => ({
  legacy: false,
  fallbackLocale: "en"
});

// @ts-nocheck
const localeCodes =  [
  "en",
  "vi"
];
const localeLoaders = {
  en: [
    {
      key: "locale_en_46json_250de9dd",
      load: () => Promise.resolve(locale_en_46json_250de9dd),
      cache: true
    }
  ],
  vi: [
    {
      key: "locale_vi_46json_3b88fef4",
      load: () => Promise.resolve(locale_vi_46json_3b88fef4),
      cache: true
    }
  ]
};
const vueI18nConfigs = [
  () => Promise.resolve(config_i18n_46config_46ts_2c1cdce2)
];
const normalizedLocales = [
  {
    code: "en",
    language: "en-US",
    name: "English"
  },
  {
    code: "vi",
    language: "vi-VN",
    name: "Tiếng Việt"
  }
];

const setupVueI18nOptions = async (defaultLocale) => {
  const options = await loadVueI18nOptions(vueI18nConfigs);
  options.locale = defaultLocale || options.locale || "en-US";
  options.defaultLocale = defaultLocale;
  options.fallbackLocale ??= false;
  options.messages ??= {};
  for (const locale of localeCodes) {
    options.messages[locale] ??= {};
  }
  return options;
};

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const e=globalThis.process?.env||Object.create(null),t=globalThis.process||{env:e},n=t!==void 0&&t.env&&t.env.NODE_ENV||void 0,r=[[`claude`,[`CLAUDECODE`,`CLAUDE_CODE`]],[`replit`,[`REPL_ID`]],[`gemini`,[`GEMINI_CLI`]],[`codex`,[`CODEX_SANDBOX`,`CODEX_THREAD_ID`]],[`opencode`,[`OPENCODE`]],[`pi`,[i(`PATH`,/\.pi[\\/]agent/)]],[`auggie`,[`AUGMENT_AGENT`]],[`goose`,[`GOOSE_PROVIDER`]],[`devin`,[i(`EDITOR`,/devin/)]],[`cursor`,[`CURSOR_AGENT`]],[`kiro`,[i(`TERM_PROGRAM`,/kiro/)]]];function i(t,n){return ()=>{let r=e[t];return r?n.test(r):false}}function a(){let t=e.AI_AGENT;if(t)return {name:t.toLowerCase()};for(let[t,n]of r)for(let r of n)if(typeof r==`string`?e[r]:r())return {name:t};return {}}const o=a();o.name;!!o.name;const l=[[`APPVEYOR`],[`AWS_AMPLIFY`,`AWS_APP_ID`,{ci:true}],[`AZURE_PIPELINES`,`SYSTEM_TEAMFOUNDATIONCOLLECTIONURI`],[`AZURE_STATIC`,`INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN`],[`APPCIRCLE`,`AC_APPCIRCLE`],[`BAMBOO`,`bamboo_planKey`],[`BITBUCKET`,`BITBUCKET_COMMIT`],[`BITRISE`,`BITRISE_IO`],[`BUDDY`,`BUDDY_WORKSPACE_ID`],[`BUILDKITE`],[`CIRCLE`,`CIRCLECI`],[`CIRRUS`,`CIRRUS_CI`],[`CLOUDFLARE_PAGES`,`CF_PAGES`,{ci:true}],[`CLOUDFLARE_WORKERS`,`WORKERS_CI`,{ci:true}],[`GOOGLE_CLOUDRUN`,`K_SERVICE`],[`GOOGLE_CLOUDRUN_JOB`,`CLOUD_RUN_JOB`],[`CODEBUILD`,`CODEBUILD_BUILD_ARN`],[`CODEFRESH`,`CF_BUILD_ID`],[`DRONE`],[`DRONE`,`DRONE_BUILD_EVENT`],[`DSARI`],[`GITHUB_ACTIONS`],[`GITLAB`,`GITLAB_CI`],[`GITLAB`,`CI_MERGE_REQUEST_ID`],[`GOCD`,`GO_PIPELINE_LABEL`],[`LAYERCI`],[`JENKINS`,`JENKINS_URL`],[`HUDSON`,`HUDSON_URL`],[`MAGNUM`],[`NETLIFY`],[`NETLIFY`,`NETLIFY_LOCAL`,{ci:false}],[`NEVERCODE`],[`RENDER`],[`SAIL`,`SAILCI`],[`SEMAPHORE`],[`SCREWDRIVER`],[`SHIPPABLE`],[`SOLANO`,`TDDIUM`],[`STRIDER`],[`TEAMCITY`,`TEAMCITY_VERSION`],[`TRAVIS`],[`VERCEL`,`NOW_BUILDER`],[`VERCEL`,`VERCEL`,{ci:false}],[`VERCEL`,`VERCEL_ENV`,{ci:false}],[`APPCENTER`,`APPCENTER_BUILD_ID`],[`CODESANDBOX`,`CODESANDBOX_SSE`,{ci:false}],[`CODESANDBOX`,`CODESANDBOX_HOST`,{ci:false}],[`STACKBLITZ`],[`STORMKIT`],[`CLEAVR`],[`ZEABUR`],[`CODESPHERE`,`CODESPHERE_APP_ID`,{ci:true}],[`RAILWAY`,`RAILWAY_PROJECT_ID`],[`RAILWAY`,`RAILWAY_SERVICE_ID`],[`DENO-DEPLOY`,`DENO_DEPLOY`],[`DENO-DEPLOY`,`DENO_DEPLOYMENT_ID`],[`FIREBASE_APP_HOSTING`,`FIREBASE_APP_HOSTING`,{ci:true}],[`EDGEONE_PAGES`,`EO_PAGES_CI`,{ci:true}]];function u(){for(let t of l)if(e[t[1]||t[0]])return {name:t[0].toLowerCase(),...t[2]};return e.SHELL===`/bin/jsh`&&t.versions?.webcontainer?{name:`stackblitz`,ci:false}:{name:``,ci:false}}const d=u();d.name;const p=t.platform||``,m=!!e.CI||d.ci!==false,h=!!t.stdout?.isTTY;!!e.DEBUG;const v=n===`test`||!!e.TEST;n===`production`||e.MODE===`production`;const b=n===`dev`||n===`development`||e.MODE===`development`;!!e.MINIMAL||m||v||!h;const S=/^win/i.test(p);!e.NO_COLOR&&(!!e.FORCE_COLOR||(h||S)&&e.TERM!==`dumb`||m);const E=(t.versions?.node||``).replace(/^v/,``)||null;Number(E?.split(`.`)[0])||null;const O=!!t?.versions?.node,k=`Bun`in globalThis,A=`Deno`in globalThis,j=`fastly`in globalThis,M=`Netlify`in globalThis,N=`EdgeRuntime`in globalThis,P=globalThis.navigator?.userAgent===`Cloudflare-Workers`,F=[[M,`netlify`],[N,`edge-light`],[P,`workerd`],[j,`fastly`],[A,`deno`],[k,`bun`],[O,`node`]];function I(){let e=F.find(e=>e[0]);if(e)return {name:e[1]}}const L=I();L?.name||``;

function baseURL() {
	
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const checksums = {
  "content": "v3.5.0--G3FWFvaE9gSQKflkzm8Kz2iQFYgghlrc8gaeMQKM3_o"
};
const checksumsStructure = {
  "content": "bgIYhpjRuV8zbHJE_CfelwKpJ_Td6YuGJwixiek8lmI"
};
const tables = {
  "content": "_content_content",
  "info": "_content_info"
};
const contentManifest = {
  "content": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
};

const buildGroup = (group, type) => {
  const conditions = group._conditions;
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : "";
};
const collectionQueryGroup = (collection) => {
  const conditions = [];
  const query = {
    // @ts-expect-error -- internal
    _conditions: conditions,
    where(field, operator, value) {
      let condition;
      switch (operator.toUpperCase()) {
        case "IN":
        case "NOT IN":
          if (Array.isArray(value)) {
            const values = value.map((val) => singleQuote(val)).join(", ");
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`;
          } else {
            throw new TypeError(`Value for ${operator} must be an array`);
          }
          break;
        case "BETWEEN":
        case "NOT BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value[0])} AND ${singleQuote(value[1])}`;
          } else {
            throw new Error(`Value for ${operator} must be an array with two elements`);
          }
          break;
        case "IS NULL":
        case "IS NOT NULL":
          condition = `"${String(field)}" ${operator.toUpperCase()}`;
          break;
        case "LIKE":
        case "NOT LIKE":
          condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value)}`;
          break;
        default:
          condition = `"${String(field)}" ${operator} ${singleQuote(typeof value === "boolean" ? Number(value) : value)}`;
      }
      conditions.push(`${condition}`);
      return query;
    },
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "OR"));
      return query;
    }
  };
  return query;
};
const collectionQueryBuilder = (collection, fetch) => {
  const params = {
    conditions: [],
    selectedFields: [],
    offset: 0,
    limit: 0,
    orderBy: [],
    // Count query
    count: {
      field: "",
      distinct: false
    }
  };
  const query = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "OR"));
      return query;
    },
    path(path) {
      return query.where("path", "=", withoutTrailingSlash(path));
    },
    skip(skip) {
      params.offset = skip;
      return query;
    },
    where(field, operator, value) {
      query.andWhere((group) => group.where(String(field), operator, value));
      return query;
    },
    limit(limit) {
      params.limit = limit;
      return query;
    },
    select(...fields) {
      if (fields.length) {
        params.selectedFields.push(...fields);
      }
      return query;
    },
    order(field, direction) {
      params.orderBy.push(`"${String(field)}" ${direction}`);
      return query;
    },
    async all() {
      return fetch(collection, buildQuery()).then((res) => res || []);
    },
    async first() {
      return fetch(collection, buildQuery({ limit: 1 })).then((res) => res[0] || null);
    },
    async count(field = "*", distinct = false) {
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct }
      })).then((m) => m[0].count);
    }
  };
  function buildQuery(opts = {}) {
    let query2 = "SELECT ";
    if (opts?.count) {
      query2 += `COUNT(${opts.count.distinct ? "DISTINCT " : ""}${opts.count.field}) as count`;
    } else {
      const fields = Array.from(new Set(params.selectedFields));
      query2 += fields.length > 0 ? fields.map((f) => `"${String(f)}"`).join(", ") : "*";
    }
    query2 += ` FROM ${tables[String(collection)]}`;
    if (params.conditions.length > 0) {
      query2 += ` WHERE ${params.conditions.join(" AND ")}`;
    }
    if (params.orderBy.length > 0) {
      query2 += ` ORDER BY ${params.orderBy.join(", ")}`;
    } else {
      query2 += ` ORDER BY stem ASC`;
    }
    const limit = opts?.limit || params.limit;
    if (limit > 0) {
      if (params.offset > 0) {
        query2 += ` LIMIT ${limit} OFFSET ${params.offset}`;
      } else {
        query2 += ` LIMIT ${limit}`;
      }
    }
    return query2;
  }
  return query;
};
function singleQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function fetchContent(event, collection, path, options) {
  const headers = event ? getRequestHeaders(event) : {};
  headers["accept-encoding"] = void 0;
  const url = `/__nuxt_content/${collection}/${path}`;
  const fetchOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    query: { v: checksums[String(collection)], t: void 0 }
  };
  return event ? await event.$fetch(url, fetchOptions) : await $fetch(url, fetchOptions);
}
async function fetchDatabase(event, collection) {
  return fetchContent(event, collection, "sql_dump.txt", {
    responseType: "text",
    headers: {
      "content-type": "text/plain"
    }
  });
}
async function fetchQuery(event, collection, sql) {
  return fetchContent(event, collection, "query", {
    headers: {
      "content-type": "application/json"
    },
    method: "POST",
    body: {
      sql
    }
  });
}

const queryCollection = (event, collection) => {
  return collectionQueryBuilder(collection, (collection2, sql) => fetchQuery(event, collection2, sql));
};

function parseAcceptLanguage(value) {
  return value.split(",").map((tag) => tag.split(";")[0]).filter(
    (tag) => !(tag === "*" || tag === "")
  );
}
function createPathIndexLanguageParser(index = 0) {
  return (path) => {
    const rawPath = typeof path === "string" ? path : path.pathname;
    const normalizedPath = rawPath.split("?")[0];
    const parts = normalizedPath.split("/");
    if (parts[0] === "") {
      parts.shift();
    }
    return parts.length > index ? parts[index] || "" : "";
  };
}

const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASH_RE = /\/$/;
function isLocalhostHost(host) {
  if (!host || host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("0.0.0.0"))
    return true;
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host;
  return hostname === "[::1]" || hostname === "::1" || hostname === "[::]" || hostname === "::";
}
function extractHostname(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    return close !== -1 ? host.slice(0, close + 1) : host;
  }
  const colonCount = host.split(":").length - 1;
  return colonCount === 1 ? host.slice(0, host.indexOf(":")) : host;
}
function splitHostPort(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    const hostname = close !== -1 ? host.slice(0, close + 1) : host;
    const port = close !== -1 && host[close + 1] === ":" ? host.slice(close + 2) : "";
    const normalized = hostname === "[::1]" || hostname === "[::]" ? "localhost" : hostname;
    return { host: normalized, port };
  }
  if (host === "0.0.0.0" || host.startsWith("0.0.0.0:")) {
    const i = host.indexOf(":");
    return { host: "localhost", port: i !== -1 ? host.slice(i + 1) : "" };
  }
  const colonCount = host.split(":").length - 1;
  if (colonCount === 1) {
    const i = host.indexOf(":");
    return { host: host.slice(0, i), port: host.slice(i + 1) };
  }
  if (colonCount > 1) {
    const normalized = host === "::1" || host === "::" ? "localhost" : `[${host}]`;
    return { host: normalized, port: "" };
  }
  return { host, port: "" };
}
function getNitroOrigin$1(ctx = {}) {
  const isDev = ctx.isDev ?? b;
  const isPrerender = ctx.isPrerender ?? false;
  let host = "";
  let port = "";
  let protocol = process.env.NITRO_SSL_CERT && process.env.NITRO_SSL_KEY ? "https" : "http";
  if (isDev || isPrerender) {
    const devEnv = process.env.__NUXT_DEV__ || process.env.NUXT_VITE_NODE_OPTIONS;
    if (devEnv) {
      const parsed = JSON.parse(devEnv);
      const origin = parsed.proxy?.url || parsed.baseURL?.replace("/__nuxt_vite_node__", "");
      host = origin.replace(PROTOCOL_RE, "").replace(TRAILING_SLASH_RE, "");
      protocol = origin.startsWith("https") ? "https" : "http";
    }
  }
  if (isDev && isLocalhostHost(host) && ctx.requestHost) {
    const reqHost = extractHostname(ctx.requestHost);
    if (reqHost && !isLocalhostHost(reqHost)) {
      host = ctx.requestHost;
      protocol = ctx.requestProtocol || protocol;
    }
  }
  if (!host && ctx.requestHost) {
    host = ctx.requestHost;
    protocol = ctx.requestProtocol || protocol;
  }
  if (!host) {
    host = process.env.NITRO_HOST || process.env.HOST || "";
    if (isDev)
      port = process.env.NITRO_PORT || process.env.PORT || "3000";
  }
  const split = splitHostPort(host);
  host = split.host;
  if (split.port)
    port = split.port;
  host = process.env.NUXT_SITE_HOST_OVERRIDE || host;
  port = process.env.NUXT_SITE_PORT_OVERRIDE || port;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    protocol = host.startsWith("https://") ? "https" : "http";
    host = host.replace(PROTOCOL_RE, "");
  } else if (!isDev && (!host || !isLocalhostHost(host))) {
    protocol = "https";
  }
  return `${protocol}://${host}${port ? `:${port}` : ""}/`;
}

function getNitroOrigin(e) {
  return getNitroOrigin$1({
    isDev: false,
    isPrerender: false,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : void 0,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) : void 0
  });
}

function getSiteIndexable(e) {
  const { env, indexable } = getSiteConfig(e);
  if (typeof indexable !== "undefined")
    return String(indexable) === "true";
  return env === "production";
}

const FILE_EXT_RE = /\.[0-9a-z]+$/i;
function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(FILE_EXT_RE)?.[0];
  return !!(ext && fileExtensions.includes(ext.replace(".", "")));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}
function withSiteUrl(e, path, options = {}) {
  const siteConfig = e.context.siteConfig?.get();
  let siteUrl = e.context.siteConfigNitroOrigin;
  if ((options.canonical !== false || false) && siteConfig.url)
    siteUrl = siteConfig.url;
  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase
  });
}

function withoutQuery$1(path) {
  return String(path.split("?")[0]);
}
function createNitroRouteRuleMatcher$1(e) {
  const { nitro, app } = useRuntimeConfig(e);
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(withoutTrailingSlash(withoutQuery$1(path)), app.baseURL)
    ).reverse());
  };
}

function getSiteRobotConfig(e) {
  const query = getQuery(e);
  const hints = [];
  const { groups, debug } = useRuntimeConfigNuxtRobots(e);
  let indexable = getSiteIndexable(e);
  const queryIndexableEnabled = String(query.mockProductionEnv) === "true" || query.mockProductionEnv === "";
  if (debug || false) {
    const { _context } = getSiteConfig(e, { debug: debug || false });
    if (queryIndexableEnabled) {
      indexable = true;
      hints.push("You are mocking a production enviroment with ?mockProductionEnv query.");
    } else if (!indexable && _context.indexable === "nuxt-robots:config") {
      hints.push("You are blocking indexing with your Nuxt Robots config.");
    } else if (!queryIndexableEnabled && !_context.indexable) {
      hints.push(`Indexing is blocked in development. You can mock a production environment with ?mockProductionEnv query.`);
    } else if (!indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is blocked by site config set by ${_context.indexable}.`);
    } else if (indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is enabled from ${_context.indexable}.`);
    }
  }
  if (groups.some((g) => g.userAgent.includes("*") && g.disallow.includes("/"))) {
    indexable = false;
    hints.push("You are blocking all user agents with a wildcard `Disallow /`.");
  } else if (groups.some((g) => g.disallow.includes("/"))) {
    hints.push("You are blocking specific user agents with `Disallow /`.");
  }
  return { indexable, hints };
}

function getPathRobotConfig(e, options) {
  const runtimeConfig = useRuntimeConfig(e);
  const { robotsDisabledValue, robotsEnabledValue, isNuxtContentV2 } = useRuntimeConfigNuxtRobots(e);
  if (!options?.skipSiteIndexable) {
    if (!getSiteRobotConfig(e).indexable) {
      return {
        rule: robotsDisabledValue,
        indexable: false,
        debug: {
          source: "Site Config"
        }
      };
    }
  }
  const path = options?.path || e.path;
  let userAgent = options?.userAgent;
  if (!userAgent) {
    try {
      userAgent = getRequestHeader(e, "User-Agent");
    } catch {
    }
  }
  const nitroApp = useNitroApp();
  const groups = [
    // run explicit user agent matching first
    ...nitroApp._robots.ctx.groups.filter((g) => {
      if (userAgent) {
        return g.userAgent.some((ua) => ua.toLowerCase().includes(userAgent.toLowerCase()));
      }
      return false;
    }),
    // run wildcard matches second
    ...nitroApp._robots.ctx.groups.filter((g) => g.userAgent.includes("*"))
  ];
  for (const group of groups) {
    if (!options?.skipSiteIndexable && group._indexable === false) {
      return {
        indexable: false,
        rule: robotsDisabledValue,
        debug: {
          source: "/robots.txt",
          line: JSON.stringify(group)
        }
      };
    }
    const rules = options?.skipSiteIndexable ? (group._rules || []).filter((r) => r.pattern !== "/") : group._rules || [];
    const robotsTxtRule = matchPathToRule(path, rules);
    if (robotsTxtRule) {
      if (!robotsTxtRule.allow) {
        return {
          indexable: false,
          rule: robotsDisabledValue,
          debug: {
            source: "/robots.txt",
            line: `Disallow: ${robotsTxtRule.pattern}`
          }
        };
      }
      break;
    }
  }
  if (isNuxtContentV2 && nitroApp._robots?.nuxtContentUrls?.has(withoutTrailingSlash(path))) {
    return {
      indexable: false,
      rule: robotsDisabledValue,
      debug: {
        source: "Nuxt Content"
      }
    };
  }
  const { pageMetaRobots } = useRuntimeConfigNuxtRobots(e);
  const pageMetaRule = pageMetaRobots?.[withoutTrailingSlash(path)];
  if (typeof pageMetaRule !== "undefined") {
    const normalised = normaliseRobotsRouteRule({ robots: pageMetaRule });
    if (normalised && (typeof normalised.allow !== "undefined" || typeof normalised.rule !== "undefined")) {
      return {
        indexable: normalised.allow ?? false,
        rule: normalised.rule || (normalised.allow ? robotsEnabledValue : robotsDisabledValue),
        debug: {
          source: "Page Meta"
        }
      };
    }
  }
  nitroApp._robotsRuleMatcher = nitroApp._robotsRuleMatcher || createNitroRouteRuleMatcher$1(e);
  let robotRouteRules = nitroApp._robotsRuleMatcher(path);
  let routeRulesPath = path;
  const i18nConfig = runtimeConfig.public?.i18n;
  if (i18nConfig?.locales && typeof robotRouteRules.robots === "undefined") {
    const { locales } = i18nConfig;
    const locale = locales.find((l) => routeRulesPath.startsWith(`/${l.code}`));
    if (locale) {
      routeRulesPath = routeRulesPath.replace(`/${locale.code}`, "");
      robotRouteRules = nitroApp._robotsRuleMatcher(routeRulesPath);
    }
  }
  const routeRules = normaliseRobotsRouteRule(robotRouteRules);
  if (routeRules && (typeof routeRules.allow !== "undefined" || typeof routeRules.rule !== "undefined")) {
    return {
      indexable: routeRules.allow ?? false,
      rule: routeRules.rule || (routeRules.allow ? robotsEnabledValue : robotsDisabledValue),
      debug: {
        source: "Route Rules"
      }
    };
  }
  return {
    indexable: true,
    rule: robotsEnabledValue
  };
}

const products = [
  {
    id: "srv-001",
    slug: "facial-hydration-therapy",
    name: "Facial Hydration Therapy",
    nameEn: "Facial Hydration Therapy",
    nameVi: "Li\u1EC7u Ph\xE1p C\u1EA5p \u1EA8m Ph\u1EE5c H\u1ED3i",
    shortDescription: "Deep hydration therapy for soft, glowing skin using advanced technology.",
    shortDescriptionEn: "Deep hydration therapy for soft, glowing skin using advanced technology.",
    shortDescriptionVi: "Li\u1EC7u ph\xE1p c\u1EA5p \u1EA9m chuy\xEAn s\xE2u gi\xFAp da m\u1EC1m m\u1EA1i, t\u01B0\u01A1i s\xE1ng v\u1EDBi c\xF4ng ngh\u1EC7 hi\u1EC7n \u0111\u1EA1i.",
    description: `<p>Li\u1EC7u ph\xE1p <strong>Facial Hydration Therapy</strong> s\u1EED d\u1EE5ng k\u1EF9 thu\u1EADt ti\xEAn ti\u1EBFn k\u1EBFt h\u1EE3p serum hyaluronic acid v\xE0 collagen peptide \u0111\u1EC3 ph\u1EE5c h\u1ED3i \u0111\u1ED9 \u1EA9m s\xE2u cho da.</p>
<ul>
  <li>L\xE0m s\u1EA1ch s\xE2u v\u1EDBi enzyme nh\u1EB9 nh\xE0ng</li>
  <li>\u0110\u1EAFp m\u1EB7t n\u1EA1 bio-cellulose c\u1EA5p \u1EA9m</li>
  <li>Massage k\xEDch th\xEDch tu\u1EA7n ho\xE0n</li>
  <li>K\u1EBFt th\xFAc v\u1EDBi kem d\u01B0\u1EE1ng ch\u1ED1ng l\xE3o h\xF3a</li>
</ul>
<p>Th\u1EDDi gian: 60 ph\xFAt | Ph\xF9 h\u1EE3p m\u1ECDi lo\u1EA1i da</p>`,
    price: 85e4,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&fit=crop",
      "https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&fit=crop"
    ],
    category: "Facial",
    tags: ["popular", "hydration"],
    available: true,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-04-20T00:00:00Z"
  },
  {
    id: "srv-002",
    slug: "deep-tissue-massage",
    name: "Deep Tissue Massage",
    nameEn: "Deep Tissue Massage",
    nameVi: "Massage M\xF4 S\xE2u",
    shortDescription: "Deep tissue massage to relieve tension, reduce muscle pain and restore the body.",
    shortDescriptionEn: "Deep tissue massage to relieve tension, reduce muscle pain and restore the body.",
    shortDescriptionVi: "Massage m\xF4 s\xE2u gi\xFAp gi\u1EA3i t\u1ECFa c\u0103ng th\u1EB3ng, gi\u1EA3m \u0111au c\u01A1 v\xE0 ph\u1EE5c h\u1ED3i c\u01A1 th\u1EC3.",
    description: `<p><strong>Deep Tissue Massage</strong> l\xE0 li\u1EC7u ph\xE1p massage chuy\xEAn s\xE2u nh\u1EAFm v\xE0o c\xE1c l\u1EDBp c\u01A1 b\xEAn d\u01B0\u1EDBi, gi\xFAp:</p>
<ul>
  <li>Gi\u1EA3i ph\xF3ng c\xE1c \u0111i\u1EC3m c\u0103ng c\u01A1 (trigger points)</li>
  <li>T\u0103ng l\u01B0u th\xF4ng m\xE1u v\xE0 gi\u1EA3m vi\xEAm</li>
  <li>C\u1EA3i thi\u1EC7n ph\u1EA1m vi chuy\u1EC3n \u0111\u1ED9ng</li>
  <li>Gi\u1EA3m \u0111au m\xE3n t\xEDnh v\xF9ng l\u01B0ng, c\u1ED5, vai</li>
</ul>
<p>Th\u1EDDi gian: 90 ph\xFAt | \xC1p l\u1EF1c t\u1EEB trung b\xECnh \u0111\u1EBFn m\u1EA1nh</p>`,
    price: 12e5,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&fit=crop",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&fit=crop",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&fit=crop"
    ],
    category: "Massage",
    tags: ["popular", "therapeutic"],
    available: true,
    createdAt: "2025-01-20T00:00:00Z",
    updatedAt: "2025-04-18T00:00:00Z"
  },
  {
    id: "srv-003",
    slug: "aromatherapy-relaxation",
    name: "Aromatherapy Relaxation",
    nameEn: "Aromatherapy Relaxation",
    nameVi: "Th\u01B0 Gi\xE3n Tinh D\u1EA7u",
    shortDescription: "Full-body aromatherapy to balance mind and body with natural oils.",
    shortDescriptionEn: "Full-body aromatherapy to balance mind and body with natural oils.",
    shortDescriptionVi: "Li\u1EC7u ph\xE1p tinh d\u1EA7u th\u01B0 gi\xE3n to\xE0n th\xE2n, c\xE2n b\u1EB1ng t\xE2m tr\xED v\xE0 c\u01A1 th\u1EC3.",
    description: `<p>Phi\xEAn <strong>Aromatherapy Relaxation</strong> k\u1EBFt h\u1EE3p tinh d\u1EA7u thi\xEAn nhi\xEAn v\u1EDBi k\u1EF9 thu\u1EADt massage nh\u1EB9 nh\xE0ng:</p>
<ul>
  <li>L\u1EF1a ch\u1ECDn tinh d\u1EA7u theo nhu c\u1EA7u c\xE1 nh\xE2n</li>
  <li>Massage to\xE0n th\xE2n v\u1EDBi \xE1p l\u1EF1c nh\u1EB9</li>
  <li>Li\u1EC7u ph\xE1p \u0111\xE1 n\xF3ng b\u1ED5 sung</li>
  <li>Thi\u1EC1n \u0111\u1ECBnh h\u01B0\u1EDBng d\u1EABn k\u1EBFt th\xFAc phi\xEAn</li>
</ul>
<p>Th\u1EDDi gian: 75 ph\xFAt | Ph\xF9 h\u1EE3p cho stress, m\u1EA5t ng\u1EE7</p>`,
    price: 95e4,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&fit=crop"
    ],
    category: "Wellness",
    tags: ["relaxation"],
    available: true,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-04-15T00:00:00Z"
  },
  {
    id: "srv-004",
    slug: "led-light-skin-rejuvenation",
    name: "LED Light Skin Rejuvenation",
    nameEn: "LED Light Skin Rejuvenation",
    nameVi: "Tr\u1EBB H\xF3a Da B\u1EB1ng \u0110\xE8n LED",
    shortDescription: "LED light technology to stimulate collagen and rejuvenate the skin.",
    shortDescriptionEn: "LED light technology to stimulate collagen and rejuvenate the skin.",
    shortDescriptionVi: "C\xF4ng ngh\u1EC7 \xE1nh s\xE1ng LED k\xEDch th\xEDch t\xE1i t\u1EA1o collagen, tr\u1EBB h\xF3a l\xE0n da.",
    description: `<p><strong>LED Light Therapy</strong> s\u1EED d\u1EE5ng c\xE1c b\u01B0\u1EDBc s\xF3ng \xE1nh s\xE1ng kh\xE1c nhau \u0111\u1EC3:</p>
<ul>
  <li>\u0110\u1ECF (630nm): K\xEDch th\xEDch collagen, gi\u1EA3m n\u1EBFp nh\u0103n</li>
  <li>Xanh (415nm): Di\u1EC7t khu\u1EA9n P.acnes, gi\u1EA3m m\u1EE5n</li>
  <li>H\u1ED3ng ngo\u1EA1i (850nm): Gi\u1EA3m vi\xEAm, ph\u1EE5c h\u1ED3i s\xE2u</li>
</ul>
<p>Kh\xF4ng \u0111au, kh\xF4ng x\xE2m l\u1EA5n. Th\u1EDDi gian: 45 ph\xFAt</p>`,
    price: 65e4,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&fit=crop"
    ],
    category: "Technology",
    tags: ["new", "anti-aging"],
    available: true,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-04-22T00:00:00Z"
  },
  {
    id: "srv-005",
    slug: "hot-stone-therapy",
    name: "Hot Stone Therapy",
    nameEn: "Hot Stone Therapy",
    nameVi: "Tr\u1ECB Li\u1EC7u \u0110\xE1 N\xF3ng",
    shortDescription: "Basalt hot stone therapy to relax deep muscles and improve blood circulation.",
    shortDescriptionEn: "Basalt hot stone therapy to relax deep muscles and improve blood circulation.",
    shortDescriptionVi: "Li\u1EC7u ph\xE1p \u0111\xE1 n\xF3ng bazan th\u01B0 gi\xE3n c\u01A1 s\xE2u, c\u1EA3i thi\u1EC7n tu\u1EA7n ho\xE0n m\xE1u.",
    description: `<p><strong>Hot Stone Therapy</strong> s\u1EED d\u1EE5ng \u0111\xE1 bazan t\u1EF1 nhi\xEAn \u0111\u01B0\u1EE3c nung n\xF3ng:</p>
<ul>
  <li>\u0110\xE1 \u0111\u01B0\u1EE3c \u0111\u1EB7t t\u1EA1i c\xE1c huy\u1EC7t \u0111\u1EA1o quan tr\u1ECDng</li>
  <li>K\u1EBFt h\u1EE3p massage th\u1EE5y \u0111i\u1EC3n nh\u1EB9 nh\xE0ng</li>
  <li>Gi\xE3n c\u01A1 s\xE2u kh\xF4ng c\u1EA7n \xE1p l\u1EF1c m\u1EA1nh</li>
  <li>Gi\u1EA3m stress v\xE0 c\u1EA3i thi\u1EC7n gi\u1EA5c ng\u1EE7</li>
</ul>
<p>Th\u1EDDi gian: 90 ph\xFAt | Nhi\u1EC7t \u0111\u1ED9 \u0111\u01B0\u1EE3c ki\u1EC3m so\xE1t an to\xE0n</p>`,
    price: 11e5,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&fit=crop",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&fit=crop"
    ],
    category: "Massage",
    tags: ["premium"],
    available: true,
    createdAt: "2025-02-15T00:00:00Z",
    updatedAt: "2025-04-10T00:00:00Z"
  },
  {
    id: "srv-006",
    slug: "premium-anti-aging-facial",
    name: "Premium Anti-Aging Facial",
    nameEn: "Premium Anti-Aging Facial",
    nameVi: "Tr\u1EBB H\xF3a Da Cao C\u1EA5p",
    shortDescription: "Premium anti-aging treatment with RF technology and 24K gold serum.",
    shortDescriptionEn: "Premium anti-aging treatment with RF technology and 24K gold serum.",
    shortDescriptionVi: "Li\u1EC7u tr\xECnh ch\u1ED1ng l\xE3o h\xF3a cao c\u1EA5p v\u1EDBi c\xF4ng ngh\u1EC7 RF v\xE0 serum v\xE0ng 24K.",
    description: `<p>Li\u1EC7u tr\xECnh <strong>Premium Anti-Aging</strong> k\u1EBFt h\u1EE3p nhi\u1EC1u c\xF4ng ngh\u1EC7 ti\xEAn ti\u1EBFn:</p>
<ul>
  <li>L\xE0m s\u1EA1ch v\xE0 t\u1EA9y t\u1EBF b\xE0o ch\u1EBFt enzyme</li>
  <li>N\xE2ng c\u01A1 b\u1EB1ng s\xF3ng RF (Radio Frequency)</li>
  <li>Serum v\xE0ng 24K ch\u1ED1ng oxy h\xF3a</li>
  <li>M\u1EB7t n\u1EA1 collagen v\xE0ng sinh h\u1ECDc</li>
  <li>Kem d\u01B0\u1EE1ng peptide chuy\xEAn s\xE2u</li>
</ul>
<p>Th\u1EDDi gian: 120 ph\xFAt | K\u1EBFt qu\u1EA3 th\u1EA5y r\xF5 sau 1 li\u1EC7u tr\xECnh</p>`,
    price: 25e5,
    currency: "VND",
    coverImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=640&h=360&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&fit=crop"
    ],
    category: "Facial",
    tags: ["popular", "premium", "anti-aging"],
    available: true,
    createdAt: "2025-03-10T00:00:00Z",
    updatedAt: "2025-04-25T00:00:00Z"
  }
];
const practitioners = [
  {
    id: "prac-001",
    name: "Nguy\u1EC5n Th\u1ECB Minh Anh",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    bio: "10+ n\u0103m kinh nghi\u1EC7m trong tr\u1ECB li\u1EC7u da m\u1EB7t v\xE0 ch\u1ED1ng l\xE3o h\xF3a.",
    specialties: ["Facial", "Anti-Aging"],
    services: ["srv-001", "srv-004", "srv-006"]
  },
  {
    id: "prac-002",
    name: "Tr\u1EA7n V\u0103n Ho\xE0ng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Chuy\xEAn gia massage tr\u1ECB li\u1EC7u, ch\u1EE9ng ch\u1EC9 qu\u1ED1c t\u1EBF t\u1EEB ITEC.",
    specialties: ["Deep Tissue", "Sports Massage"],
    services: ["srv-002", "srv-005"]
  },
  {
    id: "prac-003",
    name: "L\xEA Th\u1ECB H\u01B0\u01A1ng",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    bio: "Chuy\xEAn vi\xEAn aromatherapy v\xE0 wellness, \u0111\xE0o t\u1EA1o t\u1EA1i Th\xE1i Lan.",
    specialties: ["Aromatherapy", "Wellness"],
    services: ["srv-003", "srv-005"]
  },
  {
    id: "prac-004",
    name: "Ph\u1EA1m Qu\u1ED1c \u0110\u1EA1t",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "K\u1EF9 thu\u1EADt vi\xEAn c\xF4ng ngh\u1EC7 cao, chuy\xEAn LED v\xE0 RF therapy.",
    specialties: ["Technology", "Skin Rejuvenation"],
    services: ["srv-001", "srv-004", "srv-006"]
  }
];
const bookings = [];
let bookingCounter = 1;
function createBooking(data) {
  const booking = {
    ...data,
    id: `bk-${String(bookingCounter++).padStart(4, "0")}`,
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  bookings.push(booking);
  return booking;
}
function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}
function getAvailableProducts() {
  return products.filter((p) => p.available);
}
function getPractitionersByService(serviceId) {
  return practitioners.filter((p) => p.services.includes(serviceId));
}
function getAvailableSlots(practitionerId, date) {
  const allSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00"
  ];
  const bookedSlots = bookings.filter((b) => b.practitioner === practitionerId && b.date === date && b.status !== "cancelled").map((b) => b.time);
  const bookedSet = new Set(bookedSlots);
  return allSlots.filter((s) => !bookedSet.has(s));
}
function getBookings(filter) {
  let result = [...bookings];
  if (filter == null ? void 0 : filter.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  if (filter == null ? void 0 : filter.date) {
    result = result.filter((b) => b.date === filter.date);
  }
  if (filter == null ? void 0 : filter.service) {
    result = result.filter((b) => b.service === filter.service);
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function getBookingById(id) {
  return bookings.find((b) => b.id === id);
}
function updateBookingStatus(id, status) {
  const booking = bookings.find((b) => b.id === id);
  if (booking) {
    booking.status = status;
    booking.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  return booking;
}
function deleteBooking(id) {
  const index = bookings.findIndex((b) => b.id === id);
  if (index !== -1) {
    bookings.splice(index, 1);
    return true;
  }
  return false;
}

function useRuntimeI18n(nuxtApp, event) {
  {
    return useRuntimeConfig(event).public.i18n;
  }
}
function useI18nDetection(nuxtApp) {
  const detectBrowserLanguage = useRuntimeI18n().detectBrowserLanguage;
  const detect = detectBrowserLanguage || {};
  return {
    ...detect,
    enabled: !!detectBrowserLanguage,
    cookieKey: detect.cookieKey || "i18n_redirected"
  };
}
function resolveRootRedirect(config) {
  if (!config) {
    return void 0;
  }
  return {
    path: "/" + (isString(config) ? config : config.path).replace(/^\//, ""),
    code: !isString(config) && config.statusCode || 302
  };
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function createLocaleConfigs(fallbackLocale) {
  const localeConfigs = {};
  for (const locale of localeCodes) {
    const fallbacks = getFallbackLocaleCodes(fallbackLocale, [locale]);
    const cacheable = isLocaleWithFallbacksCacheable(locale, fallbacks);
    localeConfigs[locale] = { fallbacks, cacheable };
  }
  return localeConfigs;
}
function getFallbackLocaleCodes(fallback, locales) {
  if (fallback === false) {
    return [];
  }
  if (isArray(fallback)) {
    return fallback;
  }
  let fallbackLocales = [];
  if (isString(fallback)) {
    if (locales.every((locale) => locale !== fallback)) {
      fallbackLocales.push(fallback);
    }
    return fallbackLocales;
  }
  const targets = [...locales, "default"];
  for (const locale of targets) {
    if (locale in fallback == false) {
      continue;
    }
    fallbackLocales = [...fallbackLocales, ...fallback[locale].filter(Boolean)];
  }
  return fallbackLocales;
}
function isLocaleCacheable(locale) {
  return localeLoaders[locale] != null && localeLoaders[locale].every((loader) => loader.cache !== false);
}
function isLocaleWithFallbacksCacheable(locale, fallbackLocales) {
  return isLocaleCacheable(locale) && fallbackLocales.every((fallbackLocale) => isLocaleCacheable(fallbackLocale));
}
function getDefaultLocaleForDomain(host) {
  return normalizedLocales.find((l) => !!l.defaultForDomains?.includes(host))?.code;
}
const isSupportedLocale = (locale) => localeCodes.includes(locale || "");

function useI18nContext(event) {
  if (event.context.nuxtI18n == null) {
    throw new Error("Nuxt I18n server context has not been set up yet.");
  }
  return event.context.nuxtI18n;
}
function tryUseI18nContext(event) {
  return event.context.nuxtI18n;
}
const getHost = (event) => getRequestURL(event, { xForwardedHost: true }).host;
async function initializeI18nContext(event) {
  const runtimeI18n = useRuntimeI18n(void 0, event);
  const defaultLocale = runtimeI18n.defaultLocale || "";
  const options = await setupVueI18nOptions(getDefaultLocaleForDomain(getHost(event)) || defaultLocale);
  const localeConfigs = createLocaleConfigs(options.fallbackLocale);
  const ctx = createI18nContext();
  ctx.vueI18nOptions = options;
  ctx.localeConfigs = localeConfigs;
  event.context.nuxtI18n = ctx;
  return ctx;
}
function createI18nContext() {
  return {
    messages: {},
    slp: {},
    localeConfigs: {},
    trackMap: {},
    vueI18nOptions: void 0,
    trackKey(key, locale) {
      this.trackMap[locale] ??= /* @__PURE__ */ new Set();
      this.trackMap[locale].add(key);
    }
  };
}

function matchBrowserLocale(locales, browserLocales) {
  const matchedLocales = [];
  for (const [index, browserCode] of browserLocales.entries()) {
    const matchedLocale = locales.find((l) => l.language?.toLowerCase() === browserCode.toLowerCase());
    if (matchedLocale) {
      matchedLocales.push({ code: matchedLocale.code, score: 1 - index / browserLocales.length });
      break;
    }
  }
  for (const [index, browserCode] of browserLocales.entries()) {
    const languageCode = browserCode.split("-")[0].toLowerCase();
    const matchedLocale = locales.find((l) => l.language?.split("-")[0].toLowerCase() === languageCode);
    if (matchedLocale) {
      matchedLocales.push({ code: matchedLocale.code, score: 0.999 - index / browserLocales.length });
      break;
    }
  }
  return matchedLocales;
}
function compareBrowserLocale(a, b) {
  if (a.score === b.score) {
    return b.code.length - a.code.length;
  }
  return b.score - a.score;
}
function findBrowserLocale(locales, browserLocales) {
  const matchedLocales = matchBrowserLocale(
    locales.map((l) => ({ code: l.code, language: l.language || l.code })),
    browserLocales
  );
  return matchedLocales.sort(compareBrowserLocale).at(0)?.code ?? "";
}

const appHead = {"link":[{"rel":"preconnect","href":"https://fonts.gstatic.com","crossorigin":""}],"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"},{"name":"geo.position","content":"10.7725;106.6784"},{"name":"geo.region","content":"VN-SG"},{"name":"geo.placename","content":"Ho Chi Minh City"},{"name":"ICBM","content":"10.7725, 106.6784"},{"property":"og:type","content":"website"}],"style":[],"script":[],"noscript":[],"htmlAttrs":{"lang":"en"},"charset":"utf-8","viewport":"width=device-width, initial-scale=1"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const separator = "___";
const pathLanguageParser = createPathIndexLanguageParser(0);
const getLocaleFromRoutePath = (path) => pathLanguageParser(path);
const getLocaleFromRouteName = (name) => name.split(separator).at(1) ?? "";
function normalizeInput(input) {
  return typeof input !== "object" ? String(input) : String(input?.name || input?.path || "");
}
function getLocaleFromRoute(route) {
  const input = normalizeInput(route);
  if (input[0] === "/") {
    return getLocaleFromRoutePath(input);
  }
  const fromName = getLocaleFromRouteName(input);
  if (fromName) {
    return fromName;
  }
  if (typeof route === "object" && route?.path) {
    return getLocaleFromRoutePath(String(route.path));
  }
  return "";
}

function matchDomainLocale(locales, host, pathLocale) {
  const normalizeDomain = (domain = "") => domain.replace(/https?:\/\//, "");
  const matches = locales.filter(
    (locale) => normalizeDomain(locale.domain) === host || toArray(locale.domains).includes(host)
  );
  if (matches.length <= 1) {
    return matches[0]?.code;
  }
  return (
    // match by current path locale
    matches.find((l) => l.code === pathLocale)?.code || matches.find((l) => l.defaultForDomains?.includes(host) ?? l.domainDefault)?.code
  );
}

const getCookieLocale = (event, cookieName) => (getCookie(event, cookieName)) || void 0;
const getRouteLocale = (event, route) => getLocaleFromRoute(route);
const getHeaderLocale = (event) => findBrowserLocale(normalizedLocales, parseAcceptLanguage(getRequestHeader(event, "accept-language") || ""));
const getHostLocale = (event, path, domainLocales) => {
  const host = getRequestURL(event, { xForwardedHost: true }).host;
  const locales = normalizedLocales.map((l) => ({
    ...l,
    domain: domainLocales[l.code]?.domain ?? l.domain
  }));
  return matchDomainLocale(locales, host, getLocaleFromRoutePath(path));
};
const useDetectors = (event, config, nuxtApp) => {
  if (!event) {
    throw new Error("H3Event is required for server-side locale detection");
  }
  const runtimeI18n = useRuntimeI18n();
  return {
    cookie: () => getCookieLocale(event, config.cookieKey),
    header: () => getHeaderLocale(event) ,
    navigator: () => void 0,
    host: (path) => getHostLocale(event, path, runtimeI18n.domainLocales),
    route: (path) => getRouteLocale(event, path)
  };
};

// Generated by @nuxtjs/i18n
const pathToI18nConfig = {
  "/": {
    "en": "/",
    "vi": "/"
  },
  "/individual": {
    "en": "/individual",
    "vi": "/individual"
  },
  "/booking": {
    "en": "/booking",
    "vi": "/booking"
  },
  "/business": {
    "en": "/business",
    "vi": "/business"
  },
  "/products": {
    "en": "/products",
    "vi": "/products"
  },
  "/products/:slug()": {
    "en": "/products/:slug()",
    "vi": "/products/:slug()"
  },
  "/sharing-hub": {
    "en": "/sharing-hub",
    "vi": "/sharing-hub"
  },
  "/sharing-hub/:slug()": {
    "en": "/sharing-hub/:slug()",
    "vi": "/sharing-hub/:slug()"
  },
  "/booking/confirmation": {
    "en": "/booking/confirmation",
    "vi": "/booking/confirmation"
  },
  "/business/recovery-event": {
    "en": "/business/recovery-event",
    "vi": "/business/recovery-event"
  },
  "/business/corporate-wellness": {
    "en": "/business/corporate-wellness",
    "vi": "/business/corporate-wellness"
  },
  "/business/education-training": {
    "en": "/business/education-training",
    "vi": "/business/education-training"
  }
};
const i18nPathToPath = {
  "/": "/",
  "/individual": "/individual",
  "/booking": "/booking",
  "/business": "/business",
  "/products": "/products",
  "/products/:slug()": "/products/:slug()",
  "/sharing-hub": "/sharing-hub",
  "/sharing-hub/:slug()": "/sharing-hub/:slug()",
  "/booking/confirmation": "/booking/confirmation",
  "/business/recovery-event": "/business/recovery-event",
  "/business/corporate-wellness": "/business/corporate-wellness",
  "/business/education-training": "/business/education-training"
};

const formatTrailingSlash = withoutTrailingSlash;
const matcher = createRouterMatcher([], {});
for (const path of Object.keys(i18nPathToPath)) {
  matcher.addRoute({ path, component: () => "", meta: {} });
}
const getI18nPathToI18nPath = (path, locale) => {
  if (!path || !locale) {
    return;
  }
  const plainPath = i18nPathToPath[path];
  const i18nConfig = pathToI18nConfig[plainPath];
  if (i18nConfig && i18nConfig[locale]) {
    return i18nConfig[locale] === true ? plainPath : i18nConfig[locale];
  }
};
function isExistingNuxtRoute(path) {
  if (path === "") {
    return;
  }
  if (path.endsWith("/__nuxt_error")) {
    return;
  }
  const resolvedMatch = matcher.resolve({ path }, { path: "/", name: "", matched: [], params: {}, meta: {} });
  return resolvedMatch.matched.length > 0 ? resolvedMatch : void 0;
}
function matchLocalized(path, locale, defaultLocale) {
  if (path === "") {
    return;
  }
  const parsed = parsePath(path);
  const resolvedMatch = matcher.resolve(
    { path: parsed.pathname || "/" },
    { path: "/", name: "", matched: [], params: {}, meta: {} }
  );
  if (resolvedMatch.matched.length > 0) {
    const alternate = getI18nPathToI18nPath(resolvedMatch.matched[0].path, locale);
    const match = matcher.resolve(
      { params: resolvedMatch.params },
      { path: alternate || "/", name: "", matched: [], params: {}, meta: {} }
    );
    const isPrefixable = prefixable(locale, defaultLocale);
    return formatTrailingSlash(withLeadingSlash(joinURL(isPrefixable ? locale : "", match.path)), true);
  }
}
function prefixable(currentLocale, defaultLocale) {
  return (currentLocale !== defaultLocale || "prefix_except_default" === "prefix");
}

function* detect(detectors, detection, path) {
  if (detection.enabled) {
    yield { locale: detectors.cookie(), source: "cookie" };
    yield { locale: detectors.header(), source: "header" };
  }
  {
    yield { locale: detectors.route(path), source: "route" };
  }
  yield { locale: detection.fallbackLocale, source: "fallback" };
}
function createRedirectResponse(event, dest, code) {
  event.node.res.setHeader("location", dest);
  event.node.res.statusCode = sanitizeStatusCode(code, event.node.res.statusCode);
  return {
    headers: event.node.res.getHeaders(),
    statusCode: event.node.res.statusCode,
    body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${dest.replace(/"/g, "%22")}"></head></html>`
  };
}
const _5bpHKerEXYZdUYZljZ_pSsvhbY5_brzK2cpkNEh9JKU = defineNitroPlugin(async (nitro) => {
  const runtimeI18n = useRuntimeI18n();
  const rootRedirect = resolveRootRedirect(runtimeI18n.rootRedirect);
  runtimeI18n.defaultLocale || "";
  try {
    const cacheStorage = useStorage("cache");
    const cachedKeys = await cacheStorage.getKeys("nitro:handlers:i18n");
    await Promise.all(cachedKeys.map((key) => cacheStorage.removeItem(key)));
  } catch {
  }
  const detection = useI18nDetection();
  const cookieOptions = {
    path: "/",
    domain: detection.cookieDomain || void 0,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: detection.cookieSecure
  };
  const createBaseUrlGetter = () => {
    isFunction(runtimeI18n.baseUrl) ? "" : runtimeI18n.baseUrl || "";
    if (isFunction(runtimeI18n.baseUrl)) {
      return () => "";
    }
    return (event, defaultLocale) => {
      return "";
    };
  };
  function resolveRedirectPath(event, path, pathLocale, defaultLocale, detector) {
    let locale = "";
    for (const detected of detect(detector, detection, event.path)) {
      if (detected.locale && isSupportedLocale(detected.locale)) {
        locale = detected.locale;
        break;
      }
    }
    locale ||= defaultLocale;
    function getLocalizedMatch(locale2) {
      const res = matchLocalized(path || "/", locale2, defaultLocale);
      if (res && res !== event.path) {
        return res;
      }
    }
    let resolvedPath = void 0;
    let redirectCode = 302;
    const requestURL = getRequestURL(event);
    if (rootRedirect && requestURL.pathname === "/") {
      locale = detection.enabled && locale || defaultLocale;
      resolvedPath = isSupportedLocale(detector.route(rootRedirect.path)) && rootRedirect.path || matchLocalized(rootRedirect.path, locale, defaultLocale);
      redirectCode = rootRedirect.code;
    } else if (runtimeI18n.redirectStatusCode) {
      redirectCode = runtimeI18n.redirectStatusCode;
    }
    switch (detection.redirectOn) {
      case "root":
        if (requestURL.pathname !== "/") {
          break;
        }
      // fallthrough (root has no prefix)
      case "no prefix":
        if (pathLocale) {
          break;
        }
      // fallthrough to resolve
      case "all":
        resolvedPath ??= getLocalizedMatch(locale);
        break;
    }
    if (requestURL.pathname === "/" && "prefix_except_default" === "prefix") ;
    return { path: resolvedPath, code: redirectCode, locale };
  }
  const baseUrlGetter = createBaseUrlGetter();
  nitro.hooks.hook("request", async (event) => {
    await initializeI18nContext(event);
  });
  nitro.hooks.hook("render:before", async (context) => {
    const { event } = context;
    const ctx = useI18nContext(event);
    const url = getRequestURL(event);
    const detector = useDetectors(event, detection);
    const localeSegment = detector.route(event.path);
    const pathLocale = isSupportedLocale(localeSegment) && localeSegment || void 0;
    const path = (pathLocale && url.pathname.slice(pathLocale.length + 1)) ?? url.pathname;
    if (!url.pathname.includes("/_i18n") && !isExistingNuxtRoute(path)) {
      return;
    }
    const resolved = resolveRedirectPath(event, path, pathLocale, ctx.vueI18nOptions.defaultLocale, detector);
    if (resolved.path && resolved.path !== url.pathname) {
      ctx.detectLocale = resolved.locale;
      detection.useCookie && setCookie(event, detection.cookieKey, resolved.locale, cookieOptions);
      context.response = createRedirectResponse(
        event,
        joinURL(baseUrlGetter(event, ctx.vueI18nOptions.defaultLocale), resolved.path + url.search),
        resolved.code
      );
      return;
    }
  });
  nitro.hooks.hook("render:html", (htmlContext, { event }) => {
    tryUseI18nContext(event);
  });
});

const plugins = [
  _XTi9nLEyfGJlB6ho5CZbhrfDT5ZLeTPqrlsOFzSmSSA,
_WRgSG0awsyUmoV4CYS9ShHpesmUUDl7Ewf5qWcIaEQ,
_QE7dIWPXqZY1lsrioLs4AfK_fknK9P6Rixk8NSyfck,
_5bpHKerEXYZdUYZljZ_pSsvhbY5_brzK2cpkNEh9JKU
];

const assets = {
  "/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6d197-xIc2QTn7PnhMFpz5cIVJKLLMsw0\"",
    "mtime": "2026-05-26T02:54:24.229Z",
    "size": 446871,
    "path": "../public/index.html"
  },
  "/monaco.jpeg": {
    "type": "image/jpeg",
    "etag": "\"14dea-TTpjqNmMHPsOMNqVtxFT5nJRUwM\"",
    "mtime": "2026-04-30T01:36:10.763Z",
    "size": 85482,
    "path": "../public/monaco.jpeg"
  },
  "/active-who.png": {
    "type": "image/png",
    "etag": "\"b0ca5-CQYKizKnkrtJTh9gUcYgi99B508\"",
    "mtime": "2026-05-19T03:42:34.137Z",
    "size": 724133,
    "path": "../public/active-who.png"
  },
  "/booking-hero-new.png": {
    "type": "image/png",
    "etag": "\"b8154-WMMYmLvJEUwL+zHa5FV4RMdlNHU\"",
    "mtime": "2026-04-29T16:10:43.423Z",
    "size": 754004,
    "path": "../public/booking-hero-new.png"
  },
  "/athlete-who.png": {
    "type": "image/png",
    "etag": "\"c5ec2-gLwLocgjfM+V3NoP32uP6f127QI\"",
    "mtime": "2026-05-06T15:40:44.485Z",
    "size": 810690,
    "path": "../public/athlete-who.png"
  },
  "/business_solution_sidebar.png": {
    "type": "image/png",
    "etag": "\"afc8b-q2wGzeEy6AJf/DcGYa6uNusR93c\"",
    "mtime": "2026-05-24T12:50:05.415Z",
    "size": 720011,
    "path": "../public/business_solution_sidebar.png"
  },
  "/education-gallery-2.png": {
    "type": "image/png",
    "etag": "\"aa974-ghM7hhMcJDNPIrNLUWro9VgJusw\"",
    "mtime": "2026-05-19T16:08:51.943Z",
    "size": 698740,
    "path": "../public/education-gallery-2.png"
  },
  "/education-gallery-1.png": {
    "type": "image/png",
    "etag": "\"9f5ca-te8Agu+pM41HVhkFozueQ8aGHrs\"",
    "mtime": "2026-05-19T16:08:38.670Z",
    "size": 652746,
    "path": "../public/education-gallery-1.png"
  },
  "/education-class.png": {
    "type": "image/png",
    "etag": "\"b7769-y+SQZqniPkeA01Y+9uMmpmhBS9Q\"",
    "mtime": "2026-05-06T16:15:25.154Z",
    "size": 751465,
    "path": "../public/education-class.png"
  },
  "/corporate-sports.png": {
    "type": "image/png",
    "etag": "\"eabc0-CTDcey4x9ldlTsu0y8zsqxMnpMY\"",
    "mtime": "2026-05-06T15:54:22.721Z",
    "size": 961472,
    "path": "../public/corporate-sports.png"
  },
  "/education-gallery-3.png": {
    "type": "image/png",
    "etag": "\"c08c2-GYngCT8yxrq+37LHBhcqClD5uno\"",
    "mtime": "2026-05-19T16:09:09.983Z",
    "size": 788674,
    "path": "../public/education-gallery-3.png"
  },
  "/education-gallery-4.png": {
    "type": "image/png",
    "etag": "\"b7fab-Lbk74m3Zd7CVtiAma27Wk4bWVhY\"",
    "mtime": "2026-05-19T16:09:27.308Z",
    "size": 753579,
    "path": "../public/education-gallery-4.png"
  },
  "/education-hero.png": {
    "type": "image/png",
    "etag": "\"b5d32-4I0ygE/zr36Ij/SRjMS5HKUMtAo\"",
    "mtime": "2026-05-06T15:54:38.363Z",
    "size": 744754,
    "path": "../public/education-hero.png"
  },
  "/education-gallery-5.png": {
    "type": "image/png",
    "etag": "\"ed3ee-+PEGg6sTdjsI+aHX41jPTyOXvM0\"",
    "mtime": "2026-05-19T16:09:44.550Z",
    "size": 971758,
    "path": "../public/education-gallery-5.png"
  },
  "/education-workshop.png": {
    "type": "image/png",
    "etag": "\"c5115-cWPb2uhzWCqrL8c+jzwqfupZqKY\"",
    "mtime": "2026-05-19T16:06:58.380Z",
    "size": 807189,
    "path": "../public/education-workshop.png"
  },
  "/event-booth.png": {
    "type": "image/png",
    "etag": "\"d26b9-cHd5l94YbaTbGgbL18olj7B5mM4\"",
    "mtime": "2026-05-06T15:56:15.524Z",
    "size": 861881,
    "path": "../public/event-booth.png"
  },
  "/event-response.png": {
    "type": "image/png",
    "etag": "\"e1081-dkdHuXivgDyCpDX2APiZ5TJQREQ\"",
    "mtime": "2026-05-06T15:56:48.418Z",
    "size": 921729,
    "path": "../public/event-response.png"
  },
  "/experiencing-pain-absolute.png": {
    "type": "image/png",
    "etag": "\"9d657-Da347AKed5oqNRZlz8jOiwwfIj0\"",
    "mtime": "2026-05-19T04:14:44.928Z",
    "size": 644695,
    "path": "../public/experiencing-pain-absolute.png"
  },
  "/hero-physiotherapy.png": {
    "type": "image/png",
    "etag": "\"b699b-g6igEx2exJRjTzYzGUzTStXxVa0\"",
    "mtime": "2026-04-27T08:24:15.453Z",
    "size": 747931,
    "path": "../public/hero-physiotherapy.png"
  },
  "/individual-hero.png": {
    "type": "image/png",
    "etag": "\"b134e-1+0Qkigpdl4KK3nyVoXMzxbtPUE\"",
    "mtime": "2026-05-05T03:20:50.126Z",
    "size": 725838,
    "path": "../public/individual-hero.png"
  },
  "/monaco-healthcare.png": {
    "type": "image/png",
    "etag": "\"a9ec5-MAXJwauxWvxWgHLYG14TKzcR2JE\"",
    "mtime": "2026-04-27T08:24:30.394Z",
    "size": 696005,
    "path": "../public/monaco-healthcare.png"
  },
  "/office-who.png": {
    "type": "image/png",
    "etag": "\"b69d9-BpZKqTnsDMLptDulH7oAlJ5Q5e4\"",
    "mtime": "2026-05-06T15:40:27.493Z",
    "size": 747993,
    "path": "../public/office-who.png"
  },
  "/event-flow.png": {
    "type": "image/png",
    "etag": "\"1119f7-lR6P8lCLIrVqe1jwAUSd2yekM7o\"",
    "mtime": "2026-05-06T15:56:30.712Z",
    "size": 1120759,
    "path": "../public/event-flow.png"
  },
  "/event-warmup.png": {
    "type": "image/png",
    "etag": "\"109be7-mp8YNZieiP+9AnZPlO4hmnoSoAI\"",
    "mtime": "2026-05-06T15:57:08.284Z",
    "size": 1088487,
    "path": "../public/event-warmup.png"
  },
  "/marathon.png": {
    "type": "image/png",
    "etag": "\"11022f-wtIUuUJ2/Omw+QxGSAfiX5I3Ryw\"",
    "mtime": "2026-05-06T15:53:42.879Z",
    "size": 1114671,
    "path": "../public/marathon.png"
  },
  "/sitemap_index.xml": {
    "type": "application/xml",
    "etag": "\"1c8-zYsMQ2bcyZzLqxg2kweZj98XZGs\"",
    "mtime": "2026-05-26T02:56:01.584Z",
    "size": 456,
    "path": "../public/sitemap_index.xml"
  },
  "/stretch.jpg": {
    "type": "image/jpeg",
    "etag": "\"268f-mwJOnfXF9XvhasTYkSXfCxzqLhM\"",
    "mtime": "2026-05-10T16:34:15.186Z",
    "size": 9871,
    "path": "../public/stretch.jpg"
  },
  "/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-iX3/PvnNt71rRhtk1HxIgoaP1NQ\"",
    "mtime": "2026-05-26T02:54:24.378Z",
    "size": 69,
    "path": "../public/_payload.json"
  },
  "/_robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"50-zzzWaqE25NQjMeC1jpaotO8d7O8\"",
    "mtime": "2026-05-24T13:08:34.944Z",
    "size": 80,
    "path": "../public/_robots.txt"
  },
  "/booking/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:09.658Z",
    "size": 69,
    "path": "../public/booking/_payload.json"
  },
  "/business/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:05.285Z",
    "size": 69,
    "path": "../public/business/_payload.json"
  },
  "/css/nuxt-google-fonts.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4a60-YBxKIxNTao75dXl0jutZVfh3U0M\"",
    "mtime": "2026-05-25T07:20:36.464Z",
    "size": 19040,
    "path": "../public/css/nuxt-google-fonts.css"
  },
  "/booking/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"63d6d-ParhB3w0q9Hja4Yr5hwvBrrPvvc\"",
    "mtime": "2026-05-26T02:55:00.772Z",
    "size": 408941,
    "path": "../public/booking/index.html"
  },
  "/business/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"68b5e-emkR7YmUiXpkMXBxKQXaeOK4KmY\"",
    "mtime": "2026-05-26T02:54:53.557Z",
    "size": 428894,
    "path": "../public/business/index.html"
  },
  "/older-who.png": {
    "type": "image/png",
    "etag": "\"a447d-dczV15jo/L/3e5DyScpDor+LXKw\"",
    "mtime": "2026-05-19T03:42:52.269Z",
    "size": 672893,
    "path": "../public/older-who.png"
  },
  "/pickleball.png": {
    "type": "image/png",
    "etag": "\"e7799-VHKhWmQFDcPSzhUiodz4YuvcbYs\"",
    "mtime": "2026-05-06T15:53:26.738Z",
    "size": 948121,
    "path": "../public/pickleball.png"
  },
  "/individual/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:00.879Z",
    "size": 69,
    "path": "../public/individual/_payload.json"
  },
  "/individual/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6ba3b-Wvpiz3yZVVWs33/T5x2CzUr37wY\"",
    "mtime": "2026-05-26T02:54:50.021Z",
    "size": 440891,
    "path": "../public/individual/index.html"
  },
  "/logos/decathlon.png": {
    "type": "image/png",
    "etag": "\"107ae-Rb8V7Tuy7aUbZYwOaGvMOTVkjfg\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 67502,
    "path": "../public/logos/decathlon.png"
  },
  "/runner-who.png": {
    "type": "image/png",
    "etag": "\"c7f72-J/66RJH2mcZATCmzMGxYMTyqppw\"",
    "mtime": "2026-05-06T15:40:12.724Z",
    "size": 819058,
    "path": "../public/runner-who.png"
  },
  "/recovery-who.png": {
    "type": "image/png",
    "etag": "\"b753a-duqz2FgA0R2BOkgJ/apLJ2DX7dM\"",
    "mtime": "2026-05-06T15:40:59.866Z",
    "size": 750906,
    "path": "../public/recovery-who.png"
  },
  "/tennis.png": {
    "type": "image/png",
    "etag": "\"b532b-ySN7cL20VkxbKFdSSCPw53R5Of0\"",
    "mtime": "2026-05-06T15:54:01.448Z",
    "size": 742187,
    "path": "../public/tennis.png"
  },
  "/logos/garmin.png": {
    "type": "image/png",
    "etag": "\"3c82-iiioGqCJbswk4ffsCjLVQKQguX8\"",
    "mtime": "2026-05-07T04:33:04.196Z",
    "size": 15490,
    "path": "../public/logos/garmin.png"
  },
  "/logos/hyrox.webp": {
    "type": "image/webp",
    "etag": "\"616-BjObIUbEmX2aviJ0smC9t6Kpvbo\"",
    "mtime": "2026-05-07T04:32:45.262Z",
    "size": 1558,
    "path": "../public/logos/hyrox.webp"
  },
  "/images/education-solution.png": {
    "type": "image/png",
    "etag": "\"b5d32-4I0ygE/zr36Ij/SRjMS5HKUMtAo\"",
    "mtime": "2026-05-06T15:54:38.363Z",
    "size": 744754,
    "path": "../public/images/education-solution.png"
  },
  "/images/business-hero.png": {
    "type": "image/png",
    "etag": "\"eabc0-CTDcey4x9ldlTsu0y8zsqxMnpMY\"",
    "mtime": "2026-05-06T15:54:22.721Z",
    "size": 961472,
    "path": "../public/images/business-hero.png"
  },
  "/images/event-solution.png": {
    "type": "image/png",
    "etag": "\"d26b9-cHd5l94YbaTbGgbL18olj7B5mM4\"",
    "mtime": "2026-05-06T15:56:15.524Z",
    "size": 861881,
    "path": "../public/images/event-solution.png"
  },
  "/images/man-neck-pain.png": {
    "type": "image/png",
    "etag": "\"aadd9-CCS738mm2gquOipzYo1L1sVhIFg\"",
    "mtime": "2026-05-19T10:11:22.510Z",
    "size": 699865,
    "path": "../public/images/man-neck-pain.png"
  },
  "/images/wellness-solution.png": {
    "type": "image/png",
    "etag": "\"c5ec2-gLwLocgjfM+V3NoP32uP6f127QI\"",
    "mtime": "2026-05-06T15:40:44.485Z",
    "size": 810690,
    "path": "../public/images/wellness-solution.png"
  },
  "/logos/ironman.png": {
    "type": "image/png",
    "etag": "\"6be8a-N7NXOprZTOKsL31anxRi0jT2YSQ\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 441994,
    "path": "../public/logos/ironman.png"
  },
  "/logos/lululemon.webp": {
    "type": "image/webp",
    "etag": "\"274a-TXz/KYfrOsU4r48hEMD/CAgRCFE\"",
    "mtime": "2026-05-07T04:33:25.816Z",
    "size": 10058,
    "path": "../public/logos/lululemon.webp"
  },
  "/logos/partner-1.png": {
    "type": "image/png",
    "etag": "\"1816c-HRBfaFjQDXxwi+9GgQQMKZ7PwDg\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 98668,
    "path": "../public/logos/partner-1.png"
  },
  "/logos/partner-10.png": {
    "type": "image/png",
    "etag": "\"1ffcc-/5VcWnj5WG4OJFVpAiMlbpCFnug\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 131020,
    "path": "../public/logos/partner-10.png"
  },
  "/logos/partner-11.png": {
    "type": "image/png",
    "etag": "\"46ae9-UuvM+KAdo6huHq51Yim9RadlW8Y\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 289513,
    "path": "../public/logos/partner-11.png"
  },
  "/logos/pickleball-vietnam.png": {
    "type": "image/png",
    "etag": "\"5fc31-ExJgxcEHP7PISVb8TUyfetd5o+A\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 392241,
    "path": "../public/logos/pickleball-vietnam.png"
  },
  "/products/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:02.469Z",
    "size": 69,
    "path": "../public/products/_payload.json"
  },
  "/fonts/Inter-normal-300-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-25T07:20:35.261Z",
    "size": 25960,
    "path": "../public/fonts/Inter-normal-300-cyrillic-ext.woff2"
  },
  "/logos/partner-13.png": {
    "type": "image/png",
    "etag": "\"7cb91-UcqqcZI5PZcg4vXznWthtqosYY0\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 510865,
    "path": "../public/logos/partner-13.png"
  },
  "/products/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"631da-R1f7G/uzfImR8gkUFnK8jQGsLzw\"",
    "mtime": "2026-05-26T02:54:50.022Z",
    "size": 405978,
    "path": "../public/products/index.html"
  },
  "/fonts/Inter-normal-300-cyrillic.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-25T07:20:35.476Z",
    "size": 18748,
    "path": "../public/fonts/Inter-normal-300-cyrillic.woff2"
  },
  "/fonts/Inter-normal-300-greek-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-25T07:20:35.547Z",
    "size": 11232,
    "path": "../public/fonts/Inter-normal-300-greek-ext.woff2"
  },
  "/fonts/Inter-normal-300-greek.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-25T07:20:35.626Z",
    "size": 18996,
    "path": "../public/fonts/Inter-normal-300-greek.woff2"
  },
  "/fonts/Inter-normal-300-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-25T07:20:35.851Z",
    "size": 85068,
    "path": "../public/fonts/Inter-normal-300-latin-ext.woff2"
  },
  "/fonts/Inter-normal-300-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-25T07:20:35.961Z",
    "size": 48256,
    "path": "../public/fonts/Inter-normal-300-latin.woff2"
  },
  "/fonts/Inter-normal-300-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-25T07:20:35.693Z",
    "size": 10252,
    "path": "../public/fonts/Inter-normal-300-vietnamese.woff2"
  },
  "/fonts/Inter-normal-400-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-25T07:20:35.261Z",
    "size": 25960,
    "path": "../public/fonts/Inter-normal-400-cyrillic-ext.woff2"
  },
  "/fonts/Inter-normal-400-cyrillic.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-25T07:20:35.476Z",
    "size": 18748,
    "path": "../public/fonts/Inter-normal-400-cyrillic.woff2"
  },
  "/fonts/Inter-normal-400-greek-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-25T07:20:35.547Z",
    "size": 11232,
    "path": "../public/fonts/Inter-normal-400-greek-ext.woff2"
  },
  "/fonts/Inter-normal-400-greek.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-25T07:20:35.626Z",
    "size": 18996,
    "path": "../public/fonts/Inter-normal-400-greek.woff2"
  },
  "/fonts/Inter-normal-400-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-25T07:20:35.851Z",
    "size": 85068,
    "path": "../public/fonts/Inter-normal-400-latin-ext.woff2"
  },
  "/fonts/Inter-normal-400-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-25T07:20:35.961Z",
    "size": 48256,
    "path": "../public/fonts/Inter-normal-400-latin.woff2"
  },
  "/fonts/Inter-normal-400-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-25T07:20:35.693Z",
    "size": 10252,
    "path": "../public/fonts/Inter-normal-400-vietnamese.woff2"
  },
  "/fonts/Inter-normal-500-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-25T07:20:35.261Z",
    "size": 25960,
    "path": "../public/fonts/Inter-normal-500-cyrillic-ext.woff2"
  },
  "/fonts/Inter-normal-500-cyrillic.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-25T07:20:35.476Z",
    "size": 18748,
    "path": "../public/fonts/Inter-normal-500-cyrillic.woff2"
  },
  "/logos/partner-12.png": {
    "type": "image/png",
    "etag": "\"1209e1-ymE+Xi0IcwOBg6GRLLb3ttJajVk\"",
    "mtime": "2026-05-06T08:42:10.000Z",
    "size": 1182177,
    "path": "../public/logos/partner-12.png"
  },
  "/fonts/Inter-normal-500-greek-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-25T07:20:35.547Z",
    "size": 11232,
    "path": "../public/fonts/Inter-normal-500-greek-ext.woff2"
  },
  "/fonts/Inter-normal-500-greek.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-25T07:20:35.626Z",
    "size": 18996,
    "path": "../public/fonts/Inter-normal-500-greek.woff2"
  },
  "/fonts/Inter-normal-500-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-25T07:20:35.693Z",
    "size": 10252,
    "path": "../public/fonts/Inter-normal-500-vietnamese.woff2"
  },
  "/fonts/Inter-normal-500-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-25T07:20:35.851Z",
    "size": 85068,
    "path": "../public/fonts/Inter-normal-500-latin-ext.woff2"
  },
  "/fonts/Inter-normal-500-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-25T07:20:35.961Z",
    "size": 48256,
    "path": "../public/fonts/Inter-normal-500-latin.woff2"
  },
  "/fonts/Inter-normal-600-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-25T07:20:35.261Z",
    "size": 25960,
    "path": "../public/fonts/Inter-normal-600-cyrillic-ext.woff2"
  },
  "/fonts/Inter-normal-600-cyrillic.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-25T07:20:35.476Z",
    "size": 18748,
    "path": "../public/fonts/Inter-normal-600-cyrillic.woff2"
  },
  "/fonts/Inter-normal-600-greek-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-25T07:20:35.547Z",
    "size": 11232,
    "path": "../public/fonts/Inter-normal-600-greek-ext.woff2"
  },
  "/fonts/Inter-normal-600-greek.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-25T07:20:35.626Z",
    "size": 18996,
    "path": "../public/fonts/Inter-normal-600-greek.woff2"
  },
  "/fonts/Inter-normal-600-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-25T07:20:35.851Z",
    "size": 85068,
    "path": "../public/fonts/Inter-normal-600-latin-ext.woff2"
  },
  "/fonts/Inter-normal-600-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-25T07:20:35.961Z",
    "size": 48256,
    "path": "../public/fonts/Inter-normal-600-latin.woff2"
  },
  "/fonts/Inter-normal-600-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-25T07:20:35.693Z",
    "size": 10252,
    "path": "../public/fonts/Inter-normal-600-vietnamese.woff2"
  },
  "/fonts/Inter-normal-700-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-25T07:20:35.261Z",
    "size": 25960,
    "path": "../public/fonts/Inter-normal-700-cyrillic-ext.woff2"
  },
  "/fonts/Inter-normal-700-cyrillic.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-25T07:20:35.476Z",
    "size": 18748,
    "path": "../public/fonts/Inter-normal-700-cyrillic.woff2"
  },
  "/fonts/Inter-normal-700-greek-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-25T07:20:35.547Z",
    "size": 11232,
    "path": "../public/fonts/Inter-normal-700-greek-ext.woff2"
  },
  "/fonts/Inter-normal-700-greek.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-25T07:20:35.626Z",
    "size": 18996,
    "path": "../public/fonts/Inter-normal-700-greek.woff2"
  },
  "/fonts/Inter-normal-700-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-25T07:20:35.851Z",
    "size": 85068,
    "path": "../public/fonts/Inter-normal-700-latin-ext.woff2"
  },
  "/fonts/Inter-normal-700-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-25T07:20:35.961Z",
    "size": 48256,
    "path": "../public/fonts/Inter-normal-700-latin.woff2"
  },
  "/fonts/Inter-normal-700-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-25T07:20:35.693Z",
    "size": 10252,
    "path": "../public/fonts/Inter-normal-700-vietnamese.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-400-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6b4-nyAHvF050yhgsa69LUWkrBLUegE\"",
    "mtime": "2026-05-25T07:20:36.255Z",
    "size": 1716,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-400-cyrillic-ext.woff2"
  },
  "/fonts/Material_Symbols_Outlined-normal-400-fallback.woff2": {
    "type": "font/woff2",
    "etag": "\"4dd74-1Qe7XUFqrD1LJLng2L7Jwb8mPWo\"",
    "mtime": "2026-05-25T07:20:36.195Z",
    "size": 318836,
    "path": "../public/fonts/Material_Symbols_Outlined-normal-400-fallback.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-400-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-25T07:20:36.380Z",
    "size": 21728,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-400-latin-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-400-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-25T07:20:36.439Z",
    "size": 27348,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-400-latin.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-400-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-25T07:20:36.310Z",
    "size": 8352,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-400-vietnamese.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-500-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6b4-nyAHvF050yhgsa69LUWkrBLUegE\"",
    "mtime": "2026-05-25T07:20:36.255Z",
    "size": 1716,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-500-cyrillic-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-500-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-25T07:20:36.380Z",
    "size": 21728,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-500-latin-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-500-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-25T07:20:36.439Z",
    "size": 27348,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-500-latin.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-500-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-25T07:20:36.310Z",
    "size": 8352,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-500-vietnamese.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-600-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6b4-nyAHvF050yhgsa69LUWkrBLUegE\"",
    "mtime": "2026-05-25T07:20:36.255Z",
    "size": 1716,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-600-cyrillic-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-600-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-25T07:20:36.380Z",
    "size": 21728,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-600-latin-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-600-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-25T07:20:36.439Z",
    "size": 27348,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-600-latin.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-600-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-25T07:20:36.310Z",
    "size": 8352,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-600-vietnamese.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-700-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6b4-nyAHvF050yhgsa69LUWkrBLUegE\"",
    "mtime": "2026-05-25T07:20:36.255Z",
    "size": 1716,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-700-cyrillic-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-700-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-25T07:20:36.380Z",
    "size": 21728,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-700-latin-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-700-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-25T07:20:36.439Z",
    "size": 27348,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-700-latin.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-700-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-25T07:20:36.310Z",
    "size": 8352,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-700-vietnamese.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-800-cyrillic-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"6b4-nyAHvF050yhgsa69LUWkrBLUegE\"",
    "mtime": "2026-05-25T07:20:36.255Z",
    "size": 1716,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-800-cyrillic-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-800-latin-ext.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-25T07:20:36.380Z",
    "size": 21728,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-800-latin-ext.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-800-latin.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-25T07:20:36.439Z",
    "size": 27348,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-800-latin.woff2"
  },
  "/fonts/Plus_Jakarta_Sans-normal-800-vietnamese.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-25T07:20:36.310Z",
    "size": 8352,
    "path": "../public/fonts/Plus_Jakarta_Sans-normal-800-vietnamese.woff2"
  },
  "/sharing-hub/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:12.491Z",
    "size": 69,
    "path": "../public/sharing-hub/_payload.json"
  },
  "/vi/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:54:30.032Z",
    "size": 69,
    "path": "../public/vi/_payload.json"
  },
  "/sharing-hub/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6c4cf-Hl6+6dp1RO7BNlHlT0d26/olzjU\"",
    "mtime": "2026-05-26T02:55:10.383Z",
    "size": 443599,
    "path": "../public/sharing-hub/index.html"
  },
  "/sitemap.xml/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"68-l9jsPo6sU6PxyzeP+P1pUxbRoP0\"",
    "mtime": "2026-05-26T02:55:00.800Z",
    "size": 104,
    "path": "../public/sitemap.xml/index.html"
  },
  "/_nuxt/3Znj8jxX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8786-Sn3fqbXuZb2bRC3w1fcL7lRS1iI\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 34694,
    "path": "../public/_nuxt/3Znj8jxX.js"
  },
  "/_nuxt/AVq_Xgt2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1da-7wSdXJ2wncZk4jJW1FMXsOcxuPk\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 474,
    "path": "../public/_nuxt/AVq_Xgt2.js"
  },
  "/vi/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6d837-WDd3tW32Q/sHbFKhIA9Y6pMk/0Y\"",
    "mtime": "2026-05-26T02:54:29.745Z",
    "size": 448567,
    "path": "../public/vi/index.html"
  },
  "/_nuxt/B0G2rvtq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-nszi/UeXhBBgbfrpU1IjJjR1jmE\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 181,
    "path": "../public/_nuxt/B0G2rvtq.js"
  },
  "/_nuxt/BAz4hE9E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44-mgfbOMygqb7RJ6R/hQRaErMa4Jg\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 68,
    "path": "../public/_nuxt/BAz4hE9E.js"
  },
  "/_nuxt/BBMq8NxX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19a-W3GEQMYIbAKTsC8Rvog9JqlkVDI\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 410,
    "path": "../public/_nuxt/BBMq8NxX.js"
  },
  "/_nuxt/BEE6yN7P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4919-s2nx+tkMFiFT9By4Lz0O3zzCNr8\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 18713,
    "path": "../public/_nuxt/BEE6yN7P.js"
  },
  "/_nuxt/Bf70iHZb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8-CUS+D+XBU3ihGVWD2fod55n4Ty4\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 184,
    "path": "../public/_nuxt/Bf70iHZb.js"
  },
  "/_nuxt/BGH7YAsi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"58b-CGrVVRFkdYphIToWkmktWDnrV5k\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 1419,
    "path": "../public/_nuxt/BGH7YAsi.js"
  },
  "/_nuxt/BGuc5JYX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3be6-VGVGJRPSldkfihaxcP54VlEh7qo\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 15334,
    "path": "../public/_nuxt/BGuc5JYX.js"
  },
  "/_nuxt/BHahgWi1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22d2-7Mm1EpvpwNSBK9NbxHjb5+Ec57Q\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 8914,
    "path": "../public/_nuxt/BHahgWi1.js"
  },
  "/_nuxt/BHSW8NSn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-QvGfCocKc8cPYBu8QEvZCGGKXqE\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 181,
    "path": "../public/_nuxt/BHSW8NSn.js"
  },
  "/_nuxt/BN3Cva8V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c-wpZ/Su8hV2h6GbzH/sGJfbJXPWg\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 76,
    "path": "../public/_nuxt/BN3Cva8V.js"
  },
  "/_nuxt/BNOFNpMO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17c-FAIomGopLhW3v0le+dCnu04azqM\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 380,
    "path": "../public/_nuxt/BNOFNpMO.js"
  },
  "/_nuxt/Bn_v0ZTE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-+6QFnZ/Oe5E8zgQ5suNutXIv1f0\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 497,
    "path": "../public/_nuxt/Bn_v0ZTE.js"
  },
  "/_nuxt/BOedWFQS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11e1-lr7xFRPo4N0ax8ec55u3iurIszA\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 4577,
    "path": "../public/_nuxt/BOedWFQS.js"
  },
  "/_nuxt/BQbHJvdX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f65-eV+JFv52miWM7knXyHEM9+CrAq4\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 3941,
    "path": "../public/_nuxt/BQbHJvdX.js"
  },
  "/_nuxt/BrrT5jqJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-XdQzdJzwCiDitWaTNQgInhR5CCM\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 181,
    "path": "../public/_nuxt/BrrT5jqJ.js"
  },
  "/_nuxt/BusinessFloatingBar.BYzkDVkR.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"14e-G0I3re/Mc2VoeEpUzF2nLEfHQg0\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 334,
    "path": "../public/_nuxt/BusinessFloatingBar.BYzkDVkR.css"
  },
  "/_nuxt/BvZ422KL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28e-ScrszV1HnsGmpxiIBZdrG+nzu6I\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 654,
    "path": "../public/_nuxt/BvZ422KL.js"
  },
  "/_nuxt/BW1aH-wF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c2ff-lhcxr87FFD9SijnMsla8TEGhbb8\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 49919,
    "path": "../public/_nuxt/BW1aH-wF.js"
  },
  "/_nuxt/BwX-H-NI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-lBWZFr4lpnM/2dNGkYj40cuAPWw\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 497,
    "path": "../public/_nuxt/BwX-H-NI.js"
  },
  "/_nuxt/BxeCF2g4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-MoMRJEqzZoU0VD9yoaOz1jI9in0\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 181,
    "path": "../public/_nuxt/BxeCF2g4.js"
  },
  "/_nuxt/BybWsiNa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b0-0IJoHIHcAWE7H83A2/GgY5TccGU\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 176,
    "path": "../public/_nuxt/BybWsiNa.js"
  },
  "/_nuxt/B_6b1GwI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"669a-xcTzHwTwhk1lIR2QrsV/qMk7BDc\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 26266,
    "path": "../public/_nuxt/B_6b1GwI.js"
  },
  "/_nuxt/C0VPxgAy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"50d7-C33XDSfuySBoEC4z6IRUW2Hdzus\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 20695,
    "path": "../public/_nuxt/C0VPxgAy.js"
  },
  "/_nuxt/C28B4KHx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"486b-TOEPeUG/8fxfc3Jz2gR1lJ0xNG8\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 18539,
    "path": "../public/_nuxt/C28B4KHx.js"
  },
  "/_nuxt/CC3dvXhr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"275-qm6CvCAIDh200oBe3f/PzBucAd4\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 629,
    "path": "../public/_nuxt/CC3dvXhr.js"
  },
  "/_nuxt/CcmykWBB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-43vCFi7hTjGW3Qi0OT5Gd8FXnlU\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 497,
    "path": "../public/_nuxt/CcmykWBB.js"
  },
  "/_nuxt/CI9LrJGq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"532d-/6ZccLj3KIp0xSo0a3vyfBumVb0\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 21293,
    "path": "../public/_nuxt/CI9LrJGq.js"
  },
  "/_nuxt/CJIyHN0c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b9-igIBawvG8rGvqVZdvq2JkZzJv7U\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 185,
    "path": "../public/_nuxt/CJIyHN0c.js"
  },
  "/_nuxt/CjO2bvty.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-Q0aTDU82/8XhEWVAIEpiEJkt4rQ\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 497,
    "path": "../public/_nuxt/CjO2bvty.js"
  },
  "/_nuxt/Cn9tRWou.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b2-I02auliZvn0uGjSC+H0vr/XCkn0\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 178,
    "path": "../public/_nuxt/Cn9tRWou.js"
  },
  "/_nuxt/CXWY7gyr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"325-L5ENCDr7AsxSzyRzPyO6L7yKrwo\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 805,
    "path": "../public/_nuxt/CXWY7gyr.js"
  },
  "/_nuxt/CVVVJyqS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8-nxm8/OSII47E7qqlsnUb3q89vnw\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 184,
    "path": "../public/_nuxt/CVVVJyqS.js"
  },
  "/_nuxt/DAAL0uTl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ebca-ZiYGMKpKcuIgL0mdlY5WSEmJTns\"",
    "mtime": "2026-05-26T02:53:58.165Z",
    "size": 60362,
    "path": "../public/_nuxt/DAAL0uTl.js"
  },
  "/_nuxt/DOPwhF40.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-Jtks1RZsPzGNBNEvPPVKPkWLaec\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 181,
    "path": "../public/_nuxt/DOPwhF40.js"
  },
  "/_nuxt/Du8763xm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"805-SS1LTFTb/37vlYq8hTanTmeYvwQ\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 2053,
    "path": "../public/_nuxt/Du8763xm.js"
  },
  "/_nuxt/DUlXcSuw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1502-yk+bP+usJfnZIZZaouMMKQ/La6k\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 5378,
    "path": "../public/_nuxt/DUlXcSuw.js"
  },
  "/_nuxt/DVFSL4-r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-nUVtS0ej13RXTxfzJo5PGOBfhXY\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 497,
    "path": "../public/_nuxt/DVFSL4-r.js"
  },
  "/_nuxt/DVVhfgxb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b4-f8Md55tmWGzry+JHI9uhMw/FywM\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 180,
    "path": "../public/_nuxt/DVVhfgxb.js"
  },
  "/_nuxt/Dz7mTXWY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"47c6-auCEIBErw8f5GWDK51RK8F2RQro\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 18374,
    "path": "../public/_nuxt/Dz7mTXWY.js"
  },
  "/_nuxt/DztY6deI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2a-Wr98q9YNmm75BNwyZl5Hr7YSOUo\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 3370,
    "path": "../public/_nuxt/DztY6deI.js"
  },
  "/_nuxt/Cm1dbU98.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8c94b-8MPXeOU35eKongrDqIQleE2NsZg\"",
    "mtime": "2026-05-26T02:53:58.166Z",
    "size": 575819,
    "path": "../public/_nuxt/Cm1dbU98.js"
  },
  "/_nuxt/D_Sdmlx6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eb-H/Sk2VOtqahDgnUgQxZvU//Ty0g\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 491,
    "path": "../public/_nuxt/D_Sdmlx6.js"
  },
  "/_nuxt/education-training.vSYuJD1K.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"30f-Ovedsys2RWqxCs5h+Qoy53T0kN8\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 783,
    "path": "../public/_nuxt/education-training.vSYuJD1K.css"
  },
  "/_nuxt/entry.DvhcCqUD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4e1-VEg3848bmSbTfTmtKuwgHLh2YZY\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 1249,
    "path": "../public/_nuxt/entry.DvhcCqUD.css"
  },
  "/_nuxt/error-404.DL_4WIao.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"dca-KnjyV0UbpsrliiJzZx69defY74k\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 3530,
    "path": "../public/_nuxt/error-404.DL_4WIao.css"
  },
  "/_nuxt/error-500.I1Dtv2V5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75a-vEGyJqldBVJrnMfcLsrGaHcxYl0\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 1882,
    "path": "../public/_nuxt/error-500.I1Dtv2V5.css"
  },
  "/_nuxt/eY0SSkER.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1399-LDo1ezD9S9zJqroz8ipAhIXP/hs\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 5017,
    "path": "../public/_nuxt/eY0SSkER.js"
  },
  "/_nuxt/HCTZa9fF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8-8VSy7qxCtrLzFEuOOegsAzG3+Nk\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 184,
    "path": "../public/_nuxt/HCTZa9fF.js"
  },
  "/_nuxt/hjy4fo5o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e97-wGaC/FYc7t358PnRiG9uzMRyymY\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 3735,
    "path": "../public/_nuxt/hjy4fo5o.js"
  },
  "/_nuxt/index.BOP4Qfq3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c5-hhnwMwx4cPpongE/D9o6a/WAGAU\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 197,
    "path": "../public/_nuxt/index.BOP4Qfq3.css"
  },
  "/_nuxt/index.CbF8URRc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1fd0-IJCWHPqlGZvFTVjHl2XH/f96YxM\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 8144,
    "path": "../public/_nuxt/index.CbF8URRc.css"
  },
  "/_nuxt/index.CkaHh9so.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2e8-zlnegmNqJSuOvPjTS4fhYGf8UCU\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 744,
    "path": "../public/_nuxt/index.CkaHh9so.css"
  },
  "/_nuxt/index.j1dLftsX.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2a63-pgqaqFEImPu9jxuSBxSqCnjGFhs\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 10851,
    "path": "../public/_nuxt/index.j1dLftsX.css"
  },
  "/_nuxt/individual.btKpGOVz.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"154-RgDDSuLTjvVh1mDw/cupriRuUuM\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 340,
    "path": "../public/_nuxt/individual.btKpGOVz.css"
  },
  "/_nuxt/Inter-normal-300-cyrillic-ext.BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 25960,
    "path": "../public/_nuxt/Inter-normal-300-cyrillic-ext.BOeWTOD4.woff2"
  },
  "/_nuxt/Inter-normal-300-greek-ext.DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 11232,
    "path": "../public/_nuxt/Inter-normal-300-greek-ext.DlzME5K_.woff2"
  },
  "/_nuxt/Inter-normal-300-cyrillic.DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
    "mtime": "2026-05-26T02:53:58.124Z",
    "size": 18748,
    "path": "../public/_nuxt/Inter-normal-300-cyrillic.DqGufNeO.woff2"
  },
  "/_nuxt/Inter-normal-300-greek.CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 18996,
    "path": "../public/_nuxt/Inter-normal-300-greek.CkhJZR-_.woff2"
  },
  "/_nuxt/Inter-normal-300-latin-ext.DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 85068,
    "path": "../public/_nuxt/Inter-normal-300-latin-ext.DO1Apj_S.woff2"
  },
  "/_nuxt/Inter-normal-300-vietnamese.CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 10252,
    "path": "../public/_nuxt/Inter-normal-300-vietnamese.CBcvBZtf.woff2"
  },
  "/_nuxt/Inter-normal-300-latin.Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 48256,
    "path": "../public/_nuxt/Inter-normal-300-latin.Dx4kXJAl.woff2"
  },
  "/_nuxt/jrRIKOo_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8b9d-pc5g7Vbx8nUYgtjzhfBTvQAsLD8\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 35741,
    "path": "../public/_nuxt/jrRIKOo_.js"
  },
  "/_nuxt/ojn8iE9L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8-8WntsykwLEWpwvBJtjy2MfAoLcE\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 184,
    "path": "../public/_nuxt/ojn8iE9L.js"
  },
  "/_nuxt/Material_Symbols_Outlined-normal-400-fallback.C78aoMeh.woff2": {
    "type": "font/woff2",
    "etag": "\"4dd74-1Qe7XUFqrD1LJLng2L7Jwb8mPWo\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 318836,
    "path": "../public/_nuxt/Material_Symbols_Outlined-normal-400-fallback.C78aoMeh.woff2"
  },
  "/_nuxt/Plus_Jakarta_Sans-normal-400-latin-ext.DmpS2jIq.woff2": {
    "type": "font/woff2",
    "etag": "\"54e0-QvPpAYEn4Ol5O2FiDUNqprR4Zyg\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 21728,
    "path": "../public/_nuxt/Plus_Jakarta_Sans-normal-400-latin-ext.DmpS2jIq.woff2"
  },
  "/_nuxt/Plus_Jakarta_Sans-normal-400-latin.eXO_dkmS.woff2": {
    "type": "font/woff2",
    "etag": "\"6ad4-o4nZfeWAotajcjESI0vSs4Oc4Ns\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 27348,
    "path": "../public/_nuxt/Plus_Jakarta_Sans-normal-400-latin.eXO_dkmS.woff2"
  },
  "/_nuxt/Plus_Jakarta_Sans-normal-400-vietnamese.qRpaaN48.woff2": {
    "type": "font/woff2",
    "etag": "\"20a0-C/LCoE0Ze4d2+M75EzjTyDMuymc\"",
    "mtime": "2026-05-26T02:53:58.160Z",
    "size": 8352,
    "path": "../public/_nuxt/Plus_Jakarta_Sans-normal-400-vietnamese.qRpaaN48.woff2"
  },
  "/_nuxt/ProsePre.D5orA6B_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e-jczvRAVUXbzGL6yotozKFbyMO4s\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 30,
    "path": "../public/_nuxt/ProsePre.D5orA6B_.css"
  },
  "/_nuxt/qwsTwPNC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11eba-F3CUny20SbKecWDOgjZGVKsx3k0\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 73402,
    "path": "../public/_nuxt/qwsTwPNC.js"
  },
  "/_nuxt/rCQpw6qA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8b-9WjGU0I23snY4911haBQbtcgKxw\"",
    "mtime": "2026-05-26T02:53:58.163Z",
    "size": 139,
    "path": "../public/_nuxt/rCQpw6qA.js"
  },
  "/_nuxt/sHv6JeoT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8375-6VOunNFO3pjQqPBFDiIhstjBNLQ\"",
    "mtime": "2026-05-26T02:53:58.162Z",
    "size": 33653,
    "path": "../public/_nuxt/sHv6JeoT.js"
  },
  "/_nuxt/useSeo.BTgMjOJc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7ec-int0lSo3Go3Tz0aWm1FBzzGII+0\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 2028,
    "path": "../public/_nuxt/useSeo.BTgMjOJc.css"
  },
  "/_nuxt/yAYeTo-c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5-sdZlbwlPf7gmbRS8sl2iGvXpRAI\"",
    "mtime": "2026-05-26T02:53:58.164Z",
    "size": 181,
    "path": "../public/_nuxt/yAYeTo-c.js"
  },
  "/_nuxt/_slug_.B346O3ET.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e0-oonnCsiT4DL51CSCHwavwxiKDOk\"",
    "mtime": "2026-05-26T02:53:58.161Z",
    "size": 224,
    "path": "../public/_nuxt/_slug_.B346O3ET.css"
  },
  "/__sitemap__/en-US.xml": {
    "type": "application/xml",
    "etag": "\"7929-VXKdzED7bdeS4LOUN+oF5QUR2tc\"",
    "mtime": "2026-05-26T02:56:01.654Z",
    "size": 31017,
    "path": "../public/__sitemap__/en-US.xml"
  },
  "/__sitemap__/vi-VN.xml": {
    "type": "application/xml",
    "etag": "\"758f-2UyfhFe1D2QLzdyYdYISs6KuLpM\"",
    "mtime": "2026-05-26T02:56:01.682Z",
    "size": 30095,
    "path": "../public/__sitemap__/vi-VN.xml"
  },
  "/booking/confirmation/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6226d-wjLdXlhktHnBh32XE6cS0idMcdI\"",
    "mtime": "2026-05-26T02:55:10.137Z",
    "size": 402029,
    "path": "../public/booking/confirmation/index.html"
  },
  "/booking/confirmation/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:12.222Z",
    "size": 69,
    "path": "../public/booking/confirmation/_payload.json"
  },
  "/business/corporate-wellness/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"66ba8-r40ryXhTKGvLoJ/iDBohe7DR22g\"",
    "mtime": "2026-05-26T02:54:51.838Z",
    "size": 420776,
    "path": "../public/business/corporate-wellness/index.html"
  },
  "/business/corporate-wellness/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:02.530Z",
    "size": 69,
    "path": "../public/business/corporate-wellness/_payload.json"
  },
  "/business/education-training/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:10.414Z",
    "size": 69,
    "path": "../public/business/education-training/_payload.json"
  },
  "/business/education-training/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6c326-4BpzUmB9HSPNOUKQTGT5ZyRolG8\"",
    "mtime": "2026-05-26T02:55:05.249Z",
    "size": 443174,
    "path": "../public/business/education-training/index.html"
  },
  "/business/recovery-event/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"68654-G3gMK5CgGfYhe2WnD7pQE/e5d+w\"",
    "mtime": "2026-05-26T02:54:53.394Z",
    "size": 427604,
    "path": "../public/business/recovery-event/index.html"
  },
  "/business/recovery-event/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:03.835Z",
    "size": 69,
    "path": "../public/business/recovery-event/_payload.json"
  },
  "/sharing-hub/behind-session-listening/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a088-W63l5G7GAQ6Wa8BKOZv10syJ6TQ\"",
    "mtime": "2026-05-26T02:55:48.036Z",
    "size": 434312,
    "path": "../public/sharing-hub/behind-session-listening/index.html"
  },
  "/sharing-hub/behind-session-listening/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-W+x1yg0ioKhKsYQfx0R+grIFa90\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/behind-session-listening/_payload.json"
  },
  "/sharing-hub/foam-rolling-101/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-dPvt1JioQ9HeAiLRSjeYKp7PYDI\"",
    "mtime": "2026-05-26T02:55:48.464Z",
    "size": 69,
    "path": "../public/sharing-hub/foam-rolling-101/_payload.json"
  },
  "/sharing-hub/foam-rolling-101/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"67adf-ERHkUSQR31e6conV15igZJTNdkE\"",
    "mtime": "2026-05-26T02:55:48.034Z",
    "size": 424671,
    "path": "../public/sharing-hub/foam-rolling-101/index.html"
  },
  "/sharing-hub/growing-team-elevating-care/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a0b2-2l/35zukve94Nk9DqIGUcfEb1+w\"",
    "mtime": "2026-05-26T02:55:48.042Z",
    "size": 434354,
    "path": "../public/sharing-hub/growing-team-elevating-care/index.html"
  },
  "/sharing-hub/growing-team-elevating-care/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-n56nlbIOeweH48ZGEXx4gxEtlP4\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/growing-team-elevating-care/_payload.json"
  },
  "/sharing-hub/hip-mobility-key/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-xG9OGtjhkE6e27jXqX3IVKdbFMo\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/hip-mobility-key/_payload.json"
  },
  "/sharing-hub/meet-huy-team-story/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-8JK2sjWKj9uOB98Yi+JEZgZAnl4\"",
    "mtime": "2026-05-26T02:55:48.464Z",
    "size": 69,
    "path": "../public/sharing-hub/meet-huy-team-story/_payload.json"
  },
  "/sharing-hub/hip-mobility-key/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a058-uw4myqcTAwGebUyosiaYaye7UGc\"",
    "mtime": "2026-05-26T02:55:48.044Z",
    "size": 434264,
    "path": "../public/sharing-hub/hip-mobility-key/index.html"
  },
  "/sharing-hub/meet-huy-team-story/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a082-57kGzMSRN8JqXUl29w9bPK9/YNE\"",
    "mtime": "2026-05-26T02:55:48.036Z",
    "size": 434306,
    "path": "../public/sharing-hub/meet-huy-team-story/index.html"
  },
  "/sharing-hub/movement-workshop-rmit/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a06c-echPEWIfySHf/b+OaySDsXeNceQ\"",
    "mtime": "2026-05-26T02:55:48.044Z",
    "size": 434284,
    "path": "../public/sharing-hub/movement-workshop-rmit/index.html"
  },
  "/sharing-hub/movement-workshop-rmit/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-nY5mtu9wcu/izGp9sFSSD8A1gjM\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/movement-workshop-rmit/_payload.json"
  },
  "/sharing-hub/new-chapter-stretch/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-FGt01JXSvbKQuaocKL2zHxcc3yU\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/new-chapter-stretch/_payload.json"
  },
  "/sharing-hub/new-space-thao-dien/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Aif1qYioKTCkcivhfMTKIRiu4ow\"",
    "mtime": "2026-05-26T02:55:48.464Z",
    "size": 69,
    "path": "../public/sharing-hub/new-space-thao-dien/_payload.json"
  },
  "/sharing-hub/new-space-thao-dien/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a042-41wCqdBabORo4b0FozHq2qH7FZk\"",
    "mtime": "2026-05-26T02:55:48.036Z",
    "size": 434242,
    "path": "../public/sharing-hub/new-space-thao-dien/index.html"
  },
  "/sharing-hub/new-chapter-stretch/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a042-addympMHRIIJZXJZ11ExyAV/IAY\"",
    "mtime": "2026-05-26T02:55:48.042Z",
    "size": 434242,
    "path": "../public/sharing-hub/new-chapter-stretch/index.html"
  },
  "/sharing-hub/recovery-day-vn-runners/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a07a-hbQCZWpkK669bL8ow5d2f4ev+ZE\"",
    "mtime": "2026-05-26T02:55:47.898Z",
    "size": 434298,
    "path": "../public/sharing-hub/recovery-day-vn-runners/index.html"
  },
  "/sharing-hub/recovery-day-vn-runners/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-sqmT5lHC3NXXUbr2HXyqGqWA9iQ\"",
    "mtime": "2026-05-26T02:55:48.464Z",
    "size": 69,
    "path": "../public/sharing-hub/recovery-day-vn-runners/_payload.json"
  },
  "/sharing-hub/setbacks-to-strength-kevin/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a0a4-vv4lcXrdm9FpUeal32wIodaWFlc\"",
    "mtime": "2026-05-26T02:55:48.041Z",
    "size": 434340,
    "path": "../public/sharing-hub/setbacks-to-strength-kevin/index.html"
  },
  "/sharing-hub/setbacks-to-strength-kevin/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-uRWulGWMYlz62o2fy40xe25dlgk\"",
    "mtime": "2026-05-26T02:55:48.465Z",
    "size": 69,
    "path": "../public/sharing-hub/setbacks-to-strength-kevin/_payload.json"
  },
  "/sharing-hub/sunrise-stretch-sala/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-YbzQI1XJ9sRhZysNn7hKTt+r2lE\"",
    "mtime": "2026-05-26T02:55:48.483Z",
    "size": 69,
    "path": "../public/sharing-hub/sunrise-stretch-sala/_payload.json"
  },
  "/sharing-hub/what-is-sport-recovery/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-fMekQEHduSaK1s0lPzFLi9ZeS0s\"",
    "mtime": "2026-05-26T02:55:48.471Z",
    "size": 69,
    "path": "../public/sharing-hub/what-is-sport-recovery/_payload.json"
  },
  "/sharing-hub/sunrise-stretch-sala/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a090-8Zv6tJq/EJzJ06PiN0yCFK6NmPQ\"",
    "mtime": "2026-05-26T02:55:48.134Z",
    "size": 434320,
    "path": "../public/sharing-hub/sunrise-stretch-sala/index.html"
  },
  "/sharing-hub/what-is-sport-recovery/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a168-gSYnM47W4HWI2t9Xryj+io8zQl8\"",
    "mtime": "2026-05-26T02:55:48.044Z",
    "size": 434536,
    "path": "../public/sharing-hub/what-is-sport-recovery/index.html"
  },
  "/vi/booking/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:06.731Z",
    "size": 69,
    "path": "../public/vi/booking/_payload.json"
  },
  "/vi/booking/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"64002-3dU6iHJ29TFQmBSllPrZbdZLhJA\"",
    "mtime": "2026-05-26T02:54:53.717Z",
    "size": 409602,
    "path": "../public/vi/booking/index.html"
  },
  "/vi/business/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"690da-Y7Qm24KkxqlN+PA/oLlWnbn268Q\"",
    "mtime": "2026-05-26T02:54:53.459Z",
    "size": 430298,
    "path": "../public/vi/business/index.html"
  },
  "/vi/business/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:05.249Z",
    "size": 69,
    "path": "../public/vi/business/_payload.json"
  },
  "/vi/individual/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:02.504Z",
    "size": 69,
    "path": "../public/vi/individual/_payload.json"
  },
  "/vi/individual/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6bed9-3qVCqadLNBJVCbKU0SY8FBw3roI\"",
    "mtime": "2026-05-26T02:54:50.022Z",
    "size": 442073,
    "path": "../public/vi/individual/index.html"
  },
  "/vi/products/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6340b-IUf9yEA9frqrqVMWLzTmOI6Wm30\"",
    "mtime": "2026-05-26T02:54:53.394Z",
    "size": 406539,
    "path": "../public/vi/products/index.html"
  },
  "/vi/products/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-DWfvnoPVY4zShHes1+uKt9Yiy6U\"",
    "mtime": "2026-05-26T02:55:03.876Z",
    "size": 69,
    "path": "../public/vi/products/_payload.json"
  },
  "/vi/sharing-hub/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:12.156Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/_payload.json"
  },
  "/vi/sitemap.xml/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-NOtAINL20IUXthKFvNgGoqVdTq8\"",
    "mtime": "2026-05-26T02:55:12.762Z",
    "size": 69,
    "path": "../public/vi/sitemap.xml/_payload.json"
  },
  "/vi/sharing-hub/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6cc21-4RoEbXe+zNAP518eco8iwhlOpHk\"",
    "mtime": "2026-05-26T02:55:07.077Z",
    "size": 445473,
    "path": "../public/vi/sharing-hub/index.html"
  },
  "/vi/sitemap.xml/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"5dfbd-LMSaxFTX+d/W2sxWmlC7fT4kR5U\"",
    "mtime": "2026-05-26T02:55:12.223Z",
    "size": 384957,
    "path": "../public/vi/sitemap.xml/index.html"
  },
  "/_ipx/f_webp/active-who.png": {
    "type": "image/webp",
    "etag": "\"140e4-aI7VUwGbY5zhzZJg9sttig7MBTo\"",
    "mtime": "2026-05-26T02:55:10.484Z",
    "size": 82148,
    "path": "../public/_ipx/f_webp/active-who.png"
  },
  "/_ipx/f_webp/booking-hero-new.png": {
    "type": "image/webp",
    "etag": "\"14208-zIIAtKJqLrkYAsLHdXlUeRmxBxA\"",
    "mtime": "2026-05-26T02:55:12.440Z",
    "size": 82440,
    "path": "../public/_ipx/f_webp/booking-hero-new.png"
  },
  "/_ipx/f_webp/athlete-who.png": {
    "type": "image/webp",
    "etag": "\"1c40a-xRkmhM07oy6NfhjEKXIvaajBgQw\"",
    "mtime": "2026-05-26T02:55:29.337Z",
    "size": 115722,
    "path": "../public/_ipx/f_webp/athlete-who.png"
  },
  "/_ipx/f_webp/business_solution_sidebar.png": {
    "type": "image/webp",
    "etag": "\"11d9e-6YCSk6nJTmbBX9mJ3DaPjfz+p0w\"",
    "mtime": "2026-05-26T02:55:54.988Z",
    "size": 73118,
    "path": "../public/_ipx/f_webp/business_solution_sidebar.png"
  },
  "/_ipx/f_webp/corporate-sports.png": {
    "type": "image/webp",
    "etag": "\"2d6bc-jmoR2oHKtrUGGdgxgGM0hDxi4yY\"",
    "mtime": "2026-05-26T02:55:10.553Z",
    "size": 186044,
    "path": "../public/_ipx/f_webp/corporate-sports.png"
  },
  "/_ipx/f_webp/education-gallery-1.png": {
    "type": "image/webp",
    "etag": "\"f3d2-lpb8GCNrxZ+2s48KXHA1i2QH0zY\"",
    "mtime": "2026-05-26T02:55:12.492Z",
    "size": 62418,
    "path": "../public/_ipx/f_webp/education-gallery-1.png"
  },
  "/_ipx/f_webp/education-gallery-2.png": {
    "type": "image/webp",
    "etag": "\"125e8-5BN6tgFML6hvOP8+d3BObfNpqS0\"",
    "mtime": "2026-05-26T02:55:12.495Z",
    "size": 75240,
    "path": "../public/_ipx/f_webp/education-gallery-2.png"
  },
  "/_ipx/f_webp/education-gallery-3.png": {
    "type": "image/webp",
    "etag": "\"1cbf0-HWKURfcBXrwfMDE83zW2hiICCMs\"",
    "mtime": "2026-05-26T02:55:12.503Z",
    "size": 117744,
    "path": "../public/_ipx/f_webp/education-gallery-3.png"
  },
  "/_ipx/f_webp/education-gallery-4.png": {
    "type": "image/webp",
    "etag": "\"17e0a-LsyzolAYz0oi7rmas10/qunOjT8\"",
    "mtime": "2026-05-26T02:55:12.507Z",
    "size": 97802,
    "path": "../public/_ipx/f_webp/education-gallery-4.png"
  },
  "/_ipx/f_webp/education-hero.png": {
    "type": "image/webp",
    "etag": "\"16742-ghAYIDL4G9TGNJ26q6JdoEjuLrI\"",
    "mtime": "2026-05-26T02:55:12.517Z",
    "size": 91970,
    "path": "../public/_ipx/f_webp/education-hero.png"
  },
  "/_ipx/f_webp/education-gallery-5.png": {
    "type": "image/webp",
    "etag": "\"2e542-C2ts4go2qXv9dv6amQvXfMZbE+E\"",
    "mtime": "2026-05-26T02:55:12.517Z",
    "size": 189762,
    "path": "../public/_ipx/f_webp/education-gallery-5.png"
  },
  "/_ipx/f_webp/education-workshop.png": {
    "type": "image/webp",
    "etag": "\"1c6f4-5oRPPZfnUw2/H8WcIZbJ3yXzGAA\"",
    "mtime": "2026-05-26T02:55:12.761Z",
    "size": 116468,
    "path": "../public/_ipx/f_webp/education-workshop.png"
  },
  "/_ipx/f_webp/event-booth.png": {
    "type": "image/webp",
    "etag": "\"20bc4-FTAELW6adnK71/BtOaf6SxBAOfo\"",
    "mtime": "2026-05-26T02:55:10.489Z",
    "size": 134084,
    "path": "../public/_ipx/f_webp/event-booth.png"
  },
  "/_ipx/f_webp/event-flow.png": {
    "type": "image/webp",
    "etag": "\"3dede-FjZ7QVVAmjR1CCMtljsKxR43UnU\"",
    "mtime": "2026-05-26T02:55:10.553Z",
    "size": 253662,
    "path": "../public/_ipx/f_webp/event-flow.png"
  },
  "/_ipx/f_webp/event-response.png": {
    "type": "image/webp",
    "etag": "\"27fee-x8771tncLjDVag42vpFqAnWlVFQ\"",
    "mtime": "2026-05-26T02:55:10.553Z",
    "size": 163822,
    "path": "../public/_ipx/f_webp/event-response.png"
  },
  "/_ipx/f_webp/event-warmup.png": {
    "type": "image/webp",
    "etag": "\"3aa16-zQwwJzZ2PMObSvk1VkFkW7eFw1Q\"",
    "mtime": "2026-05-26T02:55:11.970Z",
    "size": 240150,
    "path": "../public/_ipx/f_webp/event-warmup.png"
  },
  "/_ipx/f_webp/experiencing-pain-absolute.png": {
    "type": "image/webp",
    "etag": "\"d1f8-jKtp7/C0ADHi7YEMc8nk2qWoAC8\"",
    "mtime": "2026-05-26T02:55:10.485Z",
    "size": 53752,
    "path": "../public/_ipx/f_webp/experiencing-pain-absolute.png"
  },
  "/_ipx/f_webp/individual-hero.png": {
    "type": "image/webp",
    "etag": "\"10b92-JnDNCZIZx+tx67xqnx0qv/ULaE8\"",
    "mtime": "2026-05-26T02:55:10.484Z",
    "size": 68498,
    "path": "../public/_ipx/f_webp/individual-hero.png"
  },
  "/_ipx/f_webp/hero-physiotherapy.png": {
    "type": "image/webp",
    "etag": "\"1424e-QgnA/spohc/4Sw/+lPrSHJD8NNg\"",
    "mtime": "2026-05-26T02:54:29.745Z",
    "size": 82510,
    "path": "../public/_ipx/f_webp/hero-physiotherapy.png"
  },
  "/_ipx/f_webp/marathon.png": {
    "type": "image/webp",
    "etag": "\"3c78c-vLvGa4USVPt0qAGu5296/KM2h0M\"",
    "mtime": "2026-05-26T02:55:11.970Z",
    "size": 247692,
    "path": "../public/_ipx/f_webp/marathon.png"
  },
  "/_ipx/f_webp/monaco-healthcare.png": {
    "type": "image/webp",
    "etag": "\"1380e-eHSUb1yDRFxRvnNqHjMtd+2123k\"",
    "mtime": "2026-05-26T02:55:12.517Z",
    "size": 79886,
    "path": "../public/_ipx/f_webp/monaco-healthcare.png"
  },
  "/_ipx/f_webp/office-who.png": {
    "type": "image/webp",
    "etag": "\"1650a-BGJxPtgPZkTxSng93gq3dB46WQs\"",
    "mtime": "2026-05-26T02:55:10.484Z",
    "size": 91402,
    "path": "../public/_ipx/f_webp/office-who.png"
  },
  "/_ipx/f_webp/older-who.png": {
    "type": "image/webp",
    "etag": "\"1285a-bRdklNXb3Yuzo9Y9TqXG1FbVpzI\"",
    "mtime": "2026-05-26T02:55:10.484Z",
    "size": 75866,
    "path": "../public/_ipx/f_webp/older-who.png"
  },
  "/_ipx/f_webp/pickleball.png": {
    "type": "image/webp",
    "etag": "\"29520-ORdTVHRqMAzkoeZXxTm496nHjWs\"",
    "mtime": "2026-05-26T02:55:10.553Z",
    "size": 169248,
    "path": "../public/_ipx/f_webp/pickleball.png"
  },
  "/_ipx/f_webp/recovery-who.png": {
    "type": "image/webp",
    "etag": "\"1404e-PM0ZdB7GaBK3q03uno3CrWAvKpM\"",
    "mtime": "2026-05-26T02:55:10.484Z",
    "size": 81998,
    "path": "../public/_ipx/f_webp/recovery-who.png"
  },
  "/_ipx/f_webp/tennis.png": {
    "type": "image/webp",
    "etag": "\"15b6a-ina1ZZJUsVe1j38nuFzes11j/xA\"",
    "mtime": "2026-05-26T02:55:10.553Z",
    "size": 88938,
    "path": "../public/_ipx/f_webp/tennis.png"
  },
  "/_ipx/f_webp/runner-who.png": {
    "type": "image/webp",
    "etag": "\"1d21a-fJmm2723FAiUPFIOxTiVAK2UBRs\"",
    "mtime": "2026-05-26T02:55:29.337Z",
    "size": 119322,
    "path": "../public/_ipx/f_webp/runner-who.png"
  },
  "/__nuxt_content/content/sql_dump.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"c18-6OPAWH143rgQFCE6AfLB+GKOQ8o\"",
    "mtime": "2026-05-26T02:54:21.609Z",
    "size": 3096,
    "path": "../public/__nuxt_content/content/sql_dump.txt"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-7h5S6NWW76vozmrbu4xB/OwZrJw\"",
    "mtime": "2026-05-26T02:56:28.990Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/vi/booking/confirmation/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"62416-EVF93Ow34axXoOT3ZqgOyUQnURA\"",
    "mtime": "2026-05-26T02:55:10.383Z",
    "size": 402454,
    "path": "../public/vi/booking/confirmation/index.html"
  },
  "/vi/booking/confirmation/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:12.491Z",
    "size": 69,
    "path": "../public/vi/booking/confirmation/_payload.json"
  },
  "/vi/business/corporate-wellness/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"670a9-ldkmHoyEhyzD6IBX98mC3kGDQ88\"",
    "mtime": "2026-05-26T02:55:03.835Z",
    "size": 422057,
    "path": "../public/vi/business/corporate-wellness/index.html"
  },
  "/vi/business/corporate-wellness/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:10.384Z",
    "size": 69,
    "path": "../public/vi/business/corporate-wellness/_payload.json"
  },
  "/vi/business/education-training/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:12.157Z",
    "size": 69,
    "path": "../public/vi/business/education-training/_payload.json"
  },
  "/vi/business/recovery-event/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-Dw1H1PdL31nYn41RLJ4nwnK6VKw\"",
    "mtime": "2026-05-26T02:55:10.382Z",
    "size": 69,
    "path": "../public/vi/business/recovery-event/_payload.json"
  },
  "/vi/business/education-training/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6c894-e7/OT8KPEK0TM0WNhG/M0/YteY0\"",
    "mtime": "2026-05-26T02:55:09.722Z",
    "size": 444564,
    "path": "../public/vi/business/education-training/index.html"
  },
  "/vi/business/recovery-event/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"68c83-DK0+m/1LI31ANlWCfYvsEr+YDjE\"",
    "mtime": "2026-05-26T02:55:03.835Z",
    "size": 429187,
    "path": "../public/vi/business/recovery-event/index.html"
  },
  "/vi/sharing-hub/behind-session-listening/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.457Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/behind-session-listening/_payload.json"
  },
  "/vi/sharing-hub/behind-session-listening/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a93d-xPW6dK+ZtI6vdcKj+7plsfzzIkA\"",
    "mtime": "2026-05-26T02:55:33.954Z",
    "size": 436541,
    "path": "../public/vi/sharing-hub/behind-session-listening/index.html"
  },
  "/vi/sharing-hub/foam-rolling-101/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"67e7e-2Eh5pOCakBFVuyAg+oAf8Sihkqw\"",
    "mtime": "2026-05-26T02:55:35.365Z",
    "size": 425598,
    "path": "../public/vi/sharing-hub/foam-rolling-101/index.html"
  },
  "/vi/sharing-hub/foam-rolling-101/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.457Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/foam-rolling-101/_payload.json"
  },
  "/vi/sharing-hub/growing-team-elevating-care/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/growing-team-elevating-care/_payload.json"
  },
  "/vi/sharing-hub/growing-team-elevating-care/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a967-TnRVqwkoaURDxdVqXrWqfDdEFJQ\"",
    "mtime": "2026-05-26T02:55:29.716Z",
    "size": 436583,
    "path": "../public/vi/sharing-hub/growing-team-elevating-care/index.html"
  },
  "/vi/sharing-hub/hip-mobility-key/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/hip-mobility-key/_payload.json"
  },
  "/vi/sharing-hub/hip-mobility-key/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a90d-56zASKMHpuyiU+IeNshzRrzerRk\"",
    "mtime": "2026-05-26T02:55:29.716Z",
    "size": 436493,
    "path": "../public/vi/sharing-hub/hip-mobility-key/index.html"
  },
  "/vi/sharing-hub/meet-huy-team-story/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.408Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/meet-huy-team-story/_payload.json"
  },
  "/vi/sharing-hub/movement-workshop-rmit/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/movement-workshop-rmit/_payload.json"
  },
  "/vi/sharing-hub/new-chapter-stretch/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/new-chapter-stretch/_payload.json"
  },
  "/vi/sharing-hub/meet-huy-team-story/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a937-6EZC8YMNVXFOToUgV945GUkL/9o\"",
    "mtime": "2026-05-26T02:55:29.717Z",
    "size": 436535,
    "path": "../public/vi/sharing-hub/meet-huy-team-story/index.html"
  },
  "/vi/sharing-hub/movement-workshop-rmit/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a921-dZTS04olD1oHsYni8dN6MYqtUok\"",
    "mtime": "2026-05-26T02:55:29.716Z",
    "size": 436513,
    "path": "../public/vi/sharing-hub/movement-workshop-rmit/index.html"
  },
  "/vi/sharing-hub/new-space-thao-dien/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.432Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/new-space-thao-dien/_payload.json"
  },
  "/vi/sharing-hub/new-space-thao-dien/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a8f7-Lsy/aPoP+ivAJAX0mJ4GA7nFag0\"",
    "mtime": "2026-05-26T02:55:29.717Z",
    "size": 436471,
    "path": "../public/vi/sharing-hub/new-space-thao-dien/index.html"
  },
  "/vi/sharing-hub/new-chapter-stretch/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a8f7-BIDjG8fcIekumQBPfmst+WJxMaE\"",
    "mtime": "2026-05-26T02:55:29.717Z",
    "size": 436471,
    "path": "../public/vi/sharing-hub/new-chapter-stretch/index.html"
  },
  "/vi/sharing-hub/recovery-day-vn-runners/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a92f-Cmedp6SjKC485Xz11X6DaFlerRw\"",
    "mtime": "2026-05-26T02:55:29.717Z",
    "size": 436527,
    "path": "../public/vi/sharing-hub/recovery-day-vn-runners/index.html"
  },
  "/vi/sharing-hub/recovery-day-vn-runners/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/recovery-day-vn-runners/_payload.json"
  },
  "/vi/sharing-hub/setbacks-to-strength-kevin/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a959-px5HZhWbCgj31m/EwPtjAZLJww4\"",
    "mtime": "2026-05-26T02:55:29.716Z",
    "size": 436569,
    "path": "../public/vi/sharing-hub/setbacks-to-strength-kevin/index.html"
  },
  "/vi/sharing-hub/setbacks-to-strength-kevin/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.338Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/setbacks-to-strength-kevin/_payload.json"
  },
  "/vi/sharing-hub/sunrise-stretch-sala/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6a945-n1VFRDi9pFYQz+wvqeR7UWYZfmA\"",
    "mtime": "2026-05-26T02:55:45.072Z",
    "size": 436549,
    "path": "../public/vi/sharing-hub/sunrise-stretch-sala/index.html"
  },
  "/vi/sharing-hub/sunrise-stretch-sala/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.459Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/sunrise-stretch-sala/_payload.json"
  },
  "/vi/sharing-hub/what-is-sport-recovery/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"45-0zgmSN8VsCTH+cA7BsuuNMP2/tQ\"",
    "mtime": "2026-05-26T02:55:48.432Z",
    "size": 69,
    "path": "../public/vi/sharing-hub/what-is-sport-recovery/_payload.json"
  },
  "/_i18n/3978910b/en/messages.json": {
    "type": "application/json",
    "etag": "\"829f-drH3/MaE4MkTDuqmhyGN4qFrde8\"",
    "mtime": "2026-05-26T02:54:27.386Z",
    "size": 33439,
    "path": "../public/_i18n/3978910b/en/messages.json"
  },
  "/_i18n/3978910b/vi/messages.json": {
    "type": "application/json",
    "etag": "\"12df0-LeTSeOVxS9g9YG+6Iok8Fn50iC4\"",
    "mtime": "2026-05-26T02:54:27.479Z",
    "size": 77296,
    "path": "../public/_i18n/3978910b/vi/messages.json"
  },
  "/vi/sharing-hub/what-is-sport-recovery/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"6aacb-r7hzLpKS2liNvJIS85FfyOgFHgo\"",
    "mtime": "2026-05-26T02:55:29.717Z",
    "size": 436939,
    "path": "../public/vi/sharing-hub/what-is-sport-recovery/index.html"
  },
  "/_ipx/f_webp/images/business-hero.png": {
    "type": "image/webp",
    "etag": "\"2d6bc-jmoR2oHKtrUGGdgxgGM0hDxi4yY\"",
    "mtime": "2026-05-26T02:55:12.158Z",
    "size": 186044,
    "path": "../public/_ipx/f_webp/images/business-hero.png"
  },
  "/_ipx/f_webp/images/education-solution.png": {
    "type": "image/webp",
    "etag": "\"16742-ghAYIDL4G9TGNJ26q6JdoEjuLrI\"",
    "mtime": "2026-05-26T02:55:12.223Z",
    "size": 91970,
    "path": "../public/_ipx/f_webp/images/education-solution.png"
  },
  "/_ipx/f_webp/images/event-solution.png": {
    "type": "image/webp",
    "etag": "\"20bc4-FTAELW6adnK71/BtOaf6SxBAOfo\"",
    "mtime": "2026-05-26T02:55:10.489Z",
    "size": 134084,
    "path": "../public/_ipx/f_webp/images/event-solution.png"
  },
  "/_ipx/f_webp/images/man-neck-pain.png": {
    "type": "image/webp",
    "etag": "\"125da-61IDOC5xV5DPXyspNUArfJn5idM\"",
    "mtime": "2026-05-26T02:55:10.414Z",
    "size": 75226,
    "path": "../public/_ipx/f_webp/images/man-neck-pain.png"
  },
  "/_ipx/f_webp/images/wellness-solution.png": {
    "type": "image/webp",
    "etag": "\"1c40a-xRkmhM07oy6NfhjEKXIvaajBgQw\"",
    "mtime": "2026-05-26T02:55:10.489Z",
    "size": 115722,
    "path": "../public/_ipx/f_webp/images/wellness-solution.png"
  },
  "/_ipx/f_webp/logos/garmin.png": {
    "type": "image/webp",
    "etag": "\"2064-XWJNKuIaV66iNkKFDvSKxhFbZYI\"",
    "mtime": "2026-05-26T02:54:29.973Z",
    "size": 8292,
    "path": "../public/_ipx/f_webp/logos/garmin.png"
  },
  "/_ipx/f_webp/logos/decathlon.png": {
    "type": "image/webp",
    "etag": "\"55f0-iIyRuDPUfSwjMmzKMdZBZ1IyIoU\"",
    "mtime": "2026-05-26T02:54:29.973Z",
    "size": 22000,
    "path": "../public/_ipx/f_webp/logos/decathlon.png"
  },
  "/_ipx/f_webp/logos/lululemon.webp": {
    "type": "image/webp",
    "etag": "\"1ed0-yy3LVU3A8+JhGG7DJ7g3XgItMSw\"",
    "mtime": "2026-05-26T02:54:29.973Z",
    "size": 7888,
    "path": "../public/_ipx/f_webp/logos/lululemon.webp"
  },
  "/_ipx/f_webp/logos/hyrox.webp": {
    "type": "image/webp",
    "etag": "\"852-n1StRvs5Mk6ab227HHEBRomudJ4\"",
    "mtime": "2026-05-26T02:54:29.973Z",
    "size": 2130,
    "path": "../public/_ipx/f_webp/logos/hyrox.webp"
  },
  "/_ipx/f_webp/logos/ironman.png": {
    "type": "image/webp",
    "etag": "\"10b22-kNH8jGjeHMH4exT/xp5QGZDtBaU\"",
    "mtime": "2026-05-26T02:54:29.941Z",
    "size": 68386,
    "path": "../public/_ipx/f_webp/logos/ironman.png"
  },
  "/_ipx/f_webp/logos/partner-1.png": {
    "type": "image/webp",
    "etag": "\"71c8-4IgPWCeftW1wBsBedRJ916naxV0\"",
    "mtime": "2026-05-26T02:54:29.974Z",
    "size": 29128,
    "path": "../public/_ipx/f_webp/logos/partner-1.png"
  },
  "/_ipx/f_webp/logos/partner-10.png": {
    "type": "image/webp",
    "etag": "\"10438-tAPHAY4SkchgyFPp+rkwxqA7UoM\"",
    "mtime": "2026-05-26T02:54:29.974Z",
    "size": 66616,
    "path": "../public/_ipx/f_webp/logos/partner-10.png"
  },
  "/_ipx/f_webp/logos/pickleball-vietnam.png": {
    "type": "image/webp",
    "etag": "\"de18-dYzQ0tw3p0Q78Yda6IjLlz5T290\"",
    "mtime": "2026-05-26T02:55:10.485Z",
    "size": 56856,
    "path": "../public/_ipx/f_webp/logos/pickleball-vietnam.png"
  },
  "/_nuxt/builds/meta/b9f28d70-ead1-42d3-a79b-6626d9a01389.json": {
    "type": "application/json",
    "etag": "\"58e-0tgjSB4yp77xyj2DRAKZF/Pteho\"",
    "mtime": "2026-05-26T02:56:28.991Z",
    "size": 1422,
    "path": "../public/_nuxt/builds/meta/b9f28d70-ead1-42d3-a79b-6626d9a01389.json"
  },
  "/_ipx/f_webp/logos/partner-11.png": {
    "type": "image/webp",
    "etag": "\"118ca-sngiYmfaprmZjpW81D/Kgb/IhpE\"",
    "mtime": "2026-05-26T02:54:29.745Z",
    "size": 71882,
    "path": "../public/_ipx/f_webp/logos/partner-11.png"
  },
  "/_ipx/f_webp/logos/partner-12.png": {
    "type": "image/webp",
    "etag": "\"a1a8-E/wYsQ2fhKddJdClhqbm/aLB2GQ\"",
    "mtime": "2026-05-26T02:54:29.936Z",
    "size": 41384,
    "path": "../public/_ipx/f_webp/logos/partner-12.png"
  },
  "/_ipx/f_webp/logos/partner-13.png": {
    "type": "image/webp",
    "etag": "\"11a6e-VCBzKIIm5qiUQXqOiUA93kTnOjc\"",
    "mtime": "2026-05-26T02:54:29.937Z",
    "size": 72302,
    "path": "../public/_ipx/f_webp/logos/partner-13.png"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$1 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _4NtFRq = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lbX4nS = defineEventHandler((event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (getMethod(event) === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});

const _SxA8c9 = defineEventHandler(() => {});

const PORT_SUFFIX_RE = /:\d+$/;
const _dymx4J = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = getNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: SiteConfigPriority.nitro,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: SiteConfigPriority.runtime,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    ...envSiteConfig(globalThis._importMeta_.env || {})
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host?.replace(PORT_SUFFIX_RE, "") || "";
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: SiteConfigPriority.runtime,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

const _Mf83XD = defineEventHandler(async (e) => {
  const nitroApp = useNitroApp();
  const { indexable} = getSiteRobotConfig(e);
  const { credits, isNuxtContentV2, cacheControl } = useRuntimeConfigNuxtRobots(e);
  let robotsTxtCtx = {
    sitemaps: [],
    groups: [
      {
        allow: [],
        comment: [],
        userAgent: ["*"],
        disallow: ["/"]
      }
    ]
  };
  if (indexable) {
    robotsTxtCtx = await resolveRobotsTxtContext(e);
    robotsTxtCtx.sitemaps = [...new Set(
      asArray(robotsTxtCtx.sitemaps).map((s) => !s.startsWith("http") ? withSiteUrl(e, s, { withBase: true}) : s)
    )];
    if (isNuxtContentV2) {
      const contentWithRobotRules = await e.$fetch("/__robots__/nuxt-content.json", {
        headers: {
          Accept: "application/json"
        }
      });
      if (String(contentWithRobotRules).trim().startsWith("<!DOCTYPE")) {
        logger$1.error("Invalid HTML returned from /__robots__/nuxt-content.json, skipping.");
      } else {
        for (const group of robotsTxtCtx.groups) {
          if (group.userAgent.includes("*")) {
            group.disallow.push(...contentWithRobotRules);
            group.disallow = group.disallow.filter(Boolean);
          }
        }
      }
    }
  }
  let robotsTxt = generateRobotsTxt(robotsTxtCtx);
  if (credits) {
    robotsTxt = [
      `# START nuxt-robots (${indexable ? "indexable" : "indexing disabled"})`,
      robotsTxt,
      "# END nuxt-robots"
    ].filter(Boolean).join("\n");
  }
  setHeader(e, "Content-Type", "text/plain; charset=utf-8");
  setHeader(e, "Cache-Control", globalThis._importMeta_.test || !cacheControl ? "no-store" : cacheControl);
  const hookCtx = { robotsTxt, e };
  await nitroApp.hooks.callHook("robots:robots-txt", hookCtx);
  return hookCtx.robotsTxt;
});

const _bFUiXz = defineEventHandler(async (e) => {
  if (e.path === "/robots.txt" || e.path.startsWith("/__") || e.path.startsWith("/api") || e.path.startsWith("/_nuxt"))
    return;
  const nuxtRobotsConfig = useRuntimeConfigNuxtRobots(e);
  if (nuxtRobotsConfig) {
    const { header } = nuxtRobotsConfig;
    const robotConfig = getPathRobotConfig(e, { skipSiteIndexable: Boolean(getQuery(e)?.mockProductionEnv) });
    if (header) {
      setHeader(e, "X-Robots-Tag", robotConfig.rule);
    }
    e.context.robots = robotConfig;
  }
});

const filters = new Map();

const onUrlFns = new Map();

const _frbMWK = defineEventHandler(async (e) => {
  const collections = [];
  for (const collection in contentManifest) {
    if (contentManifest[collection].fields.sitemap)
      collections.push(collection);
  }
  const contentList = [];
  for (const collection of collections) {
    const needsAllFields = filters?.has(collection) || onUrlFns?.has(collection);
    const query = queryCollection(e, collection).where("path", "IS NOT NULL").where("sitemap", "IS NOT NULL");
    if (!needsAllFields)
      query.select("path", "sitemap");
    contentList.push(
      query.all().then((results2) => {
        const filter = filters?.get(collection);
        return { collection, entries: filter ? results2.filter(filter) : results2 };
      })
    );
  }
  const results = await Promise.all(contentList);
  return results.flatMap(({ collection, entries }) => {
    const onUrl = onUrlFns?.get(collection);
    return entries.filter((c) => c.sitemap !== false && c.path && !c.path.endsWith(".navigation")).map((c) => {
      const url = {
        loc: c.path,
        ...typeof c.sitemap === "object" ? c.sitemap : {}
      };
      onUrl?.(url, c, collection);
      return url;
    });
  }).filter(Boolean);
});

const staticConfig = {"isI18nMapped":true,"sitemapName":"sitemap.xml","isMultiSitemap":true,"excludeAppSources":["nuxt:pages"],"cacheMaxAgeSeconds":600,"autoLastmod":false,"defaultSitemapsChunkSize":1000,"minify":false,"sortEntries":true,"discoverImages":true,"discoverVideos":true,"sitemapsPathPrefix":"/__sitemap__/","isNuxtContentDocumentDriven":false,"xsl":"/__sitemap__/style.xsl","xslTips":true,"xslColumns":[{"label":"URL","width":"50%"},{"label":"Images","width":"25%","select":"count(image:image)"},{"label":"Last Updated","width":"25%","select":"concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"}],"credits":true,"version":"8.0.15","sitemaps":{"index":{"sitemapName":"index","_route":"sitemap_index.xml","sitemaps":[],"include":[],"exclude":[]},"en-US":{"include":[],"exclude":["/_**","/_nuxt/**","/__nuxt_content/**"],"includeAppSources":true,"sitemapName":"en-US","_route":"/__sitemap__/en-US.xml"},"vi-VN":{"include":[],"exclude":["/_**","/_nuxt/**","/__nuxt_content/**"],"includeAppSources":true,"sitemapName":"vi-VN","_route":"/__sitemap__/vi-VN.xml"}},"autoI18n":{"differentDomains":false,"defaultLocale":"en","locales":[{"code":"en","language":"en-US","file":"en.json","name":"English","_hreflang":"en-US","_sitemap":"en-US"},{"code":"vi","language":"vi-VN","file":"vi.json","name":"Tiếng Việt","_hreflang":"vi-VN","_sitemap":"vi-VN"}],"strategy":"prefix_except_default","pages":{"business/recovery-event":{"en":"/business/recovery-event","vi":"/kinh-doanh/phuc-hoi-su-kien"},"business/corporate-wellness":{"en":"/business/corporate-wellness","vi":"/kinh-doanh/cham-soc-doanh-nghiep"},"business/education-training":{"en":"/business/education-training","vi":"/kinh-doanh/dao-tao-huan-luyen"},"sharing-hub/index":{"en":"/sharing-hub","vi":"/goc-chia-se"},"sharing-hub/[slug]":{"en":"/sharing-hub/:slug","vi":"/goc-chia-se/:slug"}}}};

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  result.length = resultLength;
  return result;
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (prefix && locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}, baseURL) {
  const urlFilter = createFilter({
    include: normalizeRuntimeFilters(options.include),
    exclude: normalizeRuntimeFilters(options.exclude)
  });
  const hasBase = baseURL !== "/";
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    if (hasBase)
      path = withoutBase(path, baseURL);
    return urlFilter(path);
  };
}
function findPageMapping(pathWithoutPrefix, pages) {
  const stripped = pathWithoutPrefix[0] === "/" ? pathWithoutPrefix.slice(1) : pathWithoutPrefix;
  const pageKey = stripped.endsWith("/index") ? stripped.slice(0, -6) || "index" : stripped || "index";
  if (pages[pageKey])
    return { mappings: pages[pageKey], paramSegments: [] };
  const sortedKeys = Object.keys(pages).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pageKey.startsWith(`${key}/`)) {
      const paramPath = pageKey.slice(key.length + 1);
      return { mappings: pages[key], paramSegments: paramPath.split("/") };
    }
  }
  return null;
}
function applyDynamicParams(customPath, paramSegments) {
  if (!paramSegments.length)
    return customPath;
  let i = 0;
  return customPath.replace(/\[[^\]]+\]/g, () => paramSegments[i++] || "");
}

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(staticConfig));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  Object.assign(clone, useRuntimeConfig(e).sitemap);
  return Object.freeze(clone);
}

const _awoSfA = defineEventHandler(async (e) => {
  const fixPath = createSitePathResolver(e, { absolute: false, withBase: true });
  const { sitemapName: fallbackSitemapName, cacheMaxAgeSeconds, version, xslColumns, xslTips } = useSitemapRuntimeConfig();
  setHeader(e, "Content-Type", "application/xslt+xml");
  if (cacheMaxAgeSeconds)
    setHeader(e, "Cache-Control", `public, max-age=${cacheMaxAgeSeconds}, must-revalidate`);
  else
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  const { name: siteName, url: siteUrl } = getSiteConfig(e);
  const referrer = getHeader(e, "Referer") || "/";
  const referrerPath = parseURL(referrer).pathname;
  const isNotIndexButHasIndex = referrerPath !== "/sitemap.xml" && referrerPath !== "/sitemap_index.xml" && referrerPath.endsWith(".xml");
  const sitemapName = parseURL(referrer).pathname.split("/").pop()?.split("-sitemap")[0] || fallbackSitemapName;
  const title = `${siteName}${sitemapName !== "sitemap.xml" ? ` - ${sitemapName === "sitemap_index.xml" ? "index" : sitemapName}` : ""}`.replace(/&/g, "&amp;");
  getQuery$1(referrer).canonical;
  const debugUrl = xmlEscape(withQuery("/__sitemap__/debug.json", { sitemap: sitemapName }));
  xmlEscape(referrerPath);
  xmlEscape(withQuery(referrerPath, { canonical: "" }));
  const fetchErrors = [];
  const xslQuery = getQuery(e);
  if (xslQuery.error_messages) {
    const errorMessages = xslQuery.error_messages;
    const errorUrls = xslQuery.error_urls;
    if (errorMessages) {
      const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
      const urls = Array.isArray(errorUrls) ? errorUrls : errorUrls ? [errorUrls] : [];
      messages.forEach((msg, i) => {
        const errorParts = [xmlEscape(msg)];
        if (urls[i])
          errorParts.push(xmlEscape(urls[i]));
        fetchErrors.push(`<span class="error-item">${errorParts.join(" \u2014 ")}</span>`);
      });
    }
  }
  const hasRuntimeErrors = fetchErrors.length > 0;
  let columns = [...xslColumns];
  if (!columns.length) {
    columns = [
      { label: "URL", width: "50%" },
      { label: "Images", width: "25%", select: "count(image:image)" },
      { label: "Last Updated", width: "25%", select: "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))" }
    ];
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          :root {
            --accent: #00dc82;
            --accent-hover: #00b86b;
            --bg: #0a0a0a;
            --bg-elevated: #141414;
            --bg-subtle: #1a1a1a;
            --border: #262626;
            --border-subtle: #1f1f1f;
            --text: #e5e5e5;
            --text-muted: #737373;
            --text-faint: #525252;
            --error: #ef4444;
            --error-bg: rgba(239,68,68,0.1);
            --warning: #f59e0b;
          }
          * { box-sizing: border-box; }
          body {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            font-size: 13px;
            color: var(--text);
            background: var(--bg);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; transition: color 0.15s; }
          a:hover { color: var(--accent); }

          /* Debug bar (dev only) */
          .debug-bar {
            position: fixed;
            bottom: 0.75rem;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0 1rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 100;
            font-size: 11px;
          }
          .debug-bar-brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            text-decoration: none;
          }
          .debug-bar-brand:hover { color: var(--text); }
          .debug-bar-brand svg { flex-shrink: 0; }
          .debug-bar-hint {
            color: var(--text-faint);
            margin-right: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .debug-bar-hint code {
            background: var(--bg-subtle);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-size: 10px;
          }
          .mode-badge {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
          }
          .mode-dev { background: rgba(245,158,11,0.15); color: var(--warning); }
          .mode-prod { background: rgba(0,220,130,0.12); color: var(--accent); }
          .mode-toggle {
            display: inline-flex;
            border-radius: 4px;
            overflow: hidden;
            background: var(--bg-subtle);
            padding: 2px;
            gap: 1px;
          }
          .mode-toggle a {
            padding: 0.2rem 0.4rem;
            font-size: 9px;
            font-weight: 500;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 2px;
            transition: all 0.15s;
          }
          .mode-toggle a:hover { color: var(--text); }
          .mode-toggle a.active {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.15s;
          }
          .btn-primary {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn-primary:hover { background: var(--accent-hover); color: #0a0a0a; }
          .btn svg { width: 12px; height: 12px; }

          /* Error banner */
          .error-banner {
            background: var(--error-bg);
            border-bottom: 1px solid rgba(239,68,68,0.2);
            padding: 0.75rem 1.5rem;
            color: #fca5a5;
            font-size: 12px;
          }
          .error-banner strong { color: var(--error); }
          .error-item { display: block; margin-top: 0.375rem; color: #fca5a5; }
          .error-debug-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.625rem;
            padding: 0.25rem 0.5rem;
            background: var(--error);
            color: #fff;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.15s;
          }
          .error-debug-link:hover { background: #dc2626; color: #fff; }

          /* Main content */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }
          .header {
            margin-bottom: 1.25rem;
          }
          .header h1 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
            color: var(--text);
          }
          .header-meta {
            color: var(--text-muted);
            font-size: 12px;
          }
          .header-meta a {
            color: var(--text-muted);
            text-decoration: underline;
            text-decoration-color: var(--border);
            text-underline-offset: 2px;
          }
          .header-meta a:hover { color: var(--accent); text-decoration-color: var(--accent); }

          /* Table */
          .table-wrap {
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-elevated);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 0.625rem 1rem;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            background: var(--bg-subtle);
            border-bottom: 1px solid var(--border);
          }
          td {
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text);
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.02); }
          td a {
            text-decoration: none;
            word-break: break-all;
            color: var(--text);
          }
          td a:hover { color: var(--accent); }
          .inline-warning {
            font-size: 11px;
            color: var(--warning);
            margin-top: 0.25rem;
            line-height: 1.4;
          }
          .inline-warning::before {
            content: "\u26A0 ";
          }
          .count {
            display: inline-block;
            min-width: 1.25rem;
            padding: 0.125rem 0.375rem;
            background: var(--bg-subtle);
            border-radius: 4px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            font-variant-numeric: tabular-nums;
          }
          .count:empty::before { content: "0"; }

          /* Light mode */
          @media (prefers-color-scheme: light) {
            :root {
              --accent: #00a963;
              --accent-hover: #008f54;
              --bg: #ffffff;
              --bg-elevated: #f5f5f5;
              --bg-subtle: #ebebeb;
              --border: #d4d4d4;
              --border-subtle: #e5e5e5;
              --text: #171717;
              --text-muted: #525252;
              --text-faint: #737373;
              --error: #dc2626;
              --error-bg: rgba(220,38,38,0.08);
              --warning: #b45309;
            }
            tr:hover td { background: rgba(0,0,0,0.02); }
            .btn-primary { color: #fff; }
            .btn-primary:hover { color: #fff; }
            .mode-toggle a.active { color: #fff; }
            .error-banner { color: #991b1b; }
            .error-item { color: #b91c1c; }
            .error-debug-link { color: #fff; }
            .error-debug-link:hover { color: #fff; }
          }

          .debug-bar-version {
            color: var(--text-faint);
            font-size: 10px;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .debug-bar { padding: 0 0.75rem; gap: 0.5rem; width: 95%; }
            .debug-bar-brand span { display: none; }
            .debug-bar-hint { display: none; }
            .debug-bar-version { display: none; }
            .mode-badge { display: none; }
            .container { padding: 1rem; }
            th, td { padding: 0.5rem 0.75rem; }
          }
          ${""}
        </style>
      </head>
      <body>
        ${hasRuntimeErrors ? `<div class="error-banner">
            <strong>Sitemap Generation Errors</strong>
            ${fetchErrors.join("")}
            <a href="${debugUrl}" target="_blank" class="error-debug-link">View Debug Info \u2192</a>
          </div>` : ""}
        <div class="container">
          <div class="header">
            <h1>${xmlEscape(title)}</h1>
            <div class="header-meta">
              ${isNotIndexButHasIndex ? `Part of <a href="${xmlEscape(fixPath("/sitemap_index.xml"))}">${xmlEscape(fixPath("/sitemap_index.xml"))}</a> \xB7 ` : ""}
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps
              </xsl:if>
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs
              </xsl:if>
            </div>
          </div>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:70%">Sitemap</th>
                    <th style="width:30%">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <xsl:variable name="sitemapURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <tr>
                      <td>
                        <a href="{$sitemapURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of
                          select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    ${columns.map((c) => `<th style="width:${c.width}">${c.label}</th>`).join("\n")}
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <xsl:variable name="itemURL">
                          <xsl:value-of select="sitemap:loc"/>
                        </xsl:variable>
                        <a href="{$itemURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                        ${""}
                      </td>
                      ${columns.filter((c) => c.label !== "URL").map((c) => `<td><span class="count"><xsl:value-of select="${c.select}"/></span></td>`).join("\n")}
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
        </div>
        ${""}
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
});

function resolve(s, resolvers) {
  if (typeof s === "undefined")
    return void 0;
  const str = typeof s === "string" ? s : s.toString();
  if (!resolvers)
    return str;
  if (hasProtocol(str, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(str);
  return resolvers.canonicalUrlResolver(str);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const input = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (input.url && !input.loc) {
    input.loc = input.url;
  }
  delete input.url;
  if (typeof input.loc !== "string") {
    input.loc = "";
  }
  const skipEncoding = input._encoded === true;
  const e = input;
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch {
    e._path = null;
  }
  if (e._path) {
    const search = e._path.search;
    const qs = search && search.length > 1 ? stringifyQuery(parseQuery(search)) : "";
    const pathname = skipEncoding ? e._path.pathname : encodePath(e._path.pathname);
    e._relativeLoc = `${pathname}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!skipEncoding && !isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu(_e, defaults);
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (const alt of alternatives) {
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (const img of images) {
      img.loc = resolve(img.loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (const video of videos) {
      if (video.content_loc) {
        video.content_loc = resolve(video.content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    const tIdx = d.indexOf("T");
    if (tIdx !== -1) {
      const t = d.slice(tIdx + 1);
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number")
    return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number")
    return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title))
        missingFields.push("title");
      if (!isValidString(video.thumbnail_loc))
        missingFields.push("thumbnail_loc");
      if (!isValidString(video.description))
        missingFields.push("description");
      if (!isValidString(video.content_loc))
        missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  return Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function normalizeSourceInput(source) {
  if (typeof source === "string") {
    return { context: { name: "hook" }, fetch: source };
  }
  if (Array.isArray(source)) {
    return { context: { name: "hook" }, fetch: source };
  }
  return source;
}
async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event && !isExternalUrl ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
async function globalSitemapSources() {
  const m = await import('../virtual/global-sources.mjs');
  return [...m.sources];
}
async function childSitemapSources(definition) {
  if (!definition?._hasSourceChunk)
    return [];
  const m = await import('../virtual/child-sources.mjs');
  return [...m.sources[definition.sitemapName] || []];
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      const normalized = normalizeSourceInput(source);
      if ("urls" in normalized) {
        return {
          timeTakenMs: 0,
          ...normalized,
          urls: normalized.urls
        };
      }
      if (normalized.fetch)
        return fetchDataSource(normalized, event);
      return {
        ...normalized,
        error: "Invalid source"
      };
    })
  )).flat();
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize) {
  defaultChunkSize = defaultChunkSize || 1e3;
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function getSitemapConfig(sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked) {
    if (chunkInfo.baseSitemapName === "sitemap" && typeof sitemaps.chunks !== "undefined") {
      return {
        ...sitemaps.chunks,
        sitemapName,
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
    const baseSitemap = sitemaps[chunkInfo.baseSitemapName];
    if (baseSitemap) {
      return {
        ...baseSitemap,
        sitemapName,
        // Use the full name with chunk index
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
  }
  return sitemaps[sitemapName];
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
function yesNo(v) {
  return v === "yes" || v === true ? "yes" : "no";
}
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url, NL, I1, I2, I3, I4) {
  let xml = `${I1}<url>${NL}`;
  if (url.loc)
    xml += `${I2}<loc>${xmlEscape(url.loc)}</loc>${NL}`;
  if (url.lastmod)
    xml += `${I2}<lastmod>${xmlEscape(url.lastmod)}</lastmod>${NL}`;
  if (url.changefreq)
    xml += `${I2}<changefreq>${xmlEscape(url.changefreq)}</changefreq>${NL}`;
  if (url.priority !== void 0) {
    const p = typeof url.priority === "number" ? url.priority : Number.parseFloat(url.priority);
    xml += `${I2}<priority>${p.toFixed(1)}</priority>${NL}`;
  }
  if (url.alternatives) {
    for (const alt of url.alternatives) {
      let attrs = "";
      for (const [k, v] of Object.entries(alt)) attrs += ` ${k}="${xmlEscape(String(v))}"`;
      xml += `${I2}<xhtml:link rel="alternate"${attrs} />${NL}`;
    }
  }
  if (url.images) {
    for (const img of url.images) {
      xml += `${I2}<image:image>${NL}${I3}<image:loc>${xmlEscape(img.loc)}</image:loc>${NL}`;
      if (img.title)
        xml += `${I3}<image:title>${xmlEscape(img.title)}</image:title>${NL}`;
      if (img.caption)
        xml += `${I3}<image:caption>${xmlEscape(img.caption)}</image:caption>${NL}`;
      if (img.geo_location)
        xml += `${I3}<image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>${NL}`;
      if (img.license)
        xml += `${I3}<image:license>${xmlEscape(img.license)}</image:license>${NL}`;
      xml += `${I2}</image:image>${NL}`;
    }
  }
  if (url.videos) {
    for (const video of url.videos) {
      xml += `${I2}<video:video>${NL}${I3}<video:title>${xmlEscape(video.title)}</video:title>${NL}`;
      if (video.thumbnail_loc)
        xml += `${I3}<video:thumbnail_loc>${xmlEscape(video.thumbnail_loc)}</video:thumbnail_loc>${NL}`;
      xml += `${I3}<video:description>${xmlEscape(video.description)}</video:description>${NL}`;
      if (video.content_loc)
        xml += `${I3}<video:content_loc>${xmlEscape(video.content_loc)}</video:content_loc>${NL}`;
      if (video.player_loc)
        xml += `${I3}<video:player_loc>${xmlEscape(video.player_loc)}</video:player_loc>${NL}`;
      if (video.duration !== void 0)
        xml += `${I3}<video:duration>${escapeValueForXml(video.duration)}</video:duration>${NL}`;
      if (video.expiration_date)
        xml += `${I3}<video:expiration_date>${xmlEscape(video.expiration_date)}</video:expiration_date>${NL}`;
      if (video.rating !== void 0)
        xml += `${I3}<video:rating>${escapeValueForXml(video.rating)}</video:rating>${NL}`;
      if (video.view_count !== void 0)
        xml += `${I3}<video:view_count>${escapeValueForXml(video.view_count)}</video:view_count>${NL}`;
      if (video.publication_date)
        xml += `${I3}<video:publication_date>${xmlEscape(video.publication_date)}</video:publication_date>${NL}`;
      if (video.family_friendly !== void 0)
        xml += `${I3}<video:family_friendly>${yesNo(video.family_friendly)}</video:family_friendly>${NL}`;
      if (video.restriction)
        xml += `${I3}<video:restriction relationship="${xmlEscape(video.restriction.relationship || "allow")}">${xmlEscape(video.restriction.restriction)}</video:restriction>${NL}`;
      if (video.platform)
        xml += `${I3}<video:platform relationship="${xmlEscape(video.platform.relationship || "allow")}">${xmlEscape(video.platform.platform)}</video:platform>${NL}`;
      if (video.requires_subscription !== void 0)
        xml += `${I3}<video:requires_subscription>${yesNo(video.requires_subscription)}</video:requires_subscription>${NL}`;
      if (video.price) {
        for (const price of video.price) {
          const c = price.currency ? ` currency="${xmlEscape(price.currency)}"` : "";
          const t = price.type ? ` type="${xmlEscape(price.type)}"` : "";
          xml += `${I3}<video:price${c}${t}>${xmlEscape(String(price.price ?? ""))}</video:price>${NL}`;
        }
      }
      if (video.uploader) {
        const info = video.uploader.info ? ` info="${xmlEscape(video.uploader.info)}"` : "";
        xml += `${I3}<video:uploader${info}>${xmlEscape(video.uploader.uploader)}</video:uploader>${NL}`;
      }
      if (video.live !== void 0)
        xml += `${I3}<video:live>${yesNo(video.live)}</video:live>${NL}`;
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        for (const t of tags) xml += `${I3}<video:tag>${xmlEscape(t)}</video:tag>${NL}`;
      }
      if (video.category)
        xml += `${I3}<video:category>${xmlEscape(video.category)}</video:category>${NL}`;
      if (video.gallery_loc)
        xml += `${I3}<video:gallery_loc>${xmlEscape(video.gallery_loc)}</video:gallery_loc>${NL}`;
      xml += `${I2}</video:video>${NL}`;
    }
  }
  if (url.news) {
    xml += `${I2}<news:news>${NL}${I3}<news:publication>${NL}`;
    xml += `${I4}<news:name>${xmlEscape(url.news.publication.name)}</news:name>${NL}`;
    xml += `${I4}<news:language>${xmlEscape(url.news.publication.language)}</news:language>${NL}`;
    xml += `${I3}</news:publication>${NL}`;
    if (url.news.title)
      xml += `${I3}<news:title>${xmlEscape(url.news.title)}</news:title>${NL}`;
    if (url.news.publication_date)
      xml += `${I3}<news:publication_date>${xmlEscape(url.news.publication_date)}</news:publication_date>${NL}`;
    xml += `${I2}</news:news>${NL}`;
  }
  xml += `${I1}</url>`;
  return xml;
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo?.messages.length) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  const NL = minify ? "" : "\n";
  const I1 = minify ? "" : "    ";
  const I2 = minify ? "" : "        ";
  const I3 = minify ? "" : "            ";
  const I4 = minify ? "" : "                ";
  let xml = xslHref ? `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>${NL}` : `<?xml version="1.0" encoding="UTF-8"?>${NL}`;
  xml += URLSET_OPENING_TAG + NL;
  for (const url of urls) {
    xml += buildUrlXml(url, NL, I1, I2, I3, I4) + NL;
  }
  xml += "</urlset>";
  if (credits) {
    xml += `${NL}<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  return xml;
}

const SERVER_CACHE_MAX_AGE$2 = staticConfig.cacheMaxAgeSeconds || 60 * 10;
function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers, baseURL) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  }, baseURL || "/");
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    const localeByCode = new Map(autoI18n.locales.map((l) => [l.code, l]));
    const isPrefixStrategy = autoI18n.strategy === "prefix";
    const isPrefixExceptOrAndDefault = autoI18n.strategy === "prefix_and_default" || autoI18n.strategy === "prefix_except_default";
    const xDefaultAndLocales = [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales];
    const defaultLocale = autoI18n.defaultLocale;
    const hasPages = !!autoI18n.pages;
    const hasDifferentDomains = !!autoI18n.differentDomains;
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = localeByCode.get(localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path?.search || ""}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = (withoutPrefixPaths[e._pathWithoutPrefix] || []).map((u) => {
          const entries = [];
          if (u._locale.code === defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (hasDifferentDomains) {
          const defLocale = localeByCode.get(defaultLocale);
          e.alternatives = [
            {
              ...defLocale,
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          const pageMatch = hasPages ? findPageMapping(e._pathWithoutPrefix, autoI18n.pages) : null;
          const pathSearch = e._path?.search || "";
          const pathWithoutPrefix = e._pathWithoutPrefix;
          for (const l of autoI18n.locales) {
            let loc = pathWithoutPrefix;
            if (pageMatch && pageMatch.mappings[l.code] !== void 0) {
              const customPath = pageMatch.mappings[l.code];
              if (customPath === false)
                continue;
              if (typeof customPath === "string") {
                loc = customPath[0] === "/" ? customPath : `/${customPath}`;
                loc = applyDynamicParams(loc, pageMatch.paramSegments);
                if (isPrefixStrategy || isPrefixExceptOrAndDefault && l.code !== defaultLocale)
                  loc = joinURL(`/${l.code}`, loc);
              }
            } else if (!hasDifferentDomains && !(isPrefixExceptOrAndDefault && l.code === defaultLocale)) {
              loc = joinURL(`/${l.code}`, pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const alternatives = [];
            for (const locale of xDefaultAndLocales) {
              const code = locale.code === "x-default" ? defaultLocale : locale.code;
              const isDefault = locale.code === "x-default" || locale.code === defaultLocale;
              let href = pathWithoutPrefix;
              if (pageMatch && pageMatch.mappings[code] !== void 0) {
                const customPath = pageMatch.mappings[code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string") {
                  href = customPath[0] === "/" ? customPath : `/${customPath}`;
                  href = applyDynamicParams(href, pageMatch.paramSegments);
                  if (isPrefixStrategy || isPrefixExceptOrAndDefault && !isDefault)
                    href = joinURL("/", code, href);
                }
              } else if (isPrefixStrategy) {
                href = joinURL("/", code, pathWithoutPrefix);
              } else if (isPrefixExceptOrAndDefault && !isDefault) {
                href = joinURL("/", code, pathWithoutPrefix);
              }
              if (!filterPath(href))
                continue;
              alternatives.push({
                hreflang: locale._hreflang,
                href
              });
            }
            const { _index: _, ...rest } = e;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...rest,
              _key: `${_sitemap || ""}${loc || "/"}${pathSearch}`,
              _locale: l,
              loc,
              alternatives
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path?.search || ""}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildResolvedSitemapUrls(effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro) {
  const { sitemaps, autoI18n, isI18nMapped, isMultiSitemap, sortEntries } = runtimeConfig;
  let sourcesInput = effectiveSitemap.includeAppSources ? [...await globalSitemapSources(), ...await childSitemapSources(effectiveSitemap)] : await childSitemapSources(effectiveSitemap);
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: matchName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: matchName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(effectiveSitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers, useRuntimeConfig().app.baseURL);
  if (isMultiSitemap) {
    const sitemapNames = Object.keys(sitemaps).filter((k) => k !== "index");
    const warnedSitemaps = nitro?._sitemapWarnedSitemaps || /* @__PURE__ */ new Set();
    for (const e of enhancedUrls) {
      const hasMatchingSitemap = typeof e._sitemap === "string" && (sitemapNames.includes(e._sitemap) || isI18nMapped && sitemapNames.some((name) => name.startsWith(`${e._sitemap}-`)));
      if (typeof e._sitemap === "string" && !hasMatchingSitemap) {
        if (!warnedSitemaps.has(e._sitemap)) {
          warnedSitemaps.add(e._sitemap);
          logger.error(`Sitemap \`${e._sitemap}\` not found in sitemap config. Available sitemaps: ${sitemapNames.join(", ")}. Entry \`${e.loc}\` will be omitted.`);
        }
      }
    }
    if (nitro) {
      nitro._sitemapWarnedSitemaps = warnedSitemaps;
    }
  }
  const filteredUrls = enhancedUrls.filter((e) => {
    if (e._sitemap === false)
      return false;
    if (isMultiSitemap && e._sitemap && matchName) {
      if (isChunked)
        return e._sitemap === matchName;
      return e._sitemap === matchName || isI18nMapped && matchName.startsWith(`${e._sitemap}-`);
    }
    return true;
  });
  const urls = sortEntries ? sortInPlace(filteredUrls) : filteredUrls;
  return { urls, failedSources };
}
const buildResolvedSitemapUrlsCached = defineCachedFunction(
  async (_event, effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro) => buildResolvedSitemapUrls(effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro),
  {
    name: "sitemap:resolved-urls",
    group: "sitemap",
    base: "sitemap",
    maxAge: SERVER_CACHE_MAX_AGE$2,
    getKey: (event, _effectiveSitemap, matchName, isChunked) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      return `resolved-${isChunked ? "chunked-" : ""}${matchName}-${proto}-${host}`;
    },
    swr: true
  }
);
async function getResolvedSitemapUrls(effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro) {
  const event = resolvers.event;
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  if (shouldCache && event) {
    return buildResolvedSitemapUrlsCached(event, effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro);
  }
  return buildResolvedSitemapUrls(effectiveSitemap, matchName, isChunked, resolvers, runtimeConfig, nitro);
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const { sitemaps, autoI18n, defaultSitemapsChunkSize } = runtimeConfig;
  const chunkSize = defaultSitemapsChunkSize || void 0;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, chunkSize);
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => e.language === sitemap.sitemapName || e.code === sitemap.sitemapName)?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  const matchName = chunkInfo.isChunked ? baseSitemapName : sitemap.sitemapName;
  const resolved = await getResolvedSitemapUrls(effectiveSitemap, matchName, chunkInfo.isChunked, resolvers, runtimeConfig, nitro);
  const urls = sliceUrlsForChunk(resolved.urls, sitemap.sitemapName, sitemaps, chunkSize);
  return { urls, failedSources: resolved.failedSources };
}

const SERVER_CACHE_MAX_AGE$1 = staticConfig.cacheMaxAgeSeconds || 60 * 10;
const buildSitemapIndexCached = defineCachedFunction(
  async (event, resolvers, runtimeConfig, nitro) => {
    return buildSitemapIndexInternal(resolvers, runtimeConfig, nitro);
  },
  {
    name: "sitemap:index",
    group: "sitemap",
    maxAge: SERVER_CACHE_MAX_AGE$1,
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      return `sitemap-index-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function buildSitemapIndexInternal(resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    autoLastmod,
    defaultSitemapsChunkSize,
    sitemapsPathPrefix
  } = runtimeConfig;
  if (!sitemaps)
    throw new Error("Attempting to build a sitemap index without required `sitemaps` configuration.");
  const nonChunkedNames = [];
  const allFailedSources = [];
  for (const sitemapName in sitemaps) {
    if (sitemapName === "index" || sitemapName === "chunks")
      continue;
    const sitemapConfig = sitemaps[sitemapName];
    if (sitemapConfig.chunks || sitemapConfig._isChunking) {
      sitemapConfig._isChunking = true;
      sitemapConfig._chunkSize = sitemapConfig.chunkSize || (typeof sitemapConfig.chunks === "number" ? sitemapConfig.chunks : defaultSitemapsChunkSize || 1e3);
    } else {
      nonChunkedNames.push(sitemapName);
    }
  }
  const indexLastmod = autoLastmod ? normaliseDate(/* @__PURE__ */ new Date()) : void 0;
  const entries = [];
  if (typeof sitemaps.chunks !== "undefined") {
    const sitemap = sitemaps.chunks;
    const resolved = await getResolvedSitemapUrls(sitemap, "sitemap", true, resolvers, runtimeConfig, nitro);
    allFailedSources.push(...resolved.failedSources);
    const chunkCount = Math.ceil(resolved.urls.length / defaultSitemapsChunkSize);
    for (let i = 0; i < chunkCount; i++) {
      const entry = {
        _sitemapName: String(i),
        sitemap: resolvers.canonicalUrlResolver(joinURL(sitemapsPathPrefix || "", `/${i}.xml`))
      };
      if (indexLastmod)
        entry.lastmod = indexLastmod;
      entries.push(entry);
    }
  }
  for (const name of nonChunkedNames) {
    const entry = {
      _sitemapName: name,
      sitemap: resolvers.canonicalUrlResolver(joinURL(sitemapsPathPrefix || "", `/${name}.xml`))
    };
    if (indexLastmod)
      entry.lastmod = indexLastmod;
    entries.push(entry);
  }
  for (const sitemapName in sitemaps) {
    const sitemapConfig = sitemaps[sitemapName];
    if (sitemapName !== "index" && sitemapConfig._isChunking) {
      const chunkSize = sitemapConfig._chunkSize || defaultSitemapsChunkSize || 1e3;
      let chunkCount;
      if (typeof sitemapConfig.chunkCount === "number" && sitemapConfig.chunkCount > 0) {
        chunkCount = sitemapConfig.chunkCount;
      } else {
        const resolved = await getResolvedSitemapUrls(sitemapConfig, sitemapName, true, resolvers, runtimeConfig, nitro);
        allFailedSources.push(...resolved.failedSources);
        chunkCount = Math.ceil(resolved.urls.length / chunkSize);
      }
      sitemapConfig._chunkCount = chunkCount;
      for (let i = 0; i < chunkCount; i++) {
        const chunkName = `${sitemapName}-${i}`;
        const entry = {
          _sitemapName: chunkName,
          sitemap: resolvers.canonicalUrlResolver(joinURL(sitemapsPathPrefix || "", `/${chunkName}.xml`))
        };
        if (indexLastmod)
          entry.lastmod = indexLastmod;
        entries.push(entry);
      }
    }
  }
  if (sitemaps.index) {
    entries.push(...sitemaps.index.sitemaps.map((entry) => {
      return typeof entry === "string" ? { sitemap: entry } : entry;
    }));
  }
  return { entries, failedSources: allFailedSources };
}
function urlsToIndexXml(sitemaps, resolvers, { version, xsl, credits, minify }, errorInfo) {
  const sitemapXml = sitemaps.map((e) => [
    "    <sitemap>",
    `        <loc>${escapeValueForXml(e.sitemap)}</loc>`,
    // lastmod is optional
    e.lastmod ? `        <lastmod>${escapeValueForXml(e.lastmod)}</lastmod>` : false,
    "    </sitemap>"
  ].filter(Boolean).join("\n")).join("\n");
  const xmlParts = [
    '<?xml version="1.0" encoding="UTF-8"?>'
  ];
  if (xsl) {
    let relativeBaseUrl = resolvers.relativeBaseUrlResolver?.(xsl) ?? xsl;
    if (errorInfo && errorInfo.messages.length > 0) {
      relativeBaseUrl = withQuery(relativeBaseUrl, {
        errors: "true",
        error_messages: errorInfo.messages,
        error_urls: errorInfo.urls
      });
    }
    xmlParts.push(`<?xml-stylesheet type="text/xsl" href="${escapeValueForXml(relativeBaseUrl)}"?>`);
  }
  xmlParts.push(
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapXml,
    "</sitemapindex>"
  );
  if (credits) {
    xmlParts.push(`<!-- XML Sitemap Index generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`);
  }
  return minify ? xmlParts.join("").replace(/(?<!<[^>]*)\s(?![^<]*>)/g, "") : xmlParts.join("\n");
}
async function buildSitemapIndex(resolvers, runtimeConfig, nitro) {
  if (typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0 && resolvers.event) {
    return buildSitemapIndexCached(resolvers.event, resolvers, runtimeConfig, nitro);
  }
  return buildSitemapIndexInternal(resolvers, runtimeConfig, nitro);
}

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(withoutTrailingSlash(withoutQuery(path)), app.baseURL)
    ).reverse());
  };
}

const SERVER_CACHE_MAX_AGE = staticConfig.cacheMaxAgeSeconds || 60 * 10;
function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = getSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || true,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    if (!getPathRobotConfig(event, { path, skipSiteIndexable: true }).indexable)
      continue;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const defaults = definition.defaults || {};
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError$1({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
const buildSitemapXmlCached = defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: SERVER_CACHE_MAX_AGE,
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  const xml = shouldCache ? await buildSitemapXmlCached(event, definition, resolvers, runtimeConfig) : await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

async function sitemapXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps)
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 301);
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
}
async function sitemapIndexXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const nitro = useNitroApp();
  const resolvers = useNitroUrlResolvers(e);
  const { entries: sitemaps, failedSources } = await buildSitemapIndex(resolvers, runtimeConfig, nitro);
  const indexResolvedCtx = { sitemaps, event: e };
  await nitro.hooks.callHook("sitemap:index-resolved", indexResolvedCtx);
  const errorInfo = failedSources.length > 0 ? { messages: failedSources.map((f) => f.error), urls: failedSources.map((f) => f.url) } : void 0;
  const output = urlsToIndexXml(indexResolvedCtx.sitemaps, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap: output, sitemapName: "sitemap", event: e };
  await nitro.hooks.callHook("sitemap:output", ctx);
  setHeader(e, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(e, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(e, "X-Sitemap-Generated", now.toISOString());
    setHeader(e, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(e, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(e, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  }
  return ctx.sitemap;
}
async function sitemapChildXmlEventHandler(e) {
  if (!e.path.endsWith(".xml"))
    return;
  const runtimeConfig = useSitemapRuntimeConfig(e);
  const { sitemaps } = runtimeConfig;
  let sitemapName = getRouterParam(e, "sitemap");
  if (!sitemapName) {
    const path = e.path;
    const match = path.match(/(?:\/__sitemap__\/)?(.+)\.xml$/);
    if (match)
      sitemapName = match[1];
  }
  if (!sitemapName)
    throw createError$1({ statusCode: 400, message: "Invalid sitemap request" });
  sitemapName = sitemapName.replace(/\.xml$/, "");
  sitemapName = withLeadingSlash(sitemapName);
  if (sitemapName.startsWith("/__sitemap__/"))
    sitemapName = sitemapName.replace("/__sitemap__/", "/");
  if (runtimeConfig.sitemapsPathPrefix) {
    const prefix = withLeadingSlash(runtimeConfig.sitemapsPathPrefix);
    if (sitemapName.startsWith(prefix))
      sitemapName = sitemapName.replace(prefix, "/");
  }
  sitemapName = withoutLeadingSlash(withoutTrailingSlash(sitemapName));
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, runtimeConfig.defaultSitemapsChunkSize);
  const isAutoChunked = typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName));
  const sitemapExists = sitemapName in sitemaps || chunkInfo.baseSitemapName in sitemaps || isAutoChunked;
  if (!sitemapExists)
    throw createError$1({ statusCode: 404, message: `Sitemap "${sitemapName}" not found.` });
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const baseSitemap = sitemaps[chunkInfo.baseSitemapName];
    if (baseSitemap && !baseSitemap.chunks && !baseSitemap._isChunking)
      throw createError$1({ statusCode: 404, message: `Sitemap "${chunkInfo.baseSitemapName}" does not support chunking.` });
    if (baseSitemap?._chunkCount !== void 0 && chunkInfo.chunkIndex >= baseSitemap._chunkCount)
      throw createError$1({ statusCode: 404, message: `Chunk ${chunkInfo.chunkIndex} does not exist for sitemap "${chunkInfo.baseSitemapName}".` });
  }
  const sitemapConfig = getSitemapConfig(sitemapName, sitemaps, runtimeConfig.defaultSitemapsChunkSize || void 0);
  return createSitemap(e, sitemapConfig, runtimeConfig);
}

const _nNX93q = defineEventHandler(sitemapXmlEventHandler);

const _LW2qzi = eventHandler(async (event) => {
  const collection = getRouterParam(event, "collection") || event.path?.split("/")?.[2] || "";
  setHeader(event, "Content-Type", "text/plain");
  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || "";
  if (data) {
    const lineStart = `export const ${collection} = "`;
    const content = String(data).split("\n").find((line) => line.startsWith(lineStart));
    if (content) {
      return content.substring(lineStart.length, content.length - 1);
    }
  }
  return await import('../build/database.compressed.mjs').then((m) => m[collection]);
});

const storage = prefixStorage(useStorage(), "i18n");
function cachedFunctionI18n(fn, opts) {
  opts = { maxAge: 1, ...opts };
  const pending = {};
  async function get(key, resolver) {
    const isPending = pending[key];
    if (!isPending) {
      pending[key] = Promise.resolve(resolver());
    }
    try {
      return await pending[key];
    } finally {
      delete pending[key];
    }
  }
  return async (...args) => {
    const key = [opts.name, opts.getKey(...args)].join(":").replace(/:\/$/, ":index");
    const maxAge = opts.maxAge ?? 1;
    const isCacheable = !opts.shouldBypassCache(...args) && maxAge >= 0;
    const cache = isCacheable && await storage.getItemRaw(key);
    if (!cache || cache.ttl < Date.now()) {
      pending[key] = Promise.resolve(fn(...args));
      const value = await get(key, () => fn(...args));
      if (isCacheable) {
        await storage.setItemRaw(key, { ttl: Date.now() + maxAge * 1e3, value, mtime: Date.now() });
      }
      return value;
    }
    return cache.value;
  };
}

const _getMessages = async (locale) => {
  return { [locale]: await getLocaleMessagesMerged(locale, localeLoaders[locale]) };
};
const _getMessagesCached = cachedFunctionI18n(_getMessages, {
  name: "messages",
  maxAge: 60 * 60 * 24,
  getKey: (locale) => locale,
  shouldBypassCache: (locale) => !isLocaleCacheable(locale)
});
const getMessages = _getMessagesCached;
const _getMergedMessages = async (locale, fallbackLocales) => {
  const merged = {};
  try {
    if (fallbackLocales.length > 0) {
      const messages = await Promise.all(fallbackLocales.map(getMessages));
      for (const message2 of messages) {
        deepCopy(message2, merged);
      }
    }
    const message = await getMessages(locale);
    deepCopy(message, merged);
    return merged;
  } catch (e) {
    throw new Error("Failed to merge messages: " + e.message);
  }
};
const getMergedMessages = cachedFunctionI18n(_getMergedMessages, {
  name: "merged-single",
  maxAge: 60 * 60 * 24,
  getKey: (locale, fallbackLocales) => `${locale}-[${[...new Set(fallbackLocales)].sort().join("-")}]`,
  shouldBypassCache: (locale, fallbackLocales) => !isLocaleWithFallbacksCacheable(locale, fallbackLocales)
});
const _getAllMergedMessages = async (locales) => {
  const merged = {};
  try {
    const messages = await Promise.all(locales.map(getMessages));
    for (const message of messages) {
      deepCopy(message, merged);
    }
    return merged;
  } catch (e) {
    throw new Error("Failed to merge messages: " + e.message);
  }
};
cachedFunctionI18n(_getAllMergedMessages, {
  name: "merged-all",
  maxAge: 60 * 60 * 24,
  getKey: (locales) => locales.join("-"),
  shouldBypassCache: (locales) => !locales.every((locale) => isLocaleCacheable(locale))
});

const _messagesHandler = defineEventHandler(async (event) => {
  const locale = getRouterParam(event, "locale");
  if (!locale) {
    throw createError$1({ status: 400, message: "Locale not specified." });
  }
  const ctx = useI18nContext(event);
  if (ctx.localeConfigs && locale in ctx.localeConfigs === false) {
    throw createError$1({ status: 404, message: `Locale '${locale}' not found.` });
  }
  const messages = await getMergedMessages(locale, ctx.localeConfigs?.[locale]?.fallbacks ?? []);
  deepCopy(messages, ctx.messages);
  return ctx.messages;
});
const _cachedMessageLoader = defineCachedFunction(_messagesHandler, {
  name: "i18n:messages-internal",
  maxAge: 60 * 60 * 24,
  getKey: (event) => [getRouterParam(event, "locale") ?? "null", getRouterParam(event, "hash") ?? "null"].join("-"),
  async shouldBypassCache(event) {
    const locale = getRouterParam(event, "locale");
    if (locale == null) {
      return false;
    }
    const ctx = tryUseI18nContext(event) || await initializeI18nContext(event);
    return !ctx.localeConfigs?.[locale]?.cacheable;
  }
});
const _messagesHandlerCached = defineCachedEventHandler(_cachedMessageLoader, {
  name: "i18n:messages",
  maxAge: 10,
  swr: false,
  getKey: (event) => [getRouterParam(event, "locale") ?? "null", getRouterParam(event, "hash") ?? "null"].join("-")
});
const _WYuRDj = _messagesHandlerCached;

async function decompressSQLDump(base64Str, compressionType = "gzip") {
  let binaryData;
  if (typeof Buffer !== "undefined") {
    const buffer = Buffer.from(base64Str, "base64");
    binaryData = Uint8Array.from(buffer);
  } else if (typeof atob !== "undefined") {
    binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  } else {
    throw new TypeError("No base64 decoding method available");
  }
  const response = new Response(new Blob([binaryData]));
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text);
}

function refineContentFields(sql, doc) {
  const fields = findCollectionFields(sql);
  const item = { ...doc };
  for (const key in item) {
    if (fields[key] === "json" && item[key] && item[key] !== "undefined") {
      item[key] = JSON.parse(item[key]);
    }
    if (fields[key] === "boolean" && item[key] !== "undefined") {
      item[key] = Boolean(item[key]);
    }
  }
  for (const key in item) {
    if (item[key] === "NULL") {
      item[key] = void 0;
    }
  }
  return item;
}
function findCollectionFields(sql) {
  const table = sql.match(/FROM\s+(\w+)/);
  if (!table) {
    return {};
  }
  const info = contentManifest[getCollectionName(table[1])];
  return info?.fields || {};
}
function getCollectionName(table) {
  return table.replace(/^_content_/, "");
}

class BoundableStatement {
	_statement;
	constructor(rawStmt) {
		this._statement = rawStmt;
	}
	bind(...params) {
		return new BoundStatement(this, params);
	}
}
class BoundStatement {
	#statement;
	#params;
	constructor(statement, params) {
		this.#statement = statement;
		this.#params = params;
	}
	bind(...params) {
		return new BoundStatement(this.#statement, params);
	}
	all() {
		return this.#statement.all(...this.#params);
	}
	run() {
		return this.#statement.run(...this.#params);
	}
	get() {
		return this.#statement.get(...this.#params);
	}
}

function sqliteConnector(opts) {
	let _db;
	const getDB = () => {
		if (_db) {
			return _db;
		}
		if (opts.name === ":memory:") {
			_db = new Database(":memory:");
			return _db;
		}
		const filePath = resolve$2(opts.cwd || ".", opts.path || `.data/${opts.name || "db"}.sqlite3`);
		mkdirSync(dirname$1(filePath), { recursive: true });
		_db = new Database(filePath);
		return _db;
	};
	return {
		name: "sqlite",
		dialect: "sqlite",
		getInstance: () => getDB(),
		exec: (sql) => getDB().exec(sql),
		prepare: (sql) => new StatementWrapper(() => getDB().prepare(sql)),
		dispose: () => {
			_db?.close?.();
			_db = undefined;
		}
	};
}
class StatementWrapper extends BoundableStatement {
	async all(...params) {
		return this._statement().all(...params);
	}
	async run(...params) {
		const res = this._statement().run(...params);
		return {
			success: res.changes > 0,
			...res
		};
	}
	async get(...params) {
		return this._statement().get(...params);
	}
}

let db;
function loadDatabaseAdapter(config) {
  const { database, localDatabase } = config;
  if (!db) {
    if (["nitro-prerender", "nitro-dev"].includes("node-server")) {
      db = sqliteConnector(refineDatabaseConfig(localDatabase));
    } else {
      db = sqliteConnector(refineDatabaseConfig(database));
    }
  }
  return {
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params).then((result) => (result || []).map((item) => refineContentFields(sql, item)));
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params).then((item) => item ? refineContentFields(sql, item) : item);
    },
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params);
    }
  };
}
const checkDatabaseIntegrity = /* @__PURE__ */ new Map();
const integrityCheckPromise = /* @__PURE__ */ new Map();
async function checkAndImportDatabaseIntegrity(event, collection, config) {
  if (checkDatabaseIntegrity.get(collection) !== false) {
    checkDatabaseIntegrity.set(collection, false);
    if (!integrityCheckPromise.has(collection)) {
      const _integrityCheck = _checkAndImportDatabaseIntegrity(event, collection, checksums[collection], checksumsStructure[collection], config).then((isValid) => {
        checkDatabaseIntegrity.set(collection, !isValid);
      }).catch((error) => {
        console.error("Database integrity check failed", error);
        checkDatabaseIntegrity.set(collection, true);
        integrityCheckPromise.delete(collection);
      });
      integrityCheckPromise.set(collection, _integrityCheck);
    }
  }
  if (integrityCheckPromise.has(collection)) {
    await integrityCheckPromise.get(collection);
  }
}
async function _checkAndImportDatabaseIntegrity(event, collection, integrityVersion, structureIntegrityVersion, config) {
  const db2 = loadDatabaseAdapter(config);
  const before = await db2.first(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => null);
  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    await db2.exec(`DROP TABLE IF EXISTS ${tables.info}`);
    before.version = "";
  }
  const unchangedStructure = before?.structureVersion === structureIntegrityVersion;
  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        return true;
      }
      await waitUntilDatabaseIsReady(db2, collection);
      return true;
    }
    await db2.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]);
    if (!unchangedStructure) {
      await db2.exec(`DROP TABLE IF EXISTS ${tables[collection]}`);
    }
  }
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump);
  const dumpLinesHash = dump.map((row) => row.split(" -- ").pop());
  let hashesInDb = /* @__PURE__ */ new Set();
  if (unchangedStructure) {
    const hashListFromTheDump = new Set(dumpLinesHash);
    const hashesInDbRecords = await db2.all(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => []);
    hashesInDb = new Set(hashesInDbRecords.map((r) => r.__hash__));
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump);
    if (hashesToDelete.size) {
      await db2.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill("?").join(",")})`, Array.from(hashesToDelete));
    }
  }
  await dump.reduce(async (prev, sql, index) => {
    await prev;
    const hash = dumpLinesHash[index];
    const statement = sql.substring(0, sql.length - hash.length - 4);
    if (unchangedStructure) {
      if (hash === "structure") {
        return Promise.resolve();
      }
      if (hashesInDb.has(hash)) {
        return Promise.resolve();
      }
    }
    await db2.exec(statement).catch((err) => {
      const message = err.message || "Unknown error";
      console.error(`Failed to execute SQL ${sql}: ${message}`);
    });
  }, Promise.resolve());
  const after = await db2.first(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: "" }));
  return after?.version === integrityVersion;
}
const REQUEST_TIMEOUT = 90;
async function waitUntilDatabaseIsReady(db2, collection) {
  let iterationCount = 0;
  let interval;
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db2.first(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }));
      if (row?.ready) {
        clearInterval(interval);
        resolve(0);
      }
      if (iterationCount++ > REQUEST_TIMEOUT) {
        clearInterval(interval);
        reject(new Error("Waiting for another database initialization timed out"));
      }
    }, 1e3);
  }).catch((e) => {
    throw e;
  }).finally(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
async function loadDatabaseDump(event, collection) {
  return await fetchDatabase(event, collection).catch((e) => {
    console.error("Failed to fetch compressed dump", e);
    return "";
  });
}
function refineDatabaseConfig(config) {
  if (config.type === "d1") {
    return { ...config, bindingName: config.bindingName || config.binding };
  }
  if (config.type === "sqlite") {
    const _config = { ...config };
    if (config.filename === ":memory:") {
      return { name: ":memory:" };
    }
    if ("filename" in config) {
      const filename = isAbsolute(config?.filename || "") || config?.filename === ":memory:" ? config?.filename : new URL(config.filename, globalThis._importMeta_.url).pathname;
      _config.path = process.platform === "win32" && filename.startsWith("/") ? filename.slice(1) : filename;
    }
    return _config;
  }
  if (config.type === "pglite") {
    return {
      dataDir: config.dataDir,
      // Pass through any other PGlite-specific options
      ...config
    };
  }
  return config;
}

const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i;
const SQL_COUNT_REGEX = /^COUNT\((DISTINCT )?([a-z_]\w+|\*)\) as count$/i;
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/;
function assertSafeQuery(sql, collection) {
  if (!sql) {
    throw new Error("Invalid query: Query cannot be empty");
  }
  const cleanedupQuery = cleanupQuery(sql);
  if (cleanedupQuery !== sql) {
    throw new Error("Invalid query: SQL comments are not allowed");
  }
  const match = sql.match(SQL_SELECT_REGEX);
  if (!match) {
    throw new Error("Invalid query: Query must be a valid SELECT statement with proper syntax");
  }
  const [_, select, from, where, orderBy, order, limit, offset] = match;
  const columns = select?.trim().split(", ") || [];
  if (columns.length === 1) {
    if (columns[0] !== "*" && !columns[0]?.match(SQL_COUNT_REGEX) && !columns[0]?.match(/^"[a-z_]\w+"$/i)) {
      throw new Error(`Invalid query: Column '${columns[0]}' has invalid format. Expected *, COUNT(), or a quoted column name`);
    }
  } else if (!columns.every((column) => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error("Invalid query: Multiple columns must be properly quoted and alphanumeric");
  }
  if (from !== `_content_${collection}`) {
    const collection2 = String(from || "").replace(/^_content_/, "");
    throw new Error(`Invalid query: Collection '${collection2}' does not exist`);
  }
  if (where) {
    if (!where.startsWith(" WHERE (") || !where.endsWith(")")) {
      throw new Error("Invalid query: WHERE clause must be properly enclosed in parentheses");
    }
    const noString = cleanupQuery(where, { removeString: true });
    if (noString.match(SQL_COMMANDS)) {
      throw new Error("Invalid query: WHERE clause contains unsafe SQL commands");
    }
  }
  const _order = (orderBy + " " + order).split(", ");
  if (!_order.every((column) => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error("Invalid query: ORDER BY clause must contain valid column names followed by ASC or DESC");
  }
  if (limit !== void 0 && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error("Invalid query: LIMIT clause must be a positive number");
  }
  if (offset !== void 0 && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error("Invalid query: OFFSET clause must be a positive number");
  }
  return true;
}
function cleanupQuery(query, options = { removeString: false }) {
  let inString = false;
  let stringFence = "";
  let result = "";
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = query[i - 1];
    const nextChar = query[i + 1];
    if (char === "'" || char === '"') {
      if (!options?.removeString) {
        result += char;
        continue;
      }
      if (inString) {
        if (char !== stringFence || nextChar === stringFence || prevChar === stringFence) {
          continue;
        }
        inString = false;
        stringFence = "";
        continue;
      } else {
        inString = true;
        stringFence = char;
        continue;
      }
    }
    if (!inString) {
      if (char === "-" && nextChar === "-") {
        return result;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < query.length && !(query[i] === "*" && query[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }
      result += char;
    }
  }
  return result;
}

const _LjxHiZ = eventHandler(async (event) => {
  const { sql } = await readBody(event);
  const collection = getRouterParam(event, "collection") || event.path?.split("/")?.[2] || "";
  assertSafeQuery(sql, collection);
  const conf = useRuntimeConfig().content;
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf);
  }
  return loadDatabaseAdapter(conf).all(sql);
});

const _8oR7yO = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_1R6ptc = () => import('../routes/api/__sitemap-urls.mjs');
const _lazy_dTYtsc = () => import('../routes/api/bookings/_id_.delete.mjs');
const _lazy_iUBoiH = () => import('../routes/api/bookings/_id_.get.mjs');
const _lazy_DVPY9k = () => import('../routes/api/bookings/_id_.patch.mjs');
const _lazy_Azb53T = () => import('../routes/api/bookings/availability.get.mjs');
const _lazy_go4cXa = () => import('../routes/api/index.get.mjs');
const _lazy_tPqdFs = () => import('../routes/api/index.post.mjs');
const _lazy_3jQSzq = () => import('../routes/api/practitioners.get.mjs');
const _lazy_9X1NuQ = () => import('../routes/api/products/_slug_.get.mjs');
const _lazy_5QEos5 = () => import('../routes/api/index.get2.mjs');
const _lazy_tlC4tI = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });
const _lazy_ArWfCB = () => import('../routes/sitemap_index.xml.mjs');
const _lazy_1gAD1q = () => import('../routes/__sitemap__/_sitemap_.xml.mjs');

const handlers = [
  { route: '', handler: _4NtFRq, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _lbX4nS, lazy: false, middleware: true, method: undefined },
  { route: '/api/__sitemap-urls', handler: _lazy_1R6ptc, lazy: true, middleware: false, method: undefined },
  { route: '/api/bookings/:id', handler: _lazy_dTYtsc, lazy: true, middleware: false, method: "delete" },
  { route: '/api/bookings/:id', handler: _lazy_iUBoiH, lazy: true, middleware: false, method: "get" },
  { route: '/api/bookings/:id', handler: _lazy_DVPY9k, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bookings/availability', handler: _lazy_Azb53T, lazy: true, middleware: false, method: "get" },
  { route: '/api/bookings', handler: _lazy_go4cXa, lazy: true, middleware: false, method: "get" },
  { route: '/api/bookings', handler: _lazy_tPqdFs, lazy: true, middleware: false, method: "post" },
  { route: '/api/practitioners', handler: _lazy_3jQSzq, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/:slug', handler: _lazy_9X1NuQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_5QEos5, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_tlC4tI, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _dymx4J, lazy: false, middleware: true, method: undefined },
  { route: '/robots.txt', handler: _Mf83XD, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _bFUiXz, lazy: false, middleware: true, method: undefined },
  { route: '/__sitemap__/nuxt-content-urls.json', handler: _frbMWK, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap_index.xml', handler: _lazy_ArWfCB, lazy: true, middleware: false, method: undefined },
  { route: '/__sitemap__/**:sitemap', handler: _lazy_1gAD1q, lazy: true, middleware: false, method: undefined },
  { route: '/__sitemap__/style.xsl', handler: _awoSfA, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _nNX93q, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/content/sql_dump.txt', handler: _LW2qzi, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/info/sql_dump.txt', handler: _LW2qzi, lazy: false, middleware: false, method: undefined },
  { route: '/_i18n/:hash/:locale/messages.json', handler: _WYuRDj, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/content/query', handler: _LjxHiZ, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/info/query', handler: _LjxHiZ, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _8oR7yO, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_tlC4tI, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$1(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp = createNitroApp();
function useNitroApp() {
  return nitroApp;
}
runNitroPlugins(nitroApp);

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = options || {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

export { $fetch$1 as $, getResponseStatusText as A, getResponseStatus as B, appId as C, encodePath as D, defineRenderHandler as E, appTeleportTag as F, appTeleportAttrs as G, appHead as H, getRouteRules as I, joinURL as J, sitemapIndexXmlEventHandler as K, sitemapChildXmlEventHandler as L, parseURL as M, decodePath as N, hasProtocol as O, isScriptProtocol as P, withQuery as Q, defu as R, sanitizeStatusCode as S, getContext as T, parsePath as U, parseQuery as V, baseURL as W, createHooks as X, executeAsync as Y, withHttps as Z, withoutTrailingSlash as _, trapUnhandledNodeErrors as a, titleCase as a0, stringifyQuery as a1, camelCase as a2, withLeadingSlash as a3, withBase as a4, withTrailingSlash as a5, getRequestURL as a6, getRequestHeader as a7, getCookie as a8, klona as a9, parse as aa, isEqual as ab, createDefu as ac, setCookie as ad, deleteCookie as ae, isEqual$1 as af, hash$1 as ag, encodeParam as ah, useNitroApp as b, defineEventHandler as c, destr as d, createError$1 as e, deleteBooking as f, getRouterParam as g, getBookingById as h, updateBookingStatus as i, getQuery as j, getAvailableSlots as k, getBookings as l, createBooking as m, getPractitionersByService as n, practitioners as o, products as p, getProductBySlug as q, readBody as r, setupGracefulShutdown as s, toNodeListener as t, useRuntimeConfig as u, getAvailableProducts as v, buildAssetsURL as w, publicAssetsURL as x, appRootTag as y, appRootAttrs as z };
//# sourceMappingURL=nitro.mjs.map
