// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { useEffect, useRef } from "react";

function useInterval(callback: () => any, delay: number | null) {
  const savedCallback = useRef<any>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const currentCallback = savedCallback.current;
      if (currentCallback) {
        currentCallback();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
