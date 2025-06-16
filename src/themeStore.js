const spacing = {};
const sizing = {};

for (let i = 1; i <= 20; i++) {
  const value = (0.25 * i).toFixed(2) + 'rem';
  spacing[i] = value;
  sizing[i] = value;
}

export default { spacing, sizing };
