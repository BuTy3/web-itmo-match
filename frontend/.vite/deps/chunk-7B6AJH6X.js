import {
  useForkRef
} from "./chunk-BSOAWQIA.js";
import {
  useEnhancedEffect_default
} from "./chunk-DSTDWXKE.js";
import {
  require_react
} from "./chunk-GH6UE3LJ.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/@mui/material/esm/utils/useEnhancedEffect.js
var useEnhancedEffect_default2 = useEnhancedEffect_default;

// node_modules/@mui/utils/esm/useEventCallback/useEventCallback.js
var React = __toESM(require_react(), 1);
function useEventCallback(fn) {
  const ref = React.useRef(fn);
  useEnhancedEffect_default(() => {
    ref.current = fn;
  });
  return React.useRef((...args) => (
    // @ts-expect-error hide `this`
    (0, ref.current)(...args)
  )).current;
}
var useEventCallback_default = useEventCallback;

// node_modules/@mui/material/esm/utils/useEventCallback.js
var useEventCallback_default2 = useEventCallback_default;

// node_modules/@mui/material/esm/utils/useForkRef.js
var useForkRef_default = useForkRef;

export {
  useEnhancedEffect_default2 as useEnhancedEffect_default,
  useEventCallback_default,
  useEventCallback_default2,
  useForkRef_default
};
//# sourceMappingURL=chunk-7B6AJH6X.js.map
