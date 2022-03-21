import { useEffect, useState } from "react";

type Props = {
  position: { x: number; y: number; z: number };
};

const QueryParams = ({ position }: Props) => {
  const [timeout, setTimeout] = useState(-1);

  useEffect(() => {
    clearTimeout(timeout);

    const timeoutId = window.setTimeout(() => {
      const { x, y, z } = position;
      window.history.pushState({}, "", `?${x},${y},${z}`);
    }, 100);

    setTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return null;
};

export default QueryParams;
