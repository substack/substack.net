return function (t) {
  return (Math.sin(Math.PI * 2 * 100 * t)
    + Math.sin(Math.PI * 2 * 115 * t)
  ) * Math.sin(Math.PI * 2 * t * 0.125);
};
